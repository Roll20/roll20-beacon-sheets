import { nanoid } from "nanoid";
import { reactive } from "vue";

export interface CharacterValues {
  [key: string]: string[]
}

export interface MilestoneGraphParts {
  startingValues?: CharacterValues
}

export class MilestoneGraph {
  public characterValues = reactive<Map<string, string[]>>(new Map([]))

  constructor({ startingValues = {} }: MilestoneGraphParts = {}) {
    const startingValueEntries = Object.entries(startingValues);
    for (let i = 0; i < startingValueEntries.length; i++) {
      const [key, valuePath] = startingValueEntries[i];
      this.characterValues.set(key, valuePath)
    }
  }

  addValuePath(id = nanoid()) {
    this.characterValues.set(id, [""]);
  }
  removeValuePath(id: string) {
    this.characterValues.delete(id);
  }
}