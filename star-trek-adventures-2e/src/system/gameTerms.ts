export const AttributesEnum = {
  CONTROL: 'Control',
  FITNESS: 'Fitness',
  PRESENCE: 'Presence',
  DARING: 'Daring',
  INSIGHT: 'Insight',
  REASON: 'Reason',
} as const;

export type AttributeKey = keyof typeof AttributesEnum;
export const AttributeKeys = Object.keys(AttributesEnum) as AttributeKey[];
export const isAttributeKey = (key: string): key is AttributeKey => key in AttributesEnum;

export type AttributeValue = (typeof AttributesEnum)[AttributeKey];
export const AttributeValues = Object.values(AttributesEnum) as AttributeValue[];
export const isAttributeValue = (value: string): value is AttributeValue =>
  AttributeValues.includes(value as AttributeValue);

export const DepartmentsEnum = {
  COMMAND: 'Command',
  ENGINEERING: 'Engineering',
  MEDICINE: 'Medicine',
  CONN: 'Conn',
  SECURITY: 'Security',
  SCIENCE: 'Science',
} as const;

export type DepartmentKey = keyof typeof DepartmentsEnum;
export const DepartmentKeys = Object.keys(DepartmentsEnum) as DepartmentKey[];
export const isDepartmentKey = (key: string): key is DepartmentKey => key in DepartmentsEnum;

export type DepartmentValue = (typeof DepartmentsEnum)[DepartmentKey];
export const DepartmentValues = Object.values(DepartmentsEnum) as DepartmentValue[];
export const isDepartmentValue = (value: string): value is DepartmentValue =>
  DepartmentValues.includes(value as DepartmentValue);

const AdvancementTypesEnum = {
  LOG: 'Log',
  MILESTONE: 'Milestone',
  ARC: 'Arc',
} as const;

export type AdvancementTypeKey = keyof typeof AdvancementTypesEnum;
export const AdvancementTypeKeys = Object.keys(AdvancementTypesEnum) as AdvancementTypeKey[];
export const isAdvancementTypeKey = (key: string): key is AdvancementTypeKey =>
  AdvancementTypeKeys.includes(key as AdvancementTypeKey);

export type AdvancementTypeValue = (typeof AdvancementTypesEnum)[AdvancementTypeKey];
export const AdvancementTypeValues = Object.values(AdvancementTypesEnum) as AdvancementTypeValue[];
export const isAdvancementTypeValue = (value: string): value is AdvancementTypeValue =>
  AdvancementTypeValues.includes(value as AdvancementTypeValue);

/** How values can be invoked, per Milestone entry directions (CRB p. 166) */
const ValueInvocationsEnum = {
  POSITIVE: '+',
  NEGATIVE: '-',
  CHALLENGE: '!',
} as const;

export type ValueInvocationKey = keyof typeof ValueInvocationsEnum;
export const ValueInvocationKeys = Object.keys(ValueInvocationsEnum) as ValueInvocationKey[];
export const isValueInvocationKey = (key: string): key is ValueInvocationKey =>
  ValueInvocationKeys.includes(key as ValueInvocationKey);

export type ValueInvocationValue = (typeof ValueInvocationsEnum)[ValueInvocationKey];
export const ValueInvocationValues = Object.values(ValueInvocationsEnum) as ValueInvocationValue[];
export const isValueInvocationValue = (value: string): value is ValueInvocationValue =>
  ValueInvocationValues.includes(value as ValueInvocationValue);
