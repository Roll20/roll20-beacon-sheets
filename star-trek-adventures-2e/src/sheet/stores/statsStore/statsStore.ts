
import type {
  AttributeKey,
  AttributeValue,
  DepartmentKey,
  DepartmentValue
} from "@/system/gameTerms"
import { 
  AttributesEnum , 
  DepartmentsEnum, 
  isAttributeValue, 
  isDepartmentValue 
} from "@/system/gameTerms";
import { type ModifierKey, ModifierOperations } from "@/system/logicTerms";
import { defineStore } from "pinia";
import { computed, reactive, toRaw } from "vue";

export type MessageModifier = {
  note?: string
}

export type StatModifier = {
  operation: ModifierKey,
  value: number,
  note?: string,
};

export type StatField = {
  label: AttributeValue | DepartmentValue;
  base: number;
  modifiers?: StatModifier[];
}

export type AttributeField = StatField & {
  label: AttributeValue;
}
const isAttributeField = (stat: StatField)
  : stat is AttributeField  => isAttributeValue(stat.label)

export type AttributeDictionary = Record<AttributeKey, AttributeField>

export type DepartmentField = StatField & {
  label: DepartmentValue;
}
const isDepartmentField = (stat: StatField)
  : stat is DepartmentField  => isDepartmentValue(stat.label)

export type DepartmentDictionary = Record<DepartmentKey, DepartmentField>

export const useStatsStore = defineStore("stats", () => {
  const evaluateModifiers = (base: number, modifiers: StatModifier[]) => {
    let total = base;
    if (modifiers && modifiers.length > 0) {
      modifiers.forEach((modifier)=> {
        total = ModifierOperations[modifier.operation](total, modifier.value)
      })
    }
    return total;
  }

  // #region Attributes
  const attributeFields = reactive<AttributeDictionary>({
    CONTROL: {
      label: AttributesEnum.CONTROL,
      base: 0,
    },
    DARING: {
      label: AttributesEnum.DARING,
      base: 0,
    },
    FITNESS: {
      label: AttributesEnum.FITNESS,
      base: 0,
    },
    PRESENCE: {
      label: AttributesEnum.PRESENCE,
      base: 0,
    },
    INSIGHT: {
      label: AttributesEnum.INSIGHT,
      base: 0,
    },
    REASON: {
      label: AttributesEnum.REASON,
      base: 0,
    },
  } as const)

  const calculateAttribute = (attribute: AttributeKey): number => {
    let total = attributeFields[attribute].base;
    const modifiers = attributeFields[attribute].modifiers ?? []
    return evaluateModifiers(total, modifiers);
  }

  const CONTROL = computed(() => calculateAttribute("CONTROL"))
  const FITNESS = computed(() => calculateAttribute("FITNESS"))
  const PRESENCE = computed(() => calculateAttribute("PRESENCE"))
  const DARING = computed(() => calculateAttribute("DARING"))
  const INSIGHT = computed(() => calculateAttribute("INSIGHT"))
  const REASON = computed(() => calculateAttribute("REASON"))

  // #region Departments
  const departmentFields = reactive<DepartmentDictionary>({
    COMMAND: {
      label: DepartmentsEnum.COMMAND,
      base: 0
    },
    CONN: {
      label: DepartmentsEnum.CONN,
      base: 0
    },
    ENGINEERING: {
      label: DepartmentsEnum.ENGINEERING,
      base: 0
    },
    SECURITY: {
      label: DepartmentsEnum.SECURITY,
      base: 0
    },
    MEDICINE: {
      label: DepartmentsEnum.MEDICINE,
      base: 0
    },
    SCIENCE: {
      label: DepartmentsEnum.SCIENCE,
      base: 0
    },
  })

  const calculateDepartment = (department: DepartmentKey): number => {
    let total = departmentFields[department].base;
    const modifiers = departmentFields[department].modifiers ?? []
    return evaluateModifiers(total, modifiers);
  }

  const COMMAND = computed(() => calculateDepartment("COMMAND"))
  const CONN = computed(() => calculateDepartment("CONN"))
  const ENGINEERING = computed(() => calculateDepartment("ENGINEERING"))
  const SECURITY = computed(() => calculateDepartment("SECURITY"))
  const MEDICINE = computed(() => calculateDepartment("MEDICINE"))
  const SCIENCE = computed(() => calculateDepartment("SCIENCE"))


  const dehydrate = () => {
    return {
      ...toRaw(attributeFields),
      ...toRaw(departmentFields)
    }
  }

  const hydrate = (hydrateStore: Record<AttributeKey | DepartmentKey,StatField>) => {
    const attributes: Partial<AttributeDictionary> = {};
    const departments: Partial<DepartmentDictionary> = {};
    for(const [key, field] of Object.entries(hydrateStore)) {
      if (isAttributeField(field)) { 
        attributes[key as AttributeKey] = field;
      }
      else if (isDepartmentField(field)) {
        departments[key as DepartmentKey] = field
      }
    }

    Object.assign(attributeFields, attributes)
    Object.assign(departmentFields, departments)
  };
  

  return {
    attributeFields,
    CONTROL,
    FITNESS,
    PRESENCE,
    DARING,
    INSIGHT,
    REASON,
    departmentFields,
    COMMAND,
    CONN,
    ENGINEERING,
    SECURITY,
    MEDICINE,
    SCIENCE,
    dehydrate,
    hydrate
  }
})