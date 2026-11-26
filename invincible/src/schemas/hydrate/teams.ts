import { z } from "zod";
import { flexibleArray, flexibleString } from "@/utility/objectify";

export const TeamMemberSchema = z.object({
  _id: z.string(), 
  name: flexibleString,
  avatar: flexibleString.default(''),
  civilianName: flexibleString.default(''),
});

export const BaseFeatureSchema = z.object({
  _id: z.string(), 
  name: flexibleString,
  description: flexibleString.default(''),
});

export const TeamSchema = z.object({
  _id: z.string(), 
  name: flexibleString,
  members: flexibleArray(TeamMemberSchema).default([]),
  baseFeatures: flexibleArray(BaseFeatureSchema).default([]),
  base: flexibleString.default(''),
});

export const TeamsListSchema = flexibleArray(TeamSchema).default([]);

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type BaseFeature = z.infer<typeof BaseFeatureSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type TeamsList = z.infer<typeof TeamsListSchema>;
