import {
  AdvancementTypeValue,
  AttributeValue,
  DepartmentValue,
  ValueInvocationValue,
} from '@/system/gameTerms';
import { nanoid } from 'nanoid';
import { reactive } from 'vue';

export interface CharacterValues {
  [key: string]: string[];
}

export interface MilestoneGraphParts {
  startingValues?: CharacterValues;
}

export interface LogEntryDetails {
  /** index to find the correlating value step from the invoked value path in a `MilestoneGraph`'s `characterValues` property */
  index: number;
  /** The way the related value was invoked, per Milestone Entry directions (CRB p. 166) */
  invocation: ValueInvocationValue;
  /** The new value, only present if `invocation` is equal to `!` (Challenged) */
  newValueStep?: string;
}

type Adjustment<T> = {
  from: T;
  to: T;
};

export type AdvancementEntry = {
  type: AdvancementTypeValue;
  /**
   * The Value Steps invoked in this log entry (CRB p. 166)
   *
   * Keys correlate to entries in a MilestoneGraph's `characterValues` property,
   * Values are the details of how that Value relates to the log entry
   */
  valueSteps: Record<string, LogEntryDetails>;
  /** whether this entry has been used for a milestone/character arc (CRB p. 167-169) */
  used: boolean;
} & {
  type: 'Log';
  adjustment: Adjustment<AttributeValue> | Adjustment<DepartmentValue>;
};

export class MilestoneGraph {
  /**
   * Collection of a character's values. Each entry is a single "Path", which reflects how a character's
   * values change through character advancement. Each individual value on that path is referred to as a
   * step throughout this sheet.
   */
  public characterValues = reactive<Map<string, string[]>>(new Map([]));
  /**
   * collection of a character's personal logs, milestones, and character arcs
   */
  public characterLogs = reactive<Map<string, AdvancementEntry>>(new Map([]));

  constructor({ startingValues = {} }: MilestoneGraphParts = {}) {
    const startingValueEntries = Object.entries(startingValues);
    for (let i = 0; i < startingValueEntries.length; i++) {
      const [key, valuePath] = startingValueEntries[i];
      this.characterValues.set(key, valuePath);
    }
  }

  addValuePath(id = nanoid()) {
    this.characterValues.set(id, ['']);
  }
  removeValuePath(id: string) {
    this.characterValues.delete(id);
  }
  getLatestValueStep(id: string) {
    const path = this.characterValues.get(id);
    if (!path) return;
    return path[path.length - 1];
  }
  addNewValueStep(id: string) {
    const path = this.characterValues.get(id);
    if (!path) this.characterValues.set(id, ['']);
    else path.push('');
  }
  removeLatestValueStep(id: string) {
    const path = this.characterValues.get(id);
    if (!path) return;
    path.pop();
  }
}
