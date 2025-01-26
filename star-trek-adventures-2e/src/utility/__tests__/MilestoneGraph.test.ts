import { describe, expect, it } from "vitest";
import { CharacterValues, MilestoneGraph } from "../MilestoneGraph";

const firstValuePath = ["this", "is", "an", "example"];
const secondValuePath = ["so", "is", "this"]

describe("MilestoneGraphs", () => {
  describe("Character Values", () => {
    it("should store a given set of valuePaths", () => {
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
    it("should support adding a new valuePath", () => {
      const graph = new MilestoneGraph();
      expect(graph.characterValues.size).toBe(0);
      graph.addValuePath("test")
      expect(graph.characterValues.size).toBe(1)
      expect(graph.characterValues.get("test")).toEqual([""])
    })
    it("should support removing a specified valuePath", () => {
      const graph = new MilestoneGraph({ startingValues: { "test": ["a", "path"] } });
      expect(graph.characterValues.get("test")).toEqual(["a", "path"]);
      graph.removeValuePath("test");
      expect(graph.characterValues.get("test")).toBeUndefined()
    })
    it("should be able to provide the latest step in a specified valuePath", () => {
      const graph = new MilestoneGraph({ startingValues: { "test": firstValuePath } });
      expect(graph.getLatestValue("test")).toBe("example")
    })
    it("should support removing a step from a specified valuePath", () => {
      const graph = new MilestoneGraph({ startingValues: { "test": secondValuePath } });
      expect(graph.getLatestValue("test")).toBe("this")
      graph.removeLatestValue("test")
      expect(graph.getLatestValue("test")).toBe("is")
    })
  })
})