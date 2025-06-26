<script>
  import { Canvas } from "@threlte/core";
  import { AutoValue, Pane } from "svelte-tweakpane-ui";
  import { World, Debug } from "@threlte/rapier";
  import Scene from "./Scene.svelte";
  import VehicleUI from "./components/ui/VehicleUI.svelte";

  let position = $state({
    x: 0,
    y: 150,
    z: 0,
  });

  let rotation = $state({
    x: 0,
    y: 0,
    z: 0,
  });

  let lookAt = $state({
    x: 0,
    y: 0,
    z: 0,
  });

  let debug = $state(true);
</script>

<div class="bg-gray-900 relative">
  <div>
    <Pane position="fixed" title="CubeCamera">
      <AutoValue bind:value={position} label="Position" />
      <AutoValue bind:value={rotation} label="Rotation" />
      <AutoValue bind:value={lookAt} label="LookAt" />
    </Pane>
  </div>

  <div class="h-screen">
    <Canvas>
      <World>
        {#if debug}
          <Debug />
        {/if}
        <Scene {position} {rotation} {lookAt} />
      </World>
    </Canvas>
  </div>

  <!-- Vehicle UI rendered outside Canvas -->
  <VehicleUI />
</div>