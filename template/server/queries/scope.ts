import { eq, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { scopeOf, type SessionUser } from "@/lib/rbac";

const NOTHING = sql`false`;

/**
 * Row-level scope for one area of records. Every list and detail query of that area applies it:
 * `all` sees everything, `team` the rows whose team column is the user's team, `own` the rows whose
 * owner column is the user. A scope the area has no column for sees nothing.
 */
export function rowScope(
  user: SessionUser,
  area: string,
  cols: { team?: AnyPgColumn; owner?: AnyPgColumn },
): SQL | undefined {
  switch (scopeOf(user, area)) {
    case "all":
      return undefined;
    case "team":
      return cols.team && user.teamId ? eq(cols.team, user.teamId) : NOTHING;
    case "own":
      return cols.owner ? eq(cols.owner, user.id) : NOTHING;
    default:
      return NOTHING;
  }
}
