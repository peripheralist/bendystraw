import { QUERY_NAMES } from "@/constants/queryNames";
import { camelToSnakeCase, formatChain, snakeToCamelCase } from "@/utils";
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

const builQueryHandler =
  (queryName: string) => async (_: unknown, args: QueryArgs) => {
    const { where, first, skip, orderBy, orderDirection } = args;

    // Start a Supabase query
    // queryName must match table name
    let query = supabase
      .from(`juicebox_${camelToSnakeCase(queryName)}`)
      .select("*");

    if (where) {
      Object.entries(where).forEach(([k, v]) => {
        FILTER_SUFFIXES.forEach((suffix) => {
          if (k.endsWith(suffix)) {
            const _k = camelToSnakeCase(k.split(suffix)[0]);

            switch (suffix) {
              case "_contains":
                if (!Array.isArray(v)) {
                  throw new Error("_contains argument must be an array");
                }
                query = query.contains(_k, v);
                return;
              case "_ends_with":
                query = query.ilike(_k, `%${v}`);
                return;
              case "_ends_with_nocase":
              case "_starts_with_nocase":
                throw new Error("_nocase not supported");
              case "_gt":
                query = query.gt(_k, v);
                return;
              case "_gte":
                query = query.gte(_k, v);
                return;
              case "_in":
                if (!Array.isArray(v)) {
                  throw new Error("_in argument must be an array");
                }
                query = query.in(_k, v);
                return;
              case "_lt":
                query = query.lt(_k, v);
                return;
              case "_lte":
                query = query.lte(_k, v);
                return;
              case "_not":
                query = query.neq(_k, v);
                return;
              case "_not_in":
                throw new Error("_not_in not supported");
              case "_starts_with":
                query = query.ilike(_k, `${v}%`);
                return;
            }
          }
        });
      });
    }

    // 3) Sort / orderBy
    if (orderBy) {
      query = query.order(orderBy, {
        ascending: orderDirection !== "desc",
      });
    }

    // 4) Pagination
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
      Object.entries(d).reduce(
        (acc, [key, value]) => ({
          ...acc,
          // convert property names to camelCase
          [snakeToCamelCase(key)]: value,
        }),
        {
          // add chain property
          chain: formatChain(d._gs_chain),
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
