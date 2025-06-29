<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@3.0.1 .\man.glb -T --draco /draco/
-->

<script lang="ts">
  import { type RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";
  import { T, useTask, useThrelte } from "@threlte/core";
  import { useDraco, useGltf, useGltfAnimations } from "@threlte/extras";
  import { Collider, RigidBody } from "@threlte/rapier";
  import { Group, PerspectiveCamera, Vector3 } from "three";
  import { ThirdPersonControls } from "../controls/thirdPersonControls";
  import { keys, isInVehicle, gameActions, playerVisible, gameState } from "../../stores/stores";

  let {
    cameraRef,
    fallback = () => {},
    error = () => {},
    children = () => {},
    ref = $bindable(),
    ...props
  } = $props();

  ref = new Group();

  const gltf = useGltf("/man-transformed.glb", { dracoLoader: useDraco() });
  export const { actions, mixer } = useGltfAnimations(gltf, ref);
  const { camera } = useThrelte();

  let isActive = $derived(!$isInVehicle);
  let isVisible = $derived($playerVisible);
  const v3 = new Vector3();
  let mainGroupRef: Group | undefined = $state<Group>();
  let rigidBody: RapierRigidBody | undefined = $state<RapierRigidBody>();
  let objectRef: Group | undefined = $state<Group>();
  let controls: ThirdPersonControls | undefined;
  let position: [number, number, number] = $state([0, 5, 0]);

  // @ts-ignore
  delete actions["T Pose"];
  // @ts-ignore
  delete actions["T pose.001"];

  $effect(() => {
    if (objectRef && cameraRef && mainGroupRef) {
      gameActions.registerPlayer(mainGroupRef);

      const isTouchDevice = "ontouchstart" in window;
      const canvas = document.querySelector("canvas");

      //@ts-ignore
      controls = new ThirdPersonControls($camera, mainGroupRef, {
        offset: new Vector3(0, 0.5, 0),
        targetRadius: 5,
      });

      if (!isTouchDevice && canvas) {
        canvas.addEventListener("click", () => {
          if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock();
          }
        });

        canvas.addEventListener("pointermove", (e) => {
          if (document.pointerLockElement === canvas && isActive) {
            controls?.update(e.movementX * 2, e.movementY * 2);
          }
        });
      }
    }
  });

  useTask(() => {
    if (!rigidBody || !objectRef || !cameraRef || !controls) return;

    // Handle vehicle exit position within the physics loop
    if ($gameState.vehicleExitPosition && isVisible) {
      console.log("Setting player position to exit position:", $gameState.vehicleExitPosition);
      
      // Apply the new position to the rigid body
      rigidBody.setTranslation({
        x: $gameState.vehicleExitPosition[0],
        y: $gameState.vehicleExitPosition[1],
        z: $gameState.vehicleExitPosition[2]
      }, true);
      
      // Update the local position
      position = $gameState.vehicleExitPosition;
      
      // Clear the exit position
      gameActions.applyExitPosition();
    }

    // Only process if the player is active (not in vehicle)
    if (!isActive) return;

    const cameraDirection = cameraRef.getWorldDirection(v3);
    const thetaCamera = Math.atan2(cameraDirection.x, cameraDirection.z);
    const objectDirection = objectRef.getWorldDirection(v3);
    const thetaObject = Math.atan2(objectDirection.x, objectDirection.z);

    let deltaTheta = thetaCamera - thetaObject;
    if (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
    if (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;

    const rotationSpeed = 10;
    const angularVelocityY = deltaTheta * rotationSpeed;
    const maxAngularVelocity = 15;
    const clampedAngularVelocity =
      Math.sign(angularVelocityY) *
      Math.min(Math.abs(angularVelocityY), maxAngularVelocity);

    rigidBody.setAngvel({ x: 0, y: clampedAngularVelocity, z: 0 }, true);

    const pos = rigidBody.translation();
    position = [pos.x, pos.y, pos.z];
    gameActions.updatePlayerPosition(position);

    let currentVelocity = 0;

    // Movement
    if ($keys.w.isPressed && $keys.shift.isPressed) {
      currentVelocity = 6;
    } else if ($keys.w.isPressed) {
      currentVelocity = 3;
    }

    if (currentVelocity > 0) {
      const x = Math.sin(thetaCamera) * currentVelocity;
      const z = Math.cos(thetaCamera) * currentVelocity;
      rigidBody.setLinvel({ x, y: 0, z }, true);

      // Animation transitions
      $actions.idle?.reset();
      if (currentVelocity === 6) {
        $actions.walk?.reset();
        $actions.Running?.play();
      } else {
        $actions.Running?.reset();
        $actions.walk?.play();
      }
    } else {
      // When not moving, gradually stop
      const currentVel = rigidBody.linvel();
      rigidBody.setLinvel(
        {
          x: currentVel.x * 0.9,
          y: currentVel.y,
          z: currentVel.z * 0.9,
        },
        true
      );

      $actions.walk?.stop();
      $actions.Running?.stop();
      $actions.idle?.play();
    }

    controls.update(0, 0);
  });
</script>

<!-- Only render the player if visible -->
{#if isVisible}
  <T is={ref} dispose={false} {...props}>
    {#await gltf}
      {@render fallback?.()}
    {:then gltf}
      <T.Group name="Scene" {position} bind:ref={mainGroupRef} dispose={false}>
        <RigidBody 
          bind:rigidBody 
          enabledRotations={[false, true, false]}
          userData={{ name: "player" }}
        >
          <Collider shape="capsule" args={[0.2, 0.2]}>
            <T.Group
              position={[0, -0.4, 0]}
              name="Armature"
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.015}
            >
              <T is={gltf.nodes.mixamorigHips} />
              <T.Group name="tripo_node_ca4578fd004" bind:ref={objectRef}>
                <T.SkinnedMesh
                  name="tripo_mesh_ca4578fd020"
                  geometry={gltf.nodes.tripo_mesh_ca4578fd020.geometry}
                  material={gltf.materials["Material.019"]}
                  skeleton={gltf.nodes.tripo_mesh_ca4578fd020.skeleton}
                />
                <T.SkinnedMesh
                  name="tripo_mesh_ca4578fd020_1"
                  geometry={gltf.nodes.tripo_mesh_ca4578fd020_1.geometry}
                  material={gltf.materials.tripo_mat_ca4578fd}
                  skeleton={gltf.nodes.tripo_mesh_ca4578fd020_1.skeleton}
                />
                <T.SkinnedMesh
                  name="tripo_mesh_ca4578fd020_2"
                  geometry={gltf.nodes.tripo_mesh_ca4578fd020_2.geometry}
                  material={gltf.materials["Material.021"]}
                  skeleton={gltf.nodes.tripo_mesh_ca4578fd020_2.skeleton}
                />
                <T.SkinnedMesh
                  name="tripo_mesh_ca4578fd020_3"
                  geometry={gltf.nodes.tripo_mesh_ca4578fd020_3.geometry}
                  material={gltf.materials["Material.022"]}
                  skeleton={gltf.nodes.tripo_mesh_ca4578fd020_3.skeleton}
                />
              </T.Group>
            </T.Group>
          </Collider>
        </RigidBody>
      </T.Group>
    {:catch err}
      {@render error?.({ error: err })}
    {/await}

    {@render children?.({ ref })}
  </T>
{:else}
  <!-- Debug message when player is hidden -->
  <!-- <div style="position: fixed; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.5); padding: 10px;">
    Player is hidden (in vehicle)
  </div> -->
{/if}