import { cleanup, render, screen } from "@testing-library/vue"
import TheReadout from "../TheReadout.vue"
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";
import { nextTick } from "vue";
import userEvent from "@testing-library/user-event";

const doRender = () => {
  const mounted = render(TheReadout, {})
  return mounted
};

describe("TheReadout", () => {
  beforeEach(() => {
    cleanup();
    setActivePinia(
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        stubPatch: false,
      })
    )
  })

  it("should reactively display the active stats, or show nothing if stat is undefined", async () => {
    const rollStore = useRollStore();
    doRender();

    expect(screen.queryByLabelText("Department")).toBeNull();
    expect(screen.queryByLabelText("Attribute")).toBeNull();
    expect(screen.queryByLabelText("Focus")).toBeNull();

    rollStore.activeStats.department = "CONN";
    await nextTick();
    const department = screen.getByLabelText("Department") as HTMLInputElement
    expect(department.value).toBe("Conn")

    rollStore.activeStats.attribute = "DARING";
    await nextTick();
    const attribute = screen.getByLabelText("Attribute") as HTMLInputElement
    expect(attribute.value).toBe("Daring")

    rollStore.activeStats.focus = "Warp Field Mechanics";
    await nextTick();
    const focus = screen.getByLabelText("Focus") as HTMLInputElement
    expect(focus.value).toBe("Warp Field Mechanics");
  });

  it("should have a button that clears the active attributes", async () => {
    const rollStore = useRollStore();
    rollStore.activeStats.department = "CONN";
    rollStore.activeStats.attribute = "DARING";
    rollStore.activeStats.focus = "Warp Field Mechanics";
    doRender();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(rollStore.activeStats).toStrictEqual({})
  })

  it("should have a roll button that rolls an assembled roll", async () => {
    
  })
})

