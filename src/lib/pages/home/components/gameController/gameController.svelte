<script lang="ts">
  import { T } from "@threlte/core";
  import { PerspectiveCamera } from "three";
  import {
    gameActions,
    gameState,
    keys
  } from "../../stores/stores";
  import Car from "../car/Car2.svelte";

  let cameraRef: PerspectiveCamera | undefined = $state<PerspectiveCamera>();
  let playerRef: any = $state();

  const handleVehicleToggle = () => {
    gameState.update(($gameState) => {
      if ($gameState.controlMode === "player" && $gameState.canEnterVehicle) {
        // Entrar al vehículo
        gameActions.enterVehicle();
      } else if ($gameState.controlMode === "vehicle") {
        // Salir del vehículo
        gameActions.exitVehicle();
      }
      return $gameState;
    });
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

  $effect(() => {
    document.addEventListener("keydown", (e) => handleKeysPress(e, true));
    document.addEventListener("keyup", (e) => handleKeysPress(e, false));

    return () => {
      document.removeEventListener("keydown", (e) => handleKeysPress(e, true));
      document.removeEventListener("keyup", (e) => handleKeysPress(e, false));
    };
  });

  console.log("me cumplo masizo");
</script>

<T.PerspectiveCamera makeDefault bind:ref={cameraRef} />

<!-- <Player {cameraRef} /> -->

<Car
  position={[0, 3, 0]}
  rotation={[0, Math.PI / 2, 0]}
  color="gold"
  {cameraRef}
/>
