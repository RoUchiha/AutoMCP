import { describe, expect, it } from "vitest";
import { compileProject } from "@/lib/compiler";
import { createSampleSpec } from "@/lib/spec";

describe("MCP compiler", () => {
  it("compiles an SDK server with tool, resource, prompt, tests, and README", () => {
    const files = compileProject(createSampleSpec()).files;
    expect(files["src/server.ts"]).toContain("@modelcontextprotocol/sdk");
    expect(files["tests/server.test.ts"]).toContain("describe");
    expect(files["README.md"]).toContain("stdio");
    expect(files["automcp.manifest.json"]).toContain("search_products");
  });
});
