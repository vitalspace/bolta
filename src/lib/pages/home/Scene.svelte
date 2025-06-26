<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import City from "./components/world/City.svelte";
  import { Sky, Stars, OrbitControls } from "@threlte/extras";
  import { Vector3 } from "three";
  import Player from "./components/player/Player.svelte";
  import Py from "./components/player/Py.svelte";
  import FlyingCarSpawner from "./components/car/FlyingCarSpawner.svelte";
  import Water from "./components/world/Water.svelte";
  import GameController from "./components/gameController/gameController.svelte";
  import Ground from "./components/world/Ground.svelte";

  import { DEG2RAD } from "three/src/math/MathUtils.js";

  const { position, rotation, lookAt } = $props();

  let ref = $state();

  useTask((delta) => {
    if (ref) {
      // ref.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }
  });
</script>

<Ground />
<Water />
<Stars count={500} depth={200} speed={1} fade={true} />
<!-- <Sky
  setEnvironment={true}
  turbidity={0}
  rayleigh={20}
  mieCoefficient={0.0}
  mieDirectionalG={0.0}
  elevation={-10}
  azimuth={180}
  exposure={.2}
/> -->

<Sky elevation={0.5} azimuth={130} />

<!-- <T.PerspectiveCamera
  bind:ref
  makeDefault
  fov={70}
  position={[position.x, position.y, position.z]}
  oncreate={(ref) => {
    ref.lookAt(0, 1, 0);
  }}
>
  <OrbitControls />
</T.PerspectiveCamera> -->

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<GameController />

<City />
<!-- <Player /> -->
<!-- <Py /> -->
<!-- <FlyingCarSpawner /> -->

<FlyingCarSpawner
  start={{ x: -150, y: 25, z: -24 }}
  end={{ x: 150 }}
  rotation={[0, Math.PI / 2, 0]}
/>

<FlyingCarSpawner
  start={{ x: 150, y: 25, z: 24 }}
  end={{ x: -150 }}
  rotation={[0, Math.PI * 1.5, 0]}
/>
