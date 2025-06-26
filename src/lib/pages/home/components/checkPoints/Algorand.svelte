<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { AutoColliders } from "@threlte/rapier";
  import { FakeGlowMaterial, HTML } from "@threlte/extras";
  import { keys, showAlgorandDialog } from "../../stores/stores";
  import { gameActions } from "../../stores/stores";
  import { Wallet } from "@lucide/svelte";

  let isPlayerNear = $state(false);
  let lastEPressed = $state(false);

  const handleEnter = () => {
    isPlayerNear = true;
    console.log("Player entered Algorand checkpoint area");
  };

  const handleExit = () => {
    isPlayerNear = false;
    console.log("Player exited Algorand checkpoint area");
  };

  useTask(() => {
    // Detectar cuando se presiona E por primera vez (edge detection)
    const currentEPressed = $keys.e.isPressed;
    
    if (currentEPressed && !lastEPressed && isPlayerNear) {
      console.log("Opening Algorand dialog");
      gameActions.showAlgorandDialog();
    }
    
    lastEPressed = currentEPressed;
  });
</script>

<!-- Algorand Checkpoint -->
<T.Group position={[0, 0.5, -5]}>
  <AutoColliders
    shape="cuboid"
    sensor={true}
    onsensorenter={handleEnter}
    onsensorexit={handleExit}
  >
    <T.Mesh>
      <T.CylinderGeometry args={[0.8, 0.8, 1]} />
      <FakeGlowMaterial
        glowColor={isPlayerNear ? "#00ff88" : "#0088ff"}
        falloff={1}
        glowInternalRadius={1}
        glowSharpness={5}
        depthTest={true}
      />
    </T.Mesh>
  </AutoColliders>

  <!-- Floating Icon - Se oculta completamente cuando el diálogo está abierto -->
  <T.Group position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
    <HTML transform>
      <div 
        class="flex flex-col items-center pointer-events-none"
        style="display: {$showAlgorandDialog ? 'none' : 'flex'}"
      >
        <!-- Algorand Icon -->
        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
          <Wallet class="w-6 h-6 text-white" />
        </div>
        
        <!-- Label -->
        <div class="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
          <span class="text-white text-sm font-semibold">Algorand</span>
        </div>
        
        <!-- Interaction Hint -->
        {#if isPlayerNear}
          <div class="mt-2 bg-green-600/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-green-400/30 animate-pulse">
            <span class="text-white text-xs font-medium">Presiona E para conectar</span>
          </div>
        {/if}
      </div>
    </HTML>
  </T.Group>

  <!-- Particle Effect Ring -->
  <T.Group rotation={[0, 0, 0]}>
    {#each Array(8) as _, i}
      <T.Group rotation={[0, (i * Math.PI * 2) / 8, 0]}>
        <T.Mesh position={[1.2, 0, 0]}>
          <T.SphereGeometry args={[0.05]} />
          <FakeGlowMaterial
            glowColor={isPlayerNear ? "#00ff88" : "#0088ff"}
            falloff={0.5}
            glowInternalRadius={0.5}
            glowSharpness={3}
            depthTest={true}
          />
        </T.Mesh>
      </T.Group>
    {/each}
  </T.Group>
</T.Group>