<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@3.0.1 .\city.glb -T -d /draco/
-->

<script>
  import { T } from "@threlte/core";
  import {
    useGltf,
    useDraco,
    FakeGlowMaterial,
    Outlines,
  } from "@threlte/extras";

  let { fallback, error, children, ref = $bindable(), ...props } = $props();

  const gltf = useGltf("/city-transformed.glb", { dracoLoader: useDraco() });
</script>

<T.Group bind:ref dispose={false} {...props}>
  {#await gltf}
    {@render fallback?.()}
  {:then gltf}
    <T.Mesh
      geometry={gltf.nodes.Mesh1_Group1_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[15.5, 4.5, -7.6]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh10_Group10_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-16.77, 4.4, 52.5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh11_Group11_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-17.92, 12.24, 47.8]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh12_G_3DGeom_1_2_G_3DGeom_1_1_G_3DGeom_1_Assembly_4_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-11.22, 4.93, -1.77]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh13_G_3DGeom_2_2_G_3DGeom_2_1_G_3DGeom_2_Assembly_7_Assembly
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6.9, 4.2, -0.46]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh14_G_3DGeom_3_2_G_3DGeom_3_1_G_3DGeom_3_Assembly_10_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-11.58, 5.89, -0.81]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh15_G_3DGeom_4_2_G_3DGeom_4_1_G_3DGeom_4_Assembly_13_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-14, 1.5, -0.7]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh16_G_3DGeom_5_2_G_3DGeom_5_1_G_3DGeom_5_Assembly_16_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-7.3, 5.27, -0.6]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh17_G_3DGeom_6_2_G_3DGeom_6_1_G_3DGeom_6_Assembly_19_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-7.6, 5.25, -0.39]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh18_G_3DGeom_7_2_G_3DGeom_7_1_G_3DGeom_7_Assembly_22_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-8.51, 8.05, -0.68]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh19_G_3DGeom_8_2_G_3DGeom_8_1_G_3DGeom_8_Assembly_25_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-8, 2.95, -0.68]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh2_Group2_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[14.1, 3.95, -0.28]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh20_G_3DGeom_9_2_G_3DGeom_9_1_G_3DGeom_9_Assembly_28_Assembl
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-11.81, 5.1, -0.81]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh21_G_3DGeom_10_2_G_3DGeom_10_1_G_3DGeom_10_Assembly_31_Asse
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-15.75, 1.9, -0.47]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh3_Group3_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[2.24, 4.36, -0.15]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh37_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, -0.07, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh38_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, -0.07, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh39_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, -0.07, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh4_Group4_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[1.5, 4.5, -7.6]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh40_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, -0.07, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh41_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, -0.07, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh42_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, -0.07, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh43_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, -0.07, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh44_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, -0.07, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh45_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, -0.07, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh46_Group12_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[21.36, -0.07, -30.43]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh47_Group13_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, -0.2, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh48_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, 0, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh49_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, 0, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh5_Group5_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 4.5, 56.32]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh50_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[11.52, 5.77, 45.9]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh51_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 2.9, 50.62]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh52_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 6.1, 50.62]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh53_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, 0, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh54_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, 0, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh55_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[23, 0, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh56_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, 0, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh57_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, 0, -53]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh58_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-6, 0, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh59_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52, 0, -5]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh6_Group6_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 1.3, 50.62]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh7_Group7_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 4.3, 50.62]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh8_Group8_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-19.3, 8.57, 49.41]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh9_Group9_Model.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[-16.77, 7.5, 48.75]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Curve002.geometry}
      material={gltf.materials["SVGMat.029"]}
      position={[-38.77, 0.03, -0.35]}
    />
    <T.Mesh
      geometry={gltf.nodes.Curve006.geometry}
      material={gltf.materials["SVGMat.029"]}
      position={[-38.55, 0.05, -0.34]}
    />
    <T.Mesh
      geometry={gltf.nodes.Curve007.geometry}
      material={gltf.materials["SVGMat.029"]}
      position={[-38.43, 0.05, -0.36]}
    />
    <T.Mesh
      geometry={gltf.nodes.Curve010.geometry}
      material={gltf.materials["SVGMat.029"]}
      position={[-38.32, 0.05, -0.34]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh24_G_3DGeom_18_2_G_3DGeom_18_1_G_3DGeom_18_Assembly_55_Mode
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[49.84, 16.14, -32.74]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh30_G_3DGeom_17_2_G_3DGeom_17_1_G_3DGeom_17_Assembly_52_Mode
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[54.16, 16.14, -32.74]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Mesh33_G_3DGeom_11_2_G_3DGeom_11_1_G_3DGeom_11_Model
        .geometry}
      material={gltf.materials["Material.001"]}
      position={[50.67, 12.7, -29.02]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <Outlines color="white" />
      <Outlines color="hotpink" thickness={0.05} />
      <Outlines color="yellow" thickness={0.1} />
    </T.Mesh>
    <T.Mesh
      geometry={gltf.nodes
        .Mesh34_G_3DGeom_19_2_G_3DGeom_19_1_G_3DGeom_19_Assembly_58_Mode
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[54.16, 16.14, -25.26]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes
        .Mesh35_G_3DGeom_16_2_G_3DGeom_16_1_G_3DGeom_16_Assembly_49_Mode
        .geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[49.84, 16.14, -25.26]}
      rotation={[Math.PI / 2, 0, 0]}
    />
    <T.Mesh
      geometry={gltf.nodes.Bolata_Light_1.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[52.2, 10.71, -29]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <FakeGlowMaterial glowColor={"#5500ff"} depthTest={true} />
    </T.Mesh>
    <T.Mesh
      geometry={gltf.nodes.Bolata_Light_2.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[48.03, 17.13, -28.96]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <FakeGlowMaterial glowColor={"purple"} depthTest={true} />
    </T.Mesh>
    <T.Mesh
      geometry={gltf.nodes.Bolata_Light_3.geometry}
      material={gltf.materials["FrontColor.002"]}
      position={[48.38, 3.77, -28.99]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <FakeGlowMaterial glowColor={"blue"} depthTest={true} />
    </T.Mesh>

    <T.Group
      position={[48.11, 8.57, -28.95]}
      rotation={[Math.PI / 2, 0, Math.PI / 2]}
      scale={6.01}
    >
      <T.Mesh
        geometry={gltf.nodes.Bolta_1.geometry}
        material={gltf.materials["SVGMat.029"]}
      >
        <FakeGlowMaterial glowColor="white" depthTest={true} />
      </T.Mesh>
      <T.Mesh
        geometry={gltf.nodes.Bolta_2.geometry}
        material={gltf.materials["SVGMat.029"]}
      >
        <FakeGlowMaterial glowColor="white" depthTest={true} />
      </T.Mesh>
      <T.Mesh
        geometry={gltf.nodes.Bolta_3.geometry}
        material={gltf.materials["SVGMat.029"]}
      >
        <FakeGlowMaterial glowColor="white" depthTest={true} />
      </T.Mesh>
      <T.Mesh
        geometry={gltf.nodes.Bolta_4.geometry}
        material={gltf.materials["SVGMat.029"]}
      >
        <FakeGlowMaterial glowColor="white" depthTest={true} />
      </T.Mesh>
      <T.Mesh
        geometry={gltf.nodes.Bolta_5.geometry}
      >
        <FakeGlowMaterial glowColor="white" depthTest={true} />
      </T.Mesh>
    </T.Group>
  {:catch err}
    {@render error?.({ error: err })}
  {/await}

  {@render children?.({ ref })}
</T.Group>
