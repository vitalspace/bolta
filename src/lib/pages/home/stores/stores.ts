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

// Helper function to calculate distance between two positions
function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) +
    Math.pow(pos1[2] - pos2[2], 2)
  );
}

// Helper function to check if player can enter any vehicle
function checkCanEnterVehicle(playerPos: [number, number, number], vehicles: Vehicle[], controlMode: string): boolean {
  if (controlMode !== "player") return false;
  
  const nearby = vehicles.filter((vehicle) => {
    const distance = calculateDistance(vehicle.position, playerPos);
    return distance < 5; // 5 units distance
  });
  
  return nearby.length > 0;
}

// Enhanced helper function for high-speed scenarios
function checkCanEnterVehicleExtended(playerPos: [number, number, number], vehicles: Vehicle[], controlMode: string): boolean {
  if (controlMode !== "player") return false;
  
  const nearby = vehicles.filter((vehicle) => {
    const distance = calculateDistance(vehicle.position, playerPos);
    return distance < 8; // Extended range for high-speed scenarios
  });
  
  return nearby.length > 0;
}

export const gameActions = {
  registerVehicle: (vehicle: Vehicle) => {
    gameState.update((state) => {
      // Avoid duplicates
      const exists = state.nearbyVehicles.find(v => v.id === vehicle.id);
      if (exists) return state;
      
      console.log("Vehicle registered:", vehicle.id);
      
      const newState = {
        ...state,
        nearbyVehicles: [...state.nearbyVehicles, vehicle],
      };
      
      // Recalculate canEnterVehicle after adding new vehicle
      newState.canEnterVehicle = checkCanEnterVehicle(
        newState.playerPosition, 
        newState.nearbyVehicles, 
        newState.controlMode
      );
      
      return newState;
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

      const newState = {
        ...state,
        playerPosition: playerPos,
      };
      
      // Recalculate canEnterVehicle with updated player position
      newState.canEnterVehicle = checkCanEnterVehicle(
        playerPos, 
        state.nearbyVehicles, 
        state.controlMode
      );
      
      // Debug logging when canEnterVehicle changes
      if (newState.canEnterVehicle !== state.canEnterVehicle) {
        console.log("Can enter vehicle changed:", newState.canEnterVehicle);
        console.log("Player position:", playerPos);
        console.log("Nearby vehicles:", state.nearbyVehicles.length);
        
        // Log distances to all vehicles for debugging
        state.nearbyVehicles.forEach((vehicle, index) => {
          const distance = calculateDistance(playerPos, vehicle.position);
          console.log(`Vehicle ${index} (${vehicle.id}) distance:`, distance.toFixed(2));
        });
      }

      return newState;
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

      const newState = {
        ...state,
        nearbyVehicles: updatedVehicles,
        currentVehicle: updatedCurrentVehicle,
      };
      
      // Recalculate canEnterVehicle after vehicle position update
      newState.canEnterVehicle = checkCanEnterVehicle(
        state.playerPosition, 
        updatedVehicles, 
        state.controlMode
      );

      return newState;
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
        console.log("Current state:", {
          canEnterVehicle: state.canEnterVehicle,
          nearbyVehicles: state.nearbyVehicles.length,
          playerPosition: state.playerPosition,
          controlMode: state.controlMode
        });
        return state;
      }
      
      let nearestVehicle: Vehicle | null = null;
      let minDistance = Infinity;
      
      for (const vehicle of state.nearbyVehicles) {
        const distance = calculateDistance(vehicle.position, state.playerPosition);
        console.log(`Checking vehicle ${vehicle.id}, distance: ${distance.toFixed(2)}`);
        
        if (distance < minDistance && distance < 5) { // Ensure it's within range
          minDistance = distance;
          nearestVehicle = vehicle;
        }
      }

      if (nearestVehicle) {
        console.log("Entering vehicle:", nearestVehicle.id, "at distance:", minDistance.toFixed(2));
        console.log("Player will be hidden");
        
        return {
          ...state,
          currentVehicle: nearestVehicle,
          controlMode: "vehicle",
          canEnterVehicle: false,
        };
      }
      
      console.log("No nearest vehicle found within range");
      return state;
    });
  },

  // New action for forced vehicle entry (for high-speed scenarios)
  forceEnterVehicle: (vehicle: Vehicle) => {
    gameState.update((state) => {
      console.log("Force entering vehicle:", vehicle.id);
      console.log("Player will be hidden");
      
      return {
        ...state,
        currentVehicle: vehicle,
        controlMode: "vehicle",
        canEnterVehicle: false,
      };
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

      const newState = {
        ...state,
        currentVehicle: null,
        controlMode: "player",
        vehicleExitPosition: exitPosition,
        playerPosition: exitPosition, // Update player position
      };
      
      // Recalculate canEnterVehicle after exiting
      newState.canEnterVehicle = checkCanEnterVehicle(
        exitPosition, 
        state.nearbyVehicles, 
        "player"
      );

      return newState;
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

  // Enhanced action to force recalculation of canEnterVehicle (for debugging and high-speed scenarios)
  forceRecalculateCanEnter: () => {
    gameState.update((state) => {
      const normalRange = checkCanEnterVehicle(
        state.playerPosition, 
        state.nearbyVehicles, 
        state.controlMode
      );
      
      const extendedRange = checkCanEnterVehicleExtended(
        state.playerPosition, 
        state.nearbyVehicles, 
        state.controlMode
      );
      
      console.log("Force recalculate - Normal range:", normalRange, "Extended range:", extendedRange);
      console.log("Player position:", state.playerPosition);
      console.log("Vehicles:", state.nearbyVehicles.length);
      
      // Log all vehicle distances
      state.nearbyVehicles.forEach((vehicle, index) => {
        const distance = calculateDistance(state.playerPosition, vehicle.position);
        console.log(`Force check - Vehicle ${index} (${vehicle.id}) distance:`, distance.toFixed(2));
      });
      
      return {
        ...state,
        canEnterVehicle: normalRange
      };
    });
  },
};