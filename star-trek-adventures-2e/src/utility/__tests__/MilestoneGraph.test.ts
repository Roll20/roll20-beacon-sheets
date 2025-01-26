import { describe, expect, it } from "vitest";
import { CharacterValues, MilestoneGraph, MilestoneGraphParts } from "../MilestoneGraph";

describe("MilestoneGraphs", () => {
  it("should store a given set of valuePaths", () => {
    const firstValuePath = ["this", "is", "an", "example"];
    const secondValuePath = ["so", "is", "this"]
    const startingValues: CharacterValues = {
      "test1": firstValuePath,
      "test2": secondValuePath
    }
    const graph = new MilestoneGraph({ startingValues })
    expect([...graph.characterValues.entries()]).toEqual([
      ["test1", firstValuePath],
      ["test2", secondValuePath]
    ])
  })
  it("should support adding new valuePath", () => {
    const graph = new MilestoneGraph();
    expect(graph.characterValues.size).toBe(0);
    graph.addValuePath("test")
    expect(graph.characterValues.size).toBe(1)
    expect(graph.characterValues.get("test")).toEqual([""])
  })
  it("should support removing a valuePath", () => {
    const graph = new MilestoneGraph({ startingValues: { "test": ["a", "path"] } });
    expect(graph.characterValues.get("test")).toEqual(["a", "path"]);
    graph.removeValuePath("test");
    expect(graph.characterValues.get("test")).toBeUndefined()
  })
})