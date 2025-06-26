<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { PerspectiveCamera, Vector3 } from "three";
  import {
    gameActions,
    gameState,
    keys
  } from "../../stores/stores";
  import Car from "../car/Car2.svelte";
  import Player from "../player/Py2.svelte";

  let cameraRef: PerspectiveCamera | undefined = $state<PerspectiveCamera>();
  let playerRef: any = $state();

  // Estados para la interpolación de cámara
  let isTransitioning = $state(false);
  let transitionProgress = $state(0);
  let transitionDuration = 1.0; // segundos
  let fromPosition = new Vector3();
  let toPosition = new Vector3();
  let fromTarget = new Vector3();
  let toTarget = new Vector3();

  const handleVehicleToggle = () => {
    gameState.update(($gameState) => {
      if ($gameState.controlMode === "player" && $gameState.canEnterVehicle) {
        // Entrar al vehículo - iniciar transición
        startCameraTransition("vehicle");
        gameActions.enterVehicle();
      } else if ($gameState.controlMode === "vehicle") {
        // Salir del vehículo - iniciar transición
        startCameraTransition("player");
        gameActions.exitVehicle();
      }
      return $gameState;
    });
  };

  const startCameraTransition = (targetMode: "player" | "vehicle") => {
    if (!cameraRef) return;
    
    isTransitioning = true;
    transitionProgress = 0;
    
    // Guardar posición actual de la cámara
    fromPosition.copy(cameraRef.position);
    cameraRef.getWorldDirection(fromTarget);
    fromTarget.multiplyScalar(10).add(cameraRef.position);
    
    // Calcular posición objetivo basada en el modo
    if (targetMode === "vehicle" && $gameState.currentVehicle) {
      // Posición detrás del vehículo
      const vehiclePos = $gameState.currentVehicle.position;
      toPosition.set(vehiclePos[0], vehiclePos[1] + 3, vehiclePos[2] - 8);
      toTarget.set(vehiclePos[0], vehiclePos[1], vehiclePos[2]);
    } else {
      // Posición detrás del jugador
      const playerPos = $gameState.playerPosition;
      toPosition.set(playerPos[0], playerPos[1] + 3, playerPos[2] - 5);
      toTarget.set(playerPos[0], playerPos[1], playerPos[2]);
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

  // Interpolación de cámara en cada frame
  useTask((delta) => {
    if (isTransitioning && cameraRef) {
      transitionProgress += delta / transitionDuration;
      
      if (transitionProgress >= 1) {
        transitionProgress = 1;
        isTransitioning = false;
      }
      
      // Interpolación suave usando easing
      const t = easeInOutCubic(transitionProgress);
      
      // Interpolar posición
      const currentPos = new Vector3().lerpVectors(fromPosition, toPosition, t);
      cameraRef.position.copy(currentPos);
      
      // Interpolar target
      const currentTarget = new Vector3().lerpVectors(fromTarget, toTarget, t);
      cameraRef.lookAt(currentTarget);
    }
  });

  // Función de easing para transición suave
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