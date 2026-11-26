import { describe, it, expect } from "vitest";
import { createRollTemplate } from "./rolltemplates";

// 3d6 = 2+2+3 (Stunt Die 3) + Willpower 1 = 8
const components = () => [
  { label: "Base Roll", sides: 6, count: 3, value: 7, dice: [2, 2, 3] },
  { label: "Willpower", value: 1 },
];

const render = (targetNumber?: number) =>
  createRollTemplate({
    type: "roll",
    parameters: {
      title: "Gate",
      subtitle: "Price Test",
      rollType: "priceTest",
      targetNumber,
      components: components(),
    },
  });

describe("priceTest roll template", () => {
  it("names the Stunt Die on a failure against the Price Test TN", () => {
    const html = render(12);
    expect(html).toContain("Price Test failed");
    expect(html).toContain("Stunt Die 3");
    expect(html).toContain("Price Effects table");
  });

  it("shows no price on a success", () => {
    const html = render(8);
    expect(html).toContain("Price Test passed");
    expect(html).not.toContain("Price Effects table");
  });

  it("shows the Stunt Die without pass/fail when no TN is set", () => {
    const html = render(undefined);
    expect(html).not.toContain("Price Test passed");
    expect(html).not.toContain("Price Test failed");
    expect(html).toContain("Stunt Die 3");
  });
});
