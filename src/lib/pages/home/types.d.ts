import type { Group } from "three";

export interface Vehicle {
  id: string;
  reference: Group;
  position: [number, number, number];
  rotation: [number, number, number];
  type: "car";
}

export interface GameState {
  currentVehicle: Vehicle | null;
  nearbyVehicles: Vehicle[];
  playerPosition: [number, number, number];
  controlMode: "player" | "vehicle";
  canEnterVehicle: boolean;
  playerReference: Group | null;
}
