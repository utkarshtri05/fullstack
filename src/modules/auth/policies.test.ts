import { describe, expect, it } from "vitest";
import { canAccessAdmin, canAccessOwnResource } from "./policies";

describe("auth policies", () => {
  it("allows only admins into admin surfaces", () => {
    expect(canAccessAdmin({ role: "admin" })).toBe(true);
    expect(canAccessAdmin({ role: "user" })).toBe(false);
  });

  it("allows resource owners and admins to access owned resources", () => {
    expect(canAccessOwnResource({ userId: "user-1", role: "user" }, "user-1")).toBe(true);
    expect(canAccessOwnResource({ userId: "user-1", role: "user" }, "user-2")).toBe(false);
    expect(canAccessOwnResource({ userId: "admin-1", role: "admin" }, "user-2")).toBe(true);
  });
});
