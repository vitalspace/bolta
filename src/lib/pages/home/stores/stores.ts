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

// Nueva store para datos del vehículo en tiempo real
export const vehicleData = writable({
  currentSpeed: 0,
  nitroLevel: 100,
  isNitroActive: false,
  nitroBlocked: false, // Nueva propiedad para indicar si el nitro está bloqueado
});

export const isInVehicle = derived(gameState, ($gameState) => {
  return (
    $gameState.controlMode === "vehicle" && $gameState.currentVehicle !== null
  );
});

export const currentVehicle = derived(gameState, ($gameState) => {
  return $gameState.currentVehicle;
});

// Nueva store derivada para controlar visibilidad del jugador
export const playerVisible = derived(gameState, ($gameState) => {
  return $gameState.controlMode === "player";
});

export const gameActions = {
  registerVehicle: (vehicle: Vehicle) => {
    gameState.update((state) => {
      // Evitar duplicados
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
      // Solo actualizar posición si el jugador está activo (no en vehículo)
      if (state.controlMode !== "player") return state;

      // Calcular vehículos cercanos
      const nearby = state.nearbyVehicles.filter((vehicle) => {
        const distance = Math.sqrt(
          Math.pow(vehicle.position[0] - playerPos[0], 2) +
          Math.pow(vehicle.position[2] - playerPos[2], 2)
        );
        return distance < 5; // 5 unidades de distancia
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

  // Nueva acción para actualizar datos del vehículo
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
      
      // Calcular posición al lado del vehículo
      const vehiclePos = state.currentVehicle.position;
      const exitPosition: [number, number, number] = [
        vehiclePos[0] + 3, // 3 unidades a la derecha del vehículo
        vehiclePos[1],     // Misma altura
        vehiclePos[2]      // Misma profundidad
      ];

      console.log("Player will appear at position:", exitPosition);
      console.log("Vehicle position was:", vehiclePos);

      return {
        ...state,
        currentVehicle: null,
        controlMode: "player",
        vehicleExitPosition: exitPosition,
        playerPosition: exitPosition, // Actualizar posición del jugador
      };
    });
  },

  // Nueva acción para aplicar la posición de salida al jugador
  applyExitPosition: () => {
    gameState.update((state) => {
      if (state.vehicleExitPosition && state.playerReference) {
        console.log("Applying exit position to player:", state.vehicleExitPosition);
        
        // Aquí podrías aplicar la posición directamente al rigid body del jugador
        // si tienes acceso a él desde el store
        
        return {
          ...state,
          vehicleExitPosition: null, // Limpiar después de usar
        };
      }
      return state;
    });
  },
};