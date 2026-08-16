import * as THREE from 'three';
import { Face, NotationMove } from '../../types/cube';

/**
 * Creates a glowing 3D curved arrow showing rotation direction over a specific cube face
 */
export function createMoveArrow(face: Face, isPrime: boolean, isDouble: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'move-arrow-group';

  const radius = 1.35;
  const startAngle = isPrime ? 0.3 : Math.PI * 0.95;
  const endAngle = isPrime ? Math.PI * 0.95 : 0.3;
  const clockwise = !isPrime;

  // Create curved arc curve
  const curve = new THREE.EllipseCurve(
    0, 0,             // ax, aY
    radius, radius,   // xRadius, yRadius
    startAngle, endAngle, // aStartAngle, aEndAngle
    clockwise,        // aClockwise
    0                 // aRotation
  );

  const points = curve.getPoints(36).map(p => new THREE.Vector3(p.x, p.y, 0));
  const path = new THREE.CatmullRomCurve3(points);

  const tubeGeo = new THREE.TubeGeometry(path, 32, 0.045, 8, false);
  const arrowMat = new THREE.MeshStandardMaterial({
    color: isPrime ? 0x38bdf8 : 0x60a5fa,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
  });

  const tubeMesh = new THREE.Mesh(tubeGeo, arrowMat);
  group.add(tubeMesh);

  // Arrow tip cone
  const coneGeo = new THREE.ConeGeometry(0.12, 0.28, 12);
  const coneMesh = new THREE.Mesh(coneGeo, arrowMat);

  const tipPoint = points[points.length - 1];
  const prevPoint = points[points.length - 3] || points[0];
  const dir = new THREE.Vector3().subVectors(tipPoint, prevPoint).normalize();

  coneMesh.position.copy(tipPoint);
  coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  group.add(coneMesh);

  // Position and orient arrow in front of the target face
  const offset = 1.65;
  switch (face) {
    case 'U':
      group.position.set(0, offset, 0);
      group.rotation.set(-Math.PI / 2, 0, 0);
      break;
    case 'D':
      group.position.set(0, -offset, 0);
      group.rotation.set(Math.PI / 2, 0, 0);
      break;
    case 'F':
      group.position.set(0, 0, offset);
      group.rotation.set(0, 0, 0);
      break;
    case 'B':
      group.position.set(0, 0, -offset);
      group.rotation.set(0, Math.PI, 0);
      break;
    case 'R':
      group.position.set(offset, 0, 0);
      group.rotation.set(0, Math.PI / 2, 0);
      break;
    case 'L':
      group.position.set(-offset, 0, 0);
      group.rotation.set(0, -Math.PI / 2, 0);
      break;
  }

  return group;
}
