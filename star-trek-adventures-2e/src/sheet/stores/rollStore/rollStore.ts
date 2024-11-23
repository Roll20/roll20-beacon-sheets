import { isAttributeKey, isDepartmentKey, type AttributeKey, type DepartmentKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { useStatsStore } from "../statsStore/statsStore";
import { dispatchRef } from "@/relay/relay";
import { type Dispatch } from "@roll20-official/beacon-sdk";
import { createRollTemplate } from "@/rolltemplates/rolltemplates";
import { useMetaStore } from "../meta/metaStore";

export type ActiveStats = {
  attribute?: AttributeKey;
  department?: DepartmentKey;
  focus?: string;
}

export type PreparedRollStats = {
  attribute: AttributeKey;
  department: DepartmentKey;
} & ActiveStats;

const checkPrepared = (stats: ActiveStats): stats is PreparedRollStats => {
  if (!(stats.attribute && stats.department)) return false;
  const isValid = (isAttributeKey(stats.attribute) && isDepartmentKey(stats.department))
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`)
  }
  return isValid
}

export const useRollStore = defineStore("roll", () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const activeName = ref("");
  const activeStats = reactive<ActiveStats>({});
  const savedRolls = reactive<Map<string, ActiveStats>>(new Map)

  const prepared = computed(() => checkPrepared(activeStats))

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

  const saveRoll = () => {
    if (!prepared.value) return;
    savedRolls.set(activeName.value, activeStats);
  };

  const doRoll = async () => {
    if (!prepared.value) return;
    const dispatch: Dispatch = dispatchRef.value

    const { results } = await dispatch.roll({rolls: {"roll": `5d20<${targetNumber.value}`}})
    const bottomBarValues = [results.roll.expression, `Successes: ${results.roll.results.result}`]
    const content = createRollTemplate({type: "roll", parameters: { 
      ...activeStats,
      bottomBarValues,
      dice: results.roll.results.dice,
      characterName: metaStore.name,
    }})
    dispatch.post({
      content
    })
  }

  const dehydrate = () => {
    const rolls: Record<string, ActiveStats> = {};
    for (const [name, roll] of savedRolls.entries()) {
      rolls[name] = roll
    }
    return { rolls };
  }

  type RollHydrate = {
    rolls: Record<string, ActiveStats>;
  }

  const hydrate = (hydrateStore: RollHydrate) => {
    savedRolls.clear()
    for (const entry of Object.entries(hydrateStore.rolls)){
      savedRolls.set(...entry)
    }
  }

  return {
    activeName,
    activeStats,
    savedRolls,
    saveRoll,
    doRoll,
    dehydrate,
    hydrate,
  }
})