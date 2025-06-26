<script lang="ts">
  import { useTask } from "@threlte/core";
  import FlyingCar from "./Car.svelte";

  const {
    start = { x: -150, y: 20, z: -24 },
    end = { x: 150 },
    rotation = [0, Math.PI / 2, 0],
  } = $props();

  const MAX_CARS = 10;
  const SPAWN_INTERVAL = 1.0;
  const BASE_SPEED = 5;
  const FLOAT_AMPLITUDE = 2;
  const FLOAT_FREQUENCY = 0.2;
  const MAX_Z_OFFSET = 5;

  // Dirección automática: +1 o -1
  const direction = Math.sign(end.x - start.x);
  const SPEED = BASE_SPEED * direction;

  interface Car {
    id: number;
    x: number;
    z: number;
    phase: number;
    color: string;
  }

  let cars: Car[] = $state([]);
  let nextId = 0;
  let spawnTimer = 0;

  function randomHexColor(): string {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  useTask((delta) => {
    spawnTimer += delta;
    if (cars.length < MAX_CARS && spawnTimer >= SPAWN_INTERVAL) {
      spawnTimer = 0;
      cars.push({
        id: nextId++,
        x: start.x,
        z: start.z + (Math.random() * 2 - 1) * MAX_Z_OFFSET,
        phase: Math.random() * Math.PI * 2,
        color: randomHexColor(),
      });
    }

    cars = cars
      .map((car) => ({
        ...car,
        x: car.x + SPEED * delta,
      }))
      .filter((car) => {
        return direction > 0
          ? car.x < end.x
          : car.x > end.x;
      });
  });
</script>

{#each cars as car (car.id)}
  <FlyingCar
    color={car.color}
    position={[
      car.x,
      start.y + FLOAT_AMPLITUDE * Math.sin(FLOAT_FREQUENCY * car.x + car.phase),
      car.z
    ]}
    {rotation}
  />
{/each}
