import { writable, derived } from "svelte/store";
import type { GameState, Vehicle } from "../types";

export const keys = writable({
  a: { isPressed: false },
  d: { isPressed: false },
  w: { isPressed: false },
  s: { isPressed: false },
  space: { isPressed: false },
  shift: { isPressed: false },
  e: { isPressed: false },
});

export const gameState = writable<GameState>({
  currentVehicle: null,
  nearbyVehicles: [],
  playerPosition: [0, 0, 0],
  controlMode: "player",
  canEnterVehicle: false,
  playerReference: null,
});

export const isInVehicle = derived(gameState, ($gameState) => {
  return (
    $gameState.controlMode === "vehicle" && $gameState.currentVehicle !== null
  );
});

export const currentVehicle = derived(gameState, ($gameState) => {
  return $gameState.currentVehicle;
});

export const gameActions = {
  registerVehicle: (vehicle: Vehicle) => {
    gameState.update((state) => {
      // Evitar duplicados
      const exists = state.nearbyVehicles.find(v => v.id === vehicle.id);
      if (exists) return state;
      
      return {
        ...state,
        nearbyVehicles: [...state.nearbyVehicles, vehicle],
      };
    });
  },

  registerPlayer: (playerRef: any) => {
    gameState.update((state) => ({
      ...state,
      playerReference: playerRef,
    }));
  },

  updatePlayerPosition: (playerPos: [number, number, number]) => {
    gameState.update((state) => {
      // Calcular vehículos cercanos
      const nearby = state.nearbyVehicles.filter((vehicle) => {
        const distance = Math.sqrt(
          Math.pow(vehicle.position[0] - playerPos[0], 2) +
          Math.pow(vehicle.position[2] - playerPos[2], 2)
        );
        return distance < 5; // 5 unidades de distancia
      });

      return {
        ...state,
        playerPosition: playerPos,
        canEnterVehicle: nearby.length > 0 && state.controlMode === "player",
      };
    });
  },

  updateVehiclePosition: (vehicleId: string, vehiclePos: [number, number, number]) => {
    gameState.update((state) => {
      const updatedVehicles = state.nearbyVehicles.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, position: vehiclePos }
          : vehicle
      );

      // Si es el vehículo actual, actualizar también
      const updatedCurrentVehicle = state.currentVehicle?.id === vehicleId
        ? { ...state.currentVehicle, position: vehiclePos }
        : state.currentVehicle;

      return {
        ...state,
        nearbyVehicles: updatedVehicles,
        currentVehicle: updatedCurrentVehicle,
      };
    });
  },

  enterVehicle: () => {
    gameState.update((state) => {
      if (!state.canEnterVehicle) return state;
      
      let nearestVehicle: Vehicle | null = null;
      let minDistance = Infinity;
      for (const vehicle of state.nearbyVehicles) {
        const distance = Math.sqrt(
          Math.pow(vehicle.position[0] - state.playerPosition[0], 2) +
          Math.pow(vehicle.position[2] - state.playerPosition[2], 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestVehicle = vehicle;
        }
      }

      if (nearestVehicle) {
        return {
          ...state,
          currentVehicle: nearestVehicle,
          controlMode: "vehicle",
          canEnterVehicle: false,
        };
      }
      return state;
    });
  },

  exitVehicle: () => {
    gameState.update((state) => ({
      ...state,
      currentVehicle: null,
      controlMode: "player",
    }));
  },
};