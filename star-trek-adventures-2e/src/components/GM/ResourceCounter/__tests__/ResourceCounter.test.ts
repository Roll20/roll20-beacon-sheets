import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { cleanup, render } from "@testing-library/vue";
import { beforeEach, describe, expect, it } from "vitest";
import { reactive } from "vue";
import { ResourceCounter } from "..";
import { type ResourceCounterProps } from "../ResourceCounter.vue";

type RenderProps = Partial<ResourceCounterProps>;
type Emit = {key: string, value: number}

const doRender = ({
  id = "test-id",
  label = "Test Label",
  modelValue = {value: 0}
}: RenderProps = {}) => {
  const mounted = render(ResourceCounter, {
    props: {
      id,
      label,
      modelValue
    }
  })
  return mounted
}

const valueCheck = async (node: HTMLInputElement, value: any) => {
  expect(node.value).to.equal(value);
};

describe("ResourceCounter", () => {
  beforeEach(() => {
    cleanup();
  });
  it("should mount", () => {
    doRender()
    screen.getByTestId("resource-counter")
  })
  it("should display an input modelling the value it was given", async () => {
    const testReactive = reactive({
      value: 0
    })
    doRender({modelValue: testReactive});
    const input = screen.getByRole("spinbutton") as HTMLInputElement
    await valueCheck(input, "0")
    await userEvent.click(input);
    await userEvent.keyboard("12")
    await valueCheck(input, "12");
  })
  it("should emit the new value when the value changes", async () => {
    const testReactive = reactive({
      value: 0
    })
    const component = doRender({modelValue: testReactive});
    const input = screen.getByRole("spinbutton") as HTMLInputElement
    await userEvent.click(input);
    await userEvent.keyboard("10")
    const emits = component.emitted()["update:modelValue"] as Emit[][];
    expect(emits.length).toBe(2)
    expect(emits[1][0]).toStrictEqual({key: "value", value: 10})
  })
  it("should emit an increase of one to the value when the add button is clicked", async () => {
    const component = doRender();
    const addButton = screen.getByRole("button", {name: "add"})
    await userEvent.click(addButton)
    const emits = component.emitted()["update:modelValue"] as Emit[][];
    expect(emits[0][0]).toStrictEqual({key: "value", value: 1})
  })
  it("should emit a decrease of one to the value when the add button is clicked", async () => {
    const component = doRender();
    const minusButton = screen.getByRole("button", {name: "subtract"})
    await userEvent.click(minusButton)
    const emits = component.emitted()["update:modelValue"] as Emit[][];
    expect(emits[0][0]).toStrictEqual({key: "value", value: -1})
  })
})
