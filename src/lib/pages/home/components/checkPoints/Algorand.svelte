<script lang="ts">
    import { T } from "@threlte/core"
    
</script>


    <T.Group>
      <AutoColliders
        shape="cuboid"
        sensor={true}
        onsensorenter={() => {}}
        onsensorexit={() => {}}
      >
        <T.Mesh position={[55.69, 3.3, -40.19]}>
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