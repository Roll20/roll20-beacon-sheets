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

export type AttributeValue = typeof AttributesEnum[AttributeKey]

export const isAttributeKey = (key: string): key is AttributeKey => key in AttributesEnum;

export const DepartmentsEnum = {
  COMMAND: "Command",
  ENGINEERING: "Engineering",
  MEDICINE: "Medicine",
  CONN: "Conn",
  SECURITY: "Security",
  SCIENCE: "Science",
} as const;