<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { PerspectiveCamera, Vector3 } from "three";
  import {
    gameActions,
    gameState,
    keys,
    playerVisible
  } from "../../stores/stores";
  import Car from "../car/Car2.svelte";
  import Player from "../player/Py2.svelte";
  import VehicleUI from "../ui/VehicleUI.svelte";

  let cameraRef: PerspectiveCamera | undefined = $state<PerspectiveCamera>();
  let playerRef: any = $state();

  // States for camera interpolation
  let isTransitioning = $state(false);
  let transitionProgress = $state(0);
  let transitionDuration = 1.0; // seconds
  let fromPosition = new Vector3();
  let toPosition = new Vector3();
  let fromTarget = new Vector3();
  let toTarget = new Vector3();

  const handleVehicleToggle = () => {
    console.log("Toggle vehicle pressed, current state:", $gameState);
    
    if ($gameState.controlMode === "player" && $gameState.canEnterVehicle) {
      console.log("Entering vehicle...");
      // Enter vehicle - start transition
      gameActions.enterVehicle();
      startCameraTransition("vehicle");
    } else if ($gameState.controlMode === "vehicle") {
      console.log("Exiting vehicle...");
      // Exit vehicle - start transition
      gameActions.exitVehicle();
      startCameraTransition("player");
    } else {
      console.log("Cannot toggle vehicle. Can enter:", $gameState.canEnterVehicle);
      console.log("Vehicles in sensor range:", Array.from($gameState.vehicleSensorStates.keys()));
    }
  };

  const startCameraTransition = (targetMode: "player" | "vehicle") => {
    if (!cameraRef) {
      console.log("No camera ref available");
      return;
    }
    
    console.log("Starting camera transition to:", targetMode);
    
    isTransitioning = true;
    transitionProgress = 0;
    
    // Save current camera position
    fromPosition.copy(cameraRef.position);
    cameraRef.getWorldDirection(fromTarget);
    fromTarget.multiplyScalar(10).add(cameraRef.position);
    
    // Calculate target position based on mode
    if (targetMode === "vehicle" && $gameState.currentVehicle) {
      // Position behind the vehicle
      const vehiclePos = $gameState.currentVehicle.position;
      toPosition.set(vehiclePos[0], vehiclePos[1] + 3, vehiclePos[2] - 8);
      toTarget.set(vehiclePos[0], vehiclePos[1], vehiclePos[2]);
      console.log("Vehicle transition - from:", fromPosition, "to:", toPosition);
    } else {
      // Position behind the player
      const playerPos = $gameState.playerPosition;
      toPosition.set(playerPos[0], playerPos[1] + 3, playerPos[2] - 5);
      toTarget.set(playerPos[0], playerPos[1], playerPos[2]);
      console.log("Player transition - from:", fromPosition, "to:", toPosition);
    }
  };

  const handleKeysPress = (e: KeyboardEvent, isDown: boolean) => {
    e.preventDefault();

    const { keyCode } = e;

    keys.update(($keys) => {
      switch (keyCode) {
        case 65:
          $keys.a.isPressed = isDown;
          break;
        case 68:
          $keys.d.isPressed = isDown;
          break;
        case 87:
          $keys.w.isPressed = isDown;
          break;
        case 83:
          $keys.s.isPressed = isDown;
          break;
        case 32:
          $keys.space.isPressed = isDown;
          break;
        case 16:
          $keys.shift.isPressed = isDown;
          break;
        case 69:
          $keys.e.isPressed = isDown;
          if (isDown) {
            handleVehicleToggle();
          }
          break;
      }
      return $keys;
    });
  };

  // Camera interpolation on each frame
  useTask((delta) => {
    if (isTransitioning && cameraRef) {
      transitionProgress += delta / transitionDuration;
      
      if (transitionProgress >= 1) {
        transitionProgress = 1;
        isTransitioning = false;
        console.log("Transition completed");
      }
      
      // Smooth interpolation using easing
      const t = easeInOutCubic(transitionProgress);
      
      // Interpolate position
      const currentPos = new Vector3().lerpVectors(fromPosition, toPosition, t);
      cameraRef.position.copy(currentPos);
      
      // Interpolate target
      const currentTarget = new Vector3().lerpVectors(fromTarget, toTarget, t);
      cameraRef.lookAt(currentTarget);
    }
  });

  // Easing function for smooth transition
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  $effect(() => {
    document.addEventListener("keydown", (e) => handleKeysPress(e, true));
    document.addEventListener("keyup", (e) => handleKeysPress(e, false));

    return () => {
      document.removeEventListener("keydown", (e) => handleKeysPress(e, true));
      document.removeEventListener("keyup", (e) => handleKeysPress(e, false));
    };
  });

</script>

<T.PerspectiveCamera makeDefault bind:ref={cameraRef} />

<Player {cameraRef} />

<Car
  position={[0, 3, 0]}
  rotation={[0, Math.PI / 2, 0]}
  color="gold"
  {cameraRef}
  {isTransitioning}
/>

<!-- Vehicle UI Component -->
<VehicleUI />

<!-- Debug UI -->
<div style="position: fixed; top: 10px; right: 10px; color: white; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
  <div><strong>Debug Info (Sensor-Based):</strong></div>
  <div>Control Mode: {$gameState.controlMode}</div>
  <div>Can Enter Vehicle: {$gameState.canEnterVehicle}</div>
  <div>Player Visible: {$playerVisible}</div>
  <div>Current Vehicle: {$gameState.currentVehicle?.id || 'None'}</div>
  <div>Vehicles in Sensor Range: {$gameState.vehicleSensorStates.size}</div>
  <div>Sensor Vehicle IDs: {Array.from($gameState.vehicleSensorStates.keys()).join(', ') || 'None'}</div>
  <div>Player Position: [{$gameState.playerPosition[0].toFixed(1)}, {$gameState.playerPosition[1].toFixed(1)}, {$gameState.playerPosition[2].toFixed(1)}]</div>
  {#if $gameState.currentVehicle}
    <div>Vehicle Position: [{$gameState.currentVehicle.position[0].toFixed(1)}, {$gameState.currentVehicle.position[1].toFixed(1)}, {$gameState.currentVehicle.position[2].toFixed(1)}]</div>
  {/if}
  <div style="margin-top: 10px; color: #ffff00;">Press 'E' near vehicle to enter/exit</div>
  <div style="margin-top: 5px; color: #00ff00; font-size: 10px;">✅ Using collision sensors for detection</div>
  <div style="margin-top: 5px; color: #00ffff; font-size: 10px;">🚀 Press 'SPACE' to jump</div>
</div>