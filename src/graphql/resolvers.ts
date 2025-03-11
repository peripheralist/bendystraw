import { QUERY_NAMES } from "@/constants/queryNames";
import {
  camelToSnakeCase,
  idOfChainName,
  nameOfChainId,
  snakeToCamelCase,
} from "@/utils";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) throw new Error("Missing URL or KEY");

const FILTER_SUFFIXES = [
  "_in",
  "_lt",
  "_lte",
  "_gt",
  "_gte",
  "_contains",
  "_ends_with",
  "_starts_with",
  "_not",
  "_starts_with_nocase",
  "_ends_with_nocase",
  "_not_in",
] as const;

const supabase = createClient(url, key);

type QueryArgs = Partial<{
  where: Record<string, object | Array<string | number> | string | number>;
  first: number;
  skip: number;
  orderBy: string;
  orderDirection: "asc" | "desc";
}>;

function formatKV(k: string, v: Required<QueryArgs>["where"][string]) {
  let _k = k;
  let _v = v;

  if (_k === "chain") {
    _v = (
      Array.isArray(v)
        ? v.map((chainId) => nameOfChainId(chainId))
        : nameOfChainId(v as number)
    )!;

    _k = "_gs_chain";

    if (_v === undefined) {
      throw new Error("Error formatting where value");
    }
  }

  return [_k, _v] as const;
}

const builQueryHandler =
  <T extends string = "*">(queryName: (typeof QUERY_NAMES)[number]) =>
  async (_: unknown, args: QueryArgs) => {
    const { where, first, skip, orderBy, orderDirection } = args;

    let select = "*";

    switch (queryName) {
      case "projectEvents":
        select +=
          ", pay_event:pay_events(*), mint_tokens_event:mint_tokens_events(*)";
        break;
      case "projects":
        select += ", pay_events(*), mint_tokens_events(*), project_events(*)";
        break;
      case "nftTiers":
        select += ", nft_tiers(*)";
        break;
    }

    // Start a Supabase query
    // queryName must match table name
    let query = supabase
      .from(camelToSnakeCase(queryName))
      .select<T>(select as T);

    if (where) {
      Object.entries(where).forEach(([k, v]) => {
        if (FILTER_SUFFIXES.some((suffix) => k.endsWith(suffix))) {
          // If k ends in suffix, process suffix
          FILTER_SUFFIXES.forEach((suffix) => {
            if (k.endsWith(suffix)) {
              const kShort = camelToSnakeCase(k.split(suffix)[0]);

              const [_k, _v] = formatKV(kShort, v);

              switch (suffix) {
                case "_contains":
                  if (!Array.isArray(_v)) {
                    throw new Error("_contains argument must be an array");
                  }
                  query = query.contains(_k, _v);
                  return;
                case "_ends_with":
                  query = query.ilike(_k, `%${_v}`);
                  return;
                case "_ends_with_nocase":
                case "_starts_with_nocase":
                  throw new Error("_nocase not supported");
                case "_gt":
                  query = query.gt(_k, _v);
                  return;
                case "_gte":
                  query = query.gte(_k, _v);
                  return;
                case "_in":
                  if (!Array.isArray(_v)) {
                    throw new Error("_in argument must be an array");
                  }
                  query = query.in(_k, _v);
                  return;
                case "_lt":
                  query = query.lt(_k, _v);
                  return;
                case "_lte":
                  query = query.lte(_k, _v);
                  return;
                case "_not":
                  query = query.neq(_k, _v);
                  return;
                case "_not_in":
                  throw new Error("_not_in not supported");
                case "_starts_with":
                  query = query.ilike(_k, `${_v}%`);
                  return;
              }
            }
          });
        } else {
          const [_k, _v] = formatKV(k, v);

          query = query.eq(_k, _v);
        }
      });
    }

    // Sort / orderBy
    if (orderBy) {
      query = query.order(orderBy, {
        ascending: orderDirection !== "desc",
      });
    }

    // Pagination
    // The Graph’s "first" & "skip" typically do limit/offset
    if (first) {
      if (skip) {
        query = query.range(skip, skip + first - 1);
      } else {
        // if skip not provided
        query = query.limit(first);
      }
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data.map((d) =>
      Object.entries(d!).reduce(
        (acc, [key, value]) => ({
          ...acc,
          // convert property names to camelCase
          [snakeToCamelCase(key)]: value,
        }),
        {
          // add chain property
          chain: idOfChainName((d as { _gs_chain: string })._gs_chain),
        }
      )
    );
  };

const Query = QUERY_NAMES.reduce(
  (acc, name) => ({
    ...acc,
    [name]: builQueryHandler(name),
  }),
  {}
);

const resolvers = {
  Query,
};

export default resolvers;
