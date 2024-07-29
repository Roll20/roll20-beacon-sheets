import { AttributeModifier, useAttributeStore } from "@/sheet/stores/attributeStore/attributeStore";
import { useUIStore } from "@/sheet/stores/uiStore/uiStore";
import { AttributesEnum } from "@/system/gameTerms";
import { getOperationSymbol } from "@/utility/getSymbols";
import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/vue";
import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import AttributeInterface, { type AttributeInterfaceProps } from "../AttributeInterface.vue";

type RenderProps = Partial<AttributeInterfaceProps>

const doRender = ({
  attribute = "CONTROL"
}: RenderProps = {}) => {
  const mounted =render(AttributeInterface, {
    props: {
      attribute
    }
  })
  return mounted
}

describe("AttributeInterface", () => {
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

  it("should reactively display an attribute's total from the store in view mode", async () => {
    const attributeStore = useAttributeStore();
    attributeStore.fields.CONTROL.base = 4;
    doRender();
    const total = screen.getByRole("spinbutton") as HTMLInputElement
    expect(Number(total.value)).toBe(attributeStore.CONTROL)
    attributeStore.fields.CONTROL.base = 2;
    await nextTick();
    expect(Number(total.value)).toBe(attributeStore.CONTROL);
  })

  it("should provide an input for the attribute's base value when in edit mode", () => {
    const attributeStore = useAttributeStore()
    const uiStore = useUIStore()
    Object.assign(attributeStore.fields.CONTROL, {
      base: 2,
      modifiers: [{
        value: 2,
        operation: "ADD"
      }]
    })
    uiStore.editMode = true;
    doRender();
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(Number(input.value)).toBe(attributeStore.fields.CONTROL.base)
  })

  it("should have a button in edit mode that changes the active edit modifier view", 
    async () => {
    const uiStore = useUIStore();
    uiStore.editMode = true;
    doRender()
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(uiStore.modifyingStat).toBe("CONTROL")
  })

  describe("Modifiers Tooltip", () => {
    it("should display a tooltip when the modifier button is hovered over or focused", async () => {
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      screen.getByTestId("modifiers-tooltip");
    })
    it("should display an empty message when no modifiers are present", async () => {
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doRender();
      const button = screen.getByRole("button");
      await userEvent.hover(button);
      const modifierEntries = screen.getAllByRole("listitem")
      expect(modifierEntries.length).toBe(1)
      const entryNote = screen.getByTestId("popover-modifier-0-note")
      expect(entryNote.textContent).toBe(`No ${AttributesEnum.CONTROL} Modifiers. Click to add some!`)
    })
    it("should display each modifiers for the attribute it represents", async () => {
      const attributeStore = useAttributeStore();
      const modifiers: AttributeModifier[] = [
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
      Object.assign(attributeStore.fields.CONTROL, {
        base: 2,
        modifiers
      })
      const uiStore = useUIStore();
      uiStore.editMode = true;
      doRender();
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
    })
  })
})