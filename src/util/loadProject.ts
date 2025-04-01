// import { PgRowType, project } from "ponder:schema";

// type Args = {
//   projectId: bigint;
//   context: {
//     network: {
//       chainId: number;
//     };
//     db: {
//       find: (
//         _project: typeof project,
//         { chainId, projectId }: { chainId: number; projectId: bigint }
//       ) => Promise<PgRowType<typeof project> | null>;
//     };
//   };
// };

// export const loadProject = async ({ projectId, context }: Args) =>
//   await context.db.find(project, {
//     chainId: context.network.chainId,
//     projectId,
//   });
