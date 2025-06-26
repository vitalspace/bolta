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
  vehicleExitPosition: null,
});

// New store for real-time vehicle data
export const vehicleData = writable({
  currentSpeed: 0,
  nitroLevel: 100,
  isNitroActive: false,
  nitroBlocked: false, // New property to indicate if nitro is blocked
});

export const isInVehicle = derived(gameState, ($gameState) => {
  return (
    $gameState.controlMode === "vehicle" && $gameState.currentVehicle !== null
  );
});

export const currentVehicle = derived(gameState, ($gameState) => {
  return $gameState.currentVehicle;
});

// New derived store to control player visibility
export const playerVisible = derived(gameState, ($gameState) => {
  return $gameState.controlMode === "player";
});

export const gameActions = {
  registerVehicle: (vehicle: Vehicle) => {
    gameState.update((state) => {
      // Avoid duplicates
      const exists = state.nearbyVehicles.find(v => v.id === vehicle.id);
      if (exists) return state;
      
      console.log("Vehicle registered:", vehicle.id);
      
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
      // Only update position if player is active (not in vehicle)
      if (state.controlMode !== "player") return state;

      // Calculate nearby vehicles
      const nearby = state.nearbyVehicles.filter((vehicle) => {
        const distance = Math.sqrt(
          Math.pow(vehicle.position[0] - playerPos[0], 2) +
          Math.pow(vehicle.position[2] - playerPos[2], 2)
        );
        return distance < 5; // 5 units distance
      });

      const canEnter = nearby.length > 0 && state.controlMode === "player";
      
      if (canEnter !== state.canEnterVehicle) {
        console.log("Can enter vehicle changed:", canEnter, "Nearby vehicles:", nearby.length);
      }

      return {
        ...state,
        playerPosition: playerPos,
        canEnterVehicle: canEnter,
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

      // If it's the current vehicle, also update it
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

  // New action to update vehicle data
  updateVehicleData: (speed: number, nitro: number, isNitroActive: boolean, nitroBlocked: boolean = false) => {
    vehicleData.update(() => ({
      currentSpeed: speed,
      nitroLevel: nitro,
      isNitroActive: isNitroActive,
      nitroBlocked: nitroBlocked,
    }));
  },

  enterVehicle: () => {
    gameState.update((state) => {
      if (!state.canEnterVehicle) {
        console.log("Cannot enter vehicle - not near any vehicle");
        return state;
      }
      
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
        console.log("Entering vehicle:", nearestVehicle.id);
        console.log("Player will be hidden");
        
        return {
          ...state,
          currentVehicle: nearestVehicle,
          controlMode: "vehicle",
          canEnterVehicle: false,
        };
      }
      
      console.log("No nearest vehicle found");
      return state;
    });
  },

  exitVehicle: () => {
    gameState.update((state) => {
      if (!state.currentVehicle) {
        console.log("No vehicle to exit from");
        return state;
      }

      console.log("Exiting vehicle");
      
      // Calculate position next to the vehicle
      const vehiclePos = state.currentVehicle.position;
      const exitPosition: [number, number, number] = [
        vehiclePos[0] + 3, // 3 units to the right of the vehicle
        vehiclePos[1],     // Same height
        vehiclePos[2]      // Same depth
      ];

      console.log("Player will appear at position:", exitPosition);
      console.log("Vehicle position was:", vehiclePos);

      return {
        ...state,
        currentVehicle: null,
        controlMode: "player",
        vehicleExitPosition: exitPosition,
        playerPosition: exitPosition, // Update player position
      };
    });
  },

  // New action to apply exit position to player
  applyExitPosition: () => {
    gameState.update((state) => {
      if (state.vehicleExitPosition && state.playerReference) {
        console.log("Applying exit position to player:", state.vehicleExitPosition);
        
        // Here you could apply the position directly to the player's rigid body
        // if you have access to it from the store
        
        return {
          ...state,
          vehicleExitPosition: null, // Clear after using
        };
      }
      return state;
    });
  },
};