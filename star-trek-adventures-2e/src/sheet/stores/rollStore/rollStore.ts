import { isAttributeKey, isDepartmentKey, type AttributeKey, type DepartmentKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { useStatsStore } from "../statsStore/statsStore";
import { dispatchRef } from "@/relay/relay";
import { type Dispatch } from "@roll20-official/beacon-sdk";
import { resourceUsage } from "process";
import { createRollTemplate } from "@/rolltemplates/rolltemplates";
import { useMetaStore } from "../meta/metaStore";

export type ActiveStats = {
  attribute?: AttributeKey;
  department?: DepartmentKey;
  focus?: string;
}

export type PreparedRollStats = ActiveStats & {
  attribute: AttributeKey;
  department: DepartmentKey;
}

const checkPrepared = (stats: ActiveStats): stats is PreparedRollStats => {
  if (!(stats.attribute && stats.department)) return false;
  const isValid = (isAttributeKey(stats.attribute) && isDepartmentKey(stats.department))
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`)
    return false
  }
  return true
}

export const useRollStore = defineStore("roll", () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const activeStats = reactive<ActiveStats>({});

  const targetNumber = computed(() => {
    if (!checkPrepared(activeStats)) {
      return 0;
    }
    const keys = [
      statsStore[activeStats.attribute],
      statsStore[activeStats.department],
    ]
    return keys.reduce((total, stat) => total += stat, 0)
  });

  const doRoll = async () => {
    if (!checkPrepared(activeStats)) return;
    const dispatch: Dispatch = dispatchRef.value

    const { results } = await dispatch.roll({rolls: {"roll": `2d20>${targetNumber.value}`}})
    const content = createRollTemplate({type: "roll", parameters: { 
      equation: results.roll.expression, 
      successes: results.roll.results.result,
      dice: results.roll.results.dice,
      characterName: metaStore.name,
    }})
    dispatch.post({
      content
    })
  }

  return {
    activeStats,
    doRoll,
  }
})