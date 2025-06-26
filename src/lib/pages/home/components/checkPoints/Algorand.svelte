<script lang="ts">
    import { T } from "@threlte/core"
      import { AutoColliders, Collider, RigidBody } from "@threlte/rapier";

</script>


    <T.Group position={[0, 0, -5]}>
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
      