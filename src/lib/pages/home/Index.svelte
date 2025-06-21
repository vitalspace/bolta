<script>
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import {
    Checkbox,
    Folder,
    List,
    Pane,
    Slider,
    AutoValue,
  } from "svelte-tweakpane-ui";

  let position = $state({
    x: 0,
    y: 0,
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
  })

</script>

<div class="bg-gray-900">
  <!-- <div class="absolute z-10 inset-0 flex items-center justify-center ">  
    <h1>Hello world</h1>
  </div> -->

  <div>
    <Pane position="fixed" title="CubeCamera">
      <AutoValue bind:value={position} label="Position" />
      <AutoValue bind:value={rotation} label="Rotation" />
      <AutoValue bind:value={lookAt} label="LookAt" />

    </Pane>
  </div>

  <div class="h-screen">
    <Canvas>
      <Scene {position} {rotation} {lookAt} />
    </Canvas>
  </div>
</div>
