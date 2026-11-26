/** Vehicles: crewed objects with stations, hull, and passenger rules. */

export interface VehicleStation {
  id: string;
  name: string;
  /** How many crew this station needs to operate. */
  crewRequired: number;
  /** Action ids this station can use. */
  actionIds: string[];
  /** Talent used to operate it. */
  talent: string;
  description: string;
  /** Destroyed stations stop working. */
  hitPoints: number | null;
}

export interface VehicleMovementSystem {
  id: string;
  name: string;
  kind: 'ground' | 'water' | 'air' | 'space' | 'aether';
  speed: number;
  /** Speed while at full crew; falls off as crew is lost. */
  requiresCrew: number;
  description: string;
}

export interface CrucibleVehicleBlock {
  capacityCrew: number;
  capacityPassengers: number;
  cargoTons: number;
  stations: VehicleStation[];
  movementSystems: VehicleMovementSystem[];
  /** Hull HP is tracked separately from crew HP. */
  hullPoints: number;
  hullArmorClass: number;
  /** Damage thresholds: damage below this is ignored. */
  damageThreshold: number;
  /** What happens when the hull hits 0. */
  destructionEffect: string;
  /** Rules for passengers during combat. */
  passengerRules: string;
  /** Minimum crew before it is disabled. */
  minimumCrew: number;
}

export function createVehicleBlock(
  partial: Partial<CrucibleVehicleBlock> = {},
): CrucibleVehicleBlock {
  return {
    capacityCrew: partial.capacityCrew ?? 1,
    capacityPassengers: partial.capacityPassengers ?? 0,
    cargoTons: partial.cargoTons ?? 0,
    stations: partial.stations ?? [],
    movementSystems: partial.movementSystems ?? [],
    hullPoints: partial.hullPoints ?? 0,
    hullArmorClass: partial.hullArmorClass ?? 10,
    damageThreshold: partial.damageThreshold ?? 0,
    destructionEffect: partial.destructionEffect ?? '',
    passengerRules: partial.passengerRules ?? '',
    minimumCrew: partial.minimumCrew ?? 1,
  };
}
