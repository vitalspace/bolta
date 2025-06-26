import * as THREE from "three";

export function createCustomExtrudedGeometry(
  shape: THREE.Shape,
  depth: number,
  topScale = 1
) {
  const basePoints = shape.extractPoints(12).shape;
  // Convert to Vector3
  const base = basePoints.map((p) => new THREE.Vector3(p.x, p.y, 0));
  const top = basePoints.map(
    (p) => new THREE.Vector3(p.x * topScale, p.y * topScale, depth)
  );

  const vertices: number[] = [];
  const indices: number[] = [];

  const addFace = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    const i = vertices.length / 3;
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    indices.push(i, i + 1, i + 2);
  };

  // Caras base y top
  for (let i = 1; i < base.length - 1; i++) {
    addFace(base[0], base[i], base[i + 1]); // base
    addFace(top[0], top[i + 1], top[i]); // top (invertida)
  }

  // Caras laterales
  for (let i = 0; i < base.length; i++) {
    const next = (i + 1) % base.length;
    addFace(base[i], base[next], top[next]);
    addFace(base[i], top[next], top[i]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
