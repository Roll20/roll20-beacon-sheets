export const AttributesEnum = {
  CONTROL: "Control",
  FITNESS: "Fitness",
  PRESENCE: "Presence",
  DARING: "Daring",
  INSIGHT: "Insight",
  REASON: "Reason",
} as const;

export type AttributeKey = keyof typeof AttributesEnum;
export const AttributeKeys = Object.keys(AttributesEnum) as AttributeKey[]; 
export const isAttributeKey = (key: string)
  : key is AttributeKey => key in AttributesEnum;

export type AttributeValue = typeof AttributesEnum[AttributeKey]
export const AttributeValues = Object.values(AttributesEnum) as AttributeValue[]; 
export const isAttributeValue = (key: string)
  : key is AttributeValue => AttributeValues.includes(key as AttributeValue)


export const DepartmentsEnum = {
  COMMAND: "Command",
  ENGINEERING: "Engineering",
  MEDICINE: "Medicine",
  CONN: "Conn",
  SECURITY: "Security",
  SCIENCE: "Science",
} as const;

export type DepartmentKey = keyof typeof DepartmentsEnum
export const DepartmentKeys = Object.keys(DepartmentsEnum) as DepartmentKey[];
export const isDepartmentKey = (key: string): key is DepartmentKey => key in DepartmentsEnum;

export type DepartmentValue = typeof DepartmentsEnum[DepartmentKey];
export const DepartmentValues = Object.values(DepartmentsEnum) as DepartmentValue[]; 
export const isDepartmentValue = (key: string)
  : key is DepartmentValue => DepartmentValues.includes(key as DepartmentValue)

