<script lang="ts">
  import { T, useTask} from "@threlte/core"
  import { AutoColliders, Collider, RigidBody } from "@threlte/rapier";
  import { FakeGlowMaterial, HTML, useDraco, useGltf } from "@threlte/extras";
  import { keys } from "../../stores/stores";

  console.log($keys)

  let isEnter = $state();

  const  handleEnter = () => {
      isEnter = true
  }

  useTask(() => {

  
    
  })
  
</script>


    <T.Group position={[0, .5, -5]}>
      <AutoColliders
        shape="cuboid"
        sensor={true}
        onsensorenter={() => {}}
        onsensorexit={() => {}}
      >
        <T.Mesh >
          <T.CylinderGeometry args={[0.4, 0.4, 0.5]} />
          <FakeGlowMaterial
            glowColor="green"
            falloff={1}
            glowInternalRadius={1}
            glowSharpness={5}
            depthTest={true}
          />
        </T.Mesh>
      </AutoColliders>
    </T.Group>T.Group>
      