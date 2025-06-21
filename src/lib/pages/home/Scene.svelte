<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import City from "./components/world/City.svelte";
  import { Sky, Stars, OrbitControls } from "@threlte/extras";
  import { Vector3 } from "three";

  import { DEG2RAD } from "three/src/math/MathUtils.js";

  const { position, rotation, lookAt } = $props();

  let ref = $state();

  useTask((delta) => {
    if (ref) {
      // ref.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }
  });
</script>

<!-- <Stars -->

<Sky elevation={-2} />

<T.PerspectiveCamera
  bind:ref
  makeDefault
  fov={70}
  position={[position.x, position.y, position.z]}
  oncreate={(ref) => {
    ref.lookAt(0, 1, 0);
  }}
>
  <OrbitControls />
</T.PerspectiveCamera>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<City />
