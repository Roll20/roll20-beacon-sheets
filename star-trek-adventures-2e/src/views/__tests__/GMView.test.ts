import { beforeEach, describe, expect, it, vi } from "vitest";
import GMView from "../GMView.vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";
import { useGMStore } from "@/sheet/stores/gmStore/gmStore";

const mocks = vi.hoisted(() => ({
  initValues: {
    "id": "-OC2OejKpN73CDracHa_",
    "character": {
        "id": "-OC2OejKpN73CDracHa_",
        "name": "Lenaris D'Myrra",
        "avatar": "",
        "attributes": {
            "gm": {
                "localSheetID": "-OC2OejKpN73CDracHa_",
                "momentum": 2,
                "threat": 2
            },
            "roll": {
                "rolls": {
                    "Other Science!": {
                        "attribute": "REASON",
                        "department": "SCIENCE"
                    }
                }
            },
            "stats": {
                "COMMAND": {
                    "base": 2,
                    "label": "Command"
                },
                "CONN": {
                    "base": 2,
                    "label": "Conn"
                },
                "CONTROL": {
                    "base": 9,
                    "label": "Control"
                },
                "DARING": {
                    "base": 9,
                    "label": "Daring"
                },
                "ENGINEERING": {
                    "base": 2,
                    "label": "Engineering"
                },
                "FITNESS": {
                    "base": 8,
                    "label": "Fitness"
                },
                "INSIGHT": {
                    "base": 11,
                    "label": "Insight"
                },
                "MEDICINE": {
                    "base": 4,
                    "label": "Medicine"
                },
                "PRESENCE": {
                    "base": 10,
                    "label": "Presence"
                },
                "REASON": {
                    "base": 10,
                    "label": "Reason"
                },
                "SCIENCE": {
                    "base": 4,
                    "label": "Science"
                },
                "SECURITY": {
                    "base": 2,
                    "label": "Security"
                }
            },
            "ui": null,
            "updateId": "69b1635d-6115-481c-90c2-d788dd4e66dc"
        },
        "bio": null,
        "gmNotes": null,
        "token": {
            "name": "Lenaris D'Myrra",
            "represents": "-OC2OejKpN73CDracHa_",
            "imgsrc": "/images/character.png",
            "width": 70,
            "height": 70,
            "layer": "objects"
        }
    },
    "settings": {
        "colorTheme": "dark",
        "language": "en",
        "gm": true,
        "owned": true,
        "headless": false,
        "sandbox": false,
        "settingsSheet": false,
        "singleSheet": false,
        "environment": "VTT",
        "discordActivityClientId": "1199271093882589195",
        "campaignId": 17521251,
        "currentUserId": "11818687"
    },
    "sharedSettings": {
        "momentum": 4,
        "threat": 2,
        "gmID": "-O6EOAgXKX_6FD6z3pTm"
    },
    "compendiumDrop": null
  },
}))

vi.mock("@/relay/relay", () => ({
  initValues: mocks.initValues,
}))

const doRender = () => {
  const mounted = render(GMView, {})
  return mounted
}

describe("GM View", () => {
  beforeEach(() => {
    cleanup();
    setActivePinia(
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        stubPatch: false,
      })
    );
    mocks.initValues.settings.gm = false;
  })

  it("should show displays when the sheet is not registered as a GM", async () => {
    doRender();
    await screen.findByTestId("momentum-display");
    const momentum_input = await screen.queryByTestId("momentum-input");
    expect(momentum_input).toBeNull()
    await screen.findByTestId("threat-display");
    const threat_input = await screen.queryByTestId("threat-input");
    expect(threat_input).toBeNull()
  })
  it("should show inputs when I have gm permissions", async () => {
    const gmStore = useGMStore();
    gmStore.localSheetID = "sheet!"
    mocks.initValues.sharedSettings.gmID = "sheet!";
    doRender();
    await screen.findByTestId("momentum-input");
    const momentum_display = await screen.queryByTestId("momentum-display");
    expect(momentum_display).toBeNull()
    await screen.findByTestId("threat-input");
    const threat_display = await screen.queryByTestId("threat-display");
    expect(threat_display).toBeNull()
  })
})