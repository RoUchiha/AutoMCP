import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "@/lib/policy";
import { createSampleSpec } from "@/lib/spec";

describe("MCP source and capability policy", () => {
  it("blocks private and local source hosts", () => {
    const report = evaluatePolicy({ ...createSampleSpec(), source: { kind: "rest", label: "local", url: "http://127.0.0.1/admin" } });
    expect(report.allowed).toBe(false);
    expect(report.findings[0]?.code).toBe("SOURCE_NOT_PUBLIC_HTTPS");
  });

  it("requires Advanced mode for a job capability", () => {
    const report = evaluatePolicy({ ...createSampleSpec(), capabilities: ["tool", "job"] });
    expect(report.findings.some((finding) => finding.code === "ADVANCED_CAPABILITY_DISABLED")).toBe(true);
  });
});
