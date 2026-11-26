import { describe, it, expect, vi } from "vitest";
import {
  getMagicPoints,
  getPsychicPoints,
  setEldritchPoints,
  setMagic,
} from "./computed";

const character = (stored: Record<string, number>) =>
  ({ id: "c1", attributes: { character: { character: stored } } }) as any;

describe("power pool token bars", () => {
  it("reads current and max for each pool", () => {
    const c = character({ magic: 3, magicMax: 10, psychicPoints: 2, psychicPointsMax: 6 });
    expect(getMagicPoints({ character: c })).toEqual({ current: 3, max: 10 });
    expect(getPsychicPoints({ character: c })).toEqual({ current: 2, max: 6 });
  });

  it("applies relative changes to the right field", () => {
    const dispatch = { update: vi.fn() } as any;
    setEldritchPoints({ character: character({ eldritchPoints: 5 }), dispatch }, "-2");
    expect(dispatch.update).toHaveBeenCalledWith({
      character: {
        id: "c1",
        attributes: { updateId: "TOKENCHANGE", character: { character: { eldritchPoints: 3 } } },
      },
    });
  });

  it("keeps the magic setter's absolute behaviour", () => {
    const dispatch = { update: vi.fn() } as any;
    setMagic({ character: character({ magic: 5 }), dispatch }, 8);
    expect(dispatch.update.mock.calls[0][0].character.attributes.character.character).toEqual({ magic: 8 });
  });
});
