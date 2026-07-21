import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";

describe("workspace", () => {
  it("declares the Signal Room product title", () => {
    expect(metadata.title).toBe("AutoMCP — Signal Room");
  });
});
