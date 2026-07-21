import { describe, expect, it } from "vitest";
import { recommendCapabilities } from "@/lib/planner";

describe("capability planner", () => {
  it("recommends a search tool and catalog resource from user intent", () => {
    expect(recommendCapabilities("Search the product catalog and read a product by id")).toEqual(
      expect.arrayContaining(["tool:search_catalog", "resource:product"]),
    );
  });
});
