import { z } from "zod";
import { flexibleNumber, flexibleString, flexibleBoolean, nullableDefault } from "@/utility/objectify";

export const PersonalDossierSchema = z.object({
  occupation: flexibleString,
  personality: flexibleString,
  drive: flexibleString,
  flaw: flexibleString,
  relationships: flexibleString,
});

export const AvatarColorsSchema = z.object({
  avatarUrl: flexibleString,
  heroColor: flexibleString,
  heroColorSecondary: flexibleString,
  heroColorBlood: flexibleString,
});

export const BiographyHydrateSchema = z.object({
  civilianName: flexibleString,
  special: flexibleString.default(''),
  drawbacks: flexibleString.default(''),
  about: flexibleString.default(''),
  rank: flexibleNumber.default(0),
  role: flexibleString,
  reputation: flexibleString,
  karma: flexibleNumber,
  personalDossier: nullableDefault(PersonalDossierSchema, {
    occupation: '',
    personality: '',
    drive: '',
    flaw: '',
    relationships: '',
  }),
  activeTeam: flexibleString.default('Guardians'),
  gearClass: flexibleString.default('GDA Issued'),
  resources: flexibleNumber.default(2),
  avatarColors: nullableDefault(AvatarColorsSchema, {
    avatarUrl: '',
    heroColor: '',
    heroColorSecondary: '',
    heroColorBlood: '',
  }),
  appearance: flexibleString,
  disableBloodOverlay: flexibleBoolean,
});

export type BiographyHydrate = z.infer<typeof BiographyHydrateSchema>;
