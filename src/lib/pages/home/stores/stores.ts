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
  vehicleSensorStates: new Map(), // New: Track which vehicles have player in sensor range
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

      return {
        ...state,
        playerPosition: playerPos,
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

  // New action to handle sensor-based vehicle proximity
  setPlayerNearVehicle: (vehicleId: string, isNear: boolean) => {
    gameState.update((state) => {
      const newSensorStates = new Map(state.vehicleSensorStates);
      
      if (isNear) {
        newSensorStates.set(vehicleId, true);
        console.log(`Player is now near vehicle ${vehicleId}`);
      } else {
        newSensorStates.delete(vehicleId);
        console.log(`Player is no longer near vehicle ${vehicleId}`);
      }

      // Update canEnterVehicle based on sensor states
      const canEnter = newSensorStates.size > 0 && state.controlMode === "player";
      
      if (canEnter !== state.canEnterVehicle) {
        console.log("Can enter vehicle changed (sensor-based):", canEnter);
        console.log("Vehicles in sensor range:", Array.from(newSensorStates.keys()));
      }

      return {
        ...state,
        vehicleSensorStates: newSensorStates,
        canEnterVehicle: canEnter,
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
      if (!state.canEnterVehicle || state.vehicleSensorStates.size === 0) {
        console.log("Cannot enter vehicle - no vehicles in sensor range");
        console.log("Sensor states:", Array.from(state.vehicleSensorStates.keys()));
        return state;
      }
      
      // Get the first vehicle in sensor range
      const vehicleId = Array.from(state.vehicleSensorStates.keys())[0];
      const nearestVehicle = state.nearbyVehicles.find(v => v.id === vehicleId);

      if (nearestVehicle) {
        console.log("Entering vehicle:", nearestVehicle.id, "(sensor-detected)");
        console.log("Player will be hidden");
        
        return {
          ...state,
          currentVehicle: nearestVehicle,
          controlMode: "vehicle",
          canEnterVehicle: false,
        };
      }
      
      console.log("Vehicle found in sensor but not in nearby vehicles list");
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
        // Note: canEnterVehicle will be updated by sensor system if still in range
      };
    });
  },

  // New action to apply exit position to player
  applyExitPosition: () => {
    gameState.update((state) => {
      if (state.vehicleExitPosition && state.playerReference) {
        console.log("Applying exit position to player:", state.vehicleExitPosition);
        
        return {
          ...state,
          vehicleExitPosition: null, // Clear after using
        };
      }
      return state;
    });
  },
};