import { StatModifier, useStatsStore } from "@/sheet/stores/statsStore/statsStore";
import { useUIStore } from "@/sheet/stores/uiStore/uiStore";
import { AttributeKey, AttributesEnum, DepartmentKey } from "@/system/gameTerms";
import { getOperationSymbol } from "@/utility/getSymbols";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/vue";
import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import StatInterface, { type StatInterfaceProps } from "../StatInterface.vue";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";

type AttributeRenderProps = Partial<StatInterfaceProps> & {
  stat?: AttributeKey
}
type DepartmentRenderProps = Partial<StatInterfaceProps> & {
  stat?: DepartmentKey
}

const doAttributeRender = ({
  stat: attribute = "CONTROL"
}: AttributeRenderProps = {}) => {
  const mounted = render(StatInterface, {
    props: {
      stat: attribute
    }
  })
  return mounted
}
const doDepartmentRender = ({
  stat: department = "COMMAND"
}: DepartmentRenderProps = {}) => {
  const mounted =render(StatInterface, {
    props: {
      stat: department
    }
  })
  return mounted
}

describe("StatInterface", () => {
  beforeEach(() => {
    cleanup();
    setActivePinia(
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        stubPatch: false,
      }),
    );
  })

  it("should have a button in edit mode that changes the active edit modifier view", 
    async () => {
    const uiStore = useUIStore();
    uiStore.editMode = true;
    doAttributeRender()
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(uiStore.modifyingStat).toBe("CONTROL")
  })

  describe("Tooltip Interface", () => {
    it("should display a tooltip when the modifier button is hovered over or focused", async () => {
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doAttributeRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      screen.getByTestId("modifiers-tooltip");
    })
    it("should display an empty message when no modifiers are present", async () => {
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doAttributeRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      const modifierEntries = screen.getAllByRole("listitem")
      expect(modifierEntries.length).toBe(1)
      const entryNote = screen.getByTestId("popover-modifier-0-note")
      expect(entryNote.textContent).toBe(`No ${AttributesEnum.CONTROL} Modifiers. Click to add some!`)
    })
  })  

  describe("Attributes", () => {
    it("should reactively display an attribute's total from the store in view mode", async () => {
      const statsStore = useStatsStore();
      statsStore.attributeFields.CONTROL.base = 4;
      doAttributeRender();
      const total = screen.getByTestId("stat-view-total");
      expect(Number(total.textContent)).toBe(statsStore.CONTROL)
      statsStore.attributeFields.CONTROL.base = 2;
      await nextTick();
      expect(Number(total.textContent)).toBe(statsStore.CONTROL);
    })
    it("should provide an input for the attribute's base value when in edit mode", () => {
      const statsStore = useStatsStore();
      const uiStore = useUIStore()
      Object.assign(statsStore.attributeFields.CONTROL, {
        base: 2,
        modifiers: [{
          value: 2,
          operation: "ADD"
        }]
      })
      uiStore.editMode = true;
      doAttributeRender();
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(Number(input.value)).toBe(statsStore.attributeFields.CONTROL.base)
    })
    it("should display each modifier for the attribute it represents", async () => {
      const statsStore = useStatsStore();
      const modifiers: StatModifier[] = [
        {
          value: 2,
          operation: "ADD",
          note: "test-mod-1"
        },
        {
          value: 3,
          operation: "SUBTRACT",
          note: "test-mod-2"
        },
        {
          value: 3,
          operation: "MULTIPLY",
          note: "test-mod-3"
        },
      ]
      Object.assign(statsStore.attributeFields.CONTROL, {
        base: 2,
        modifiers
      })
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doAttributeRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      const modifierEntries = screen.getAllByRole("listitem")
      expect(modifierEntries.length).toBe(3)
      modifierEntries.forEach((modifier, index) => {
        expect((modifier.children[0] as HTMLElement).textContent)
          .toBe(`${getOperationSymbol(modifiers[index].operation)}${modifiers[index].value}`)
        expect((modifier.children[1] as HTMLElement).textContent)
          .toBe(`${modifiers[index].note}`)
      })
    });
    it("should change the active attribute being rolled when clicked in view mode", async () => {
      const rollStore = useRollStore();
      doAttributeRender();
      const button = screen.getByRole("button")
      await userEvent.click(button)
      expect(rollStore.activeStats.attribute).toBe("CONTROL")
    })
  })

  describe("Departments", () => {
    it("should reactively display a departments's total from the store in view mode ", async () => {
      const statsStore = useStatsStore();
      statsStore.departmentFields.COMMAND.base = 4;
      doDepartmentRender();
      const total = screen.getByTestId("stat-view-total");
      expect(Number(total.textContent)).toBe(statsStore.COMMAND)
      statsStore.departmentFields.COMMAND.base = 2;
      await nextTick();
      expect(Number(total.textContent)).toBe(statsStore.COMMAND);
    });
    it("should provide an input for the department's base value when in edit mode", () => {
      const statsStore = useStatsStore();
      const uiStore = useUIStore()
      Object.assign(statsStore.departmentFields.COMMAND, {
        base: 2,
        modifiers: [{
          value: 2,
          operation: "ADD"
        }]
      })
      uiStore.editMode = true;
      doDepartmentRender();
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(Number(input.value)).toBe(statsStore.departmentFields.COMMAND.base)
    })
    it("should display each modifier for the department it represents", async () => {
      const statsStore = useStatsStore();
      const modifiers: StatModifier[] = [
        {
          value: 2,
          operation: "ADD",
          note: "test-mod-1"
        },
        {
          value: 3,
          operation: "SUBTRACT",
          note: "test-mod-2"
        },
        {
          value: 3,
          operation: "MULTIPLY",
          note: "test-mod-3"
        },
      ]
      Object.assign(statsStore.departmentFields.COMMAND, {
        base: 2,
        modifiers
      })
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doDepartmentRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      const modifierEntries = screen.getAllByRole("listitem")
      expect(modifierEntries.length).toBe(3)
      modifierEntries.forEach((modifier, index) => {
        expect((modifier.children[0] as HTMLElement).textContent)
          .toBe(`${getOperationSymbol(modifiers[index].operation)}${modifiers[index].value}`)
        expect((modifier.children[1] as HTMLElement).textContent)
          .toBe(`${modifiers[index].note}`)
      })
    });
    it("should change the active attribute being rolled when clicked in view mode", async () => {
      const rollStore = useRollStore();
      doDepartmentRender();
      const button = screen.getByRole("button")
      await userEvent.click(button)
      expect(rollStore.activeStats.department).toBe("COMMAND")
    })
  })
})