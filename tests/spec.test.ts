import { describe, expect, it } from "vitest";
import { createSampleSpec, parseSpec } from "@/lib/spec";

describe("AutoMcpSpec", () => {
  it("defaults a project to Core capabilities and Hybrid deployment", () => {
    const spec = createSampleSpec();
    expect(spec.advancedCapabilities).toBe(false);
    expect(spec.deploymentMode).toBe("hybrid");
  });

  it("rejects a plaintext credential value", () => {
    expect(() => parseSpec({ ...createSampleSpec(), credential: { value: "secret" } })).toThrow();
  });
});
