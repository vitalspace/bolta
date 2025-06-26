<script lang="ts">
  import { type RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";
  import { T, useTask, useThrelte } from "@threlte/core";
  import { AutoColliders, RigidBody } from "@threlte/rapier";
  import {
    CapsuleGeometry,
    Group,
    PerspectiveCamera,
    Vector3
  } from "three";
  import { ThirdPersonControls } from "../controls/thirdPersonControls";

  let mainGroupRef: Group | undefined = $state<Group>();
  let rigidBody: RapierRigidBody | undefined = $state<RapierRigidBody>();
  let objectRef: Group | undefined = $state<Group>();
  let cameraRef: PerspectiveCamera | undefined = $state<PerspectiveCamera>();
  let controls: ThirdPersonControls | undefined;

  let position: [number, number, number] = $state([0, 5, 0]);

  let holding = false;

  const { camera } = useThrelte();

  const keys = {
    a: { isPressed: false },
    d: { isPressed: false },
    w: { isPressed: false },
    s: { isPressed: false },
    space: { isPressed: false },
    e: { isPressed: false },
  };

  const press = (e: Event, isDown: boolean) => {
    e.preventDefault();
    //@ts-ignore
    const { keyCode } = e;
    switch (keyCode) {
      case 65:
        keys.a.isPressed = isDown;
        break;
      case 68:
        keys.d.isPressed = isDown;
        break;
      case 87:
        keys.w.isPressed = isDown;
        break;
      case 83:
        keys.s.isPressed = isDown;
        break;
      case 32:
        keys.space.isPressed = isDown;
        break;
      case 69:
        keys.e.isPressed = isDown;
        break;
    }
  };

  document.addEventListener("keydown", (e) => press(e, true));
  document.addEventListener("keyup", (e) => press(e, false));

  $effect(() => {
    if (objectRef && cameraRef && mainGroupRef) {
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
          if (document.pointerLockElement === canvas) {
            controls?.update(e.movementX * 2, e.movementY * 2);
          }
        });
      }
    }
  });

  const v3 = new Vector3();

  useTask(() => {
    if (!rigidBody || !objectRef || !cameraRef || !controls) return;

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

    if (keys.w.isPressed) {
      const currentVelocity = 4;
      const x = Math.sin(thetaCamera) * currentVelocity;
      const z = Math.cos(thetaCamera) * currentVelocity;
      rigidBody.setLinvel({ x, y: 0, z }, true);
    } else {
      //   rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Lógica para recoger el cubo
    if (keys.e.isPressed && !holding) {
      holding = true;
    }

    // Lógica para soltar el cubo
    if (!keys.e.isPressed && holding) {
      holding = false;
    }

    controls.update(0, 0);
  });
</script>

<T.PerspectiveCamera makeDefault bind:ref={cameraRef} />

<!-- Player -->
<T.Group {position} bind:ref={mainGroupRef} dispose={false}>
  <RigidBody bind:rigidBody enabledRotations={[false, true, false]}>
    <T.Group bind:ref={objectRef}>
      <AutoColliders shape="capsule">
        <T.Mesh>
          <T.Mesh geometry={new CapsuleGeometry(0.3, 1.2 - 0.3 * 2)} />
          <T.MeshStandardMaterial color="red" />
        </T.Mesh>
      </AutoColliders>
    </T.Group>
  </RigidBody>
</T.Group>
