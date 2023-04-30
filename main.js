import * as THREE from "three";

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  windowWidth / -2,
  windowWidth / 2,
  windowHeight / 2,
  windowHeight / -2,
  1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(windowWidth, windowHeight);
document.body.appendChild(renderer.domElement);

function createSmoothCurve() {
  const numPoints = 5;
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * windowWidth - windowWidth / 2;
    const maxY = windowHeight / (numPoints - i);
    const y = Math.random() * maxY - maxY / 2;
    points.push(new THREE.Vector3(x, y, 0));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  return curve;
}

const curveObjects = [];
const curvePaths = [];
const geometries = [];

const numCurves = 6;
const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });

const currentCurves = Array.from({ length: numCurves }, createSmoothCurve);
const nextCurves = Array.from({ length: numCurves }, createSmoothCurve);

for (let i = 0; i < numCurves; i++) {
  const curvePath = createSmoothCurve();
  curvePaths.push(curvePath);

  const geometry = new THREE.TubeGeometry(curvePath, 100, 1, 8, false);
  geometries.push(geometry);

  const curveObject = new THREE.Mesh(geometry, material);
  curveObjects.push(curveObject);
  scene.add(curveObject);
}

camera.position.z = 10;

function animate(timestamp) {
  const timeFactor = timestamp * 0.001;

  for (let i = 0; i < numCurves; i++) {
    const currentPoints = currentCurves[i].getPoints(100);
    const nextPoints = nextCurves[i].getPoints(100);

    const lerpedPoints = currentPoints.map((point, index) => {
      const nextPoint = nextPoints[index];
      const t = (Math.sin(timeFactor + index * 0.1) + 1) * 0.5;
      return point.clone().lerp(nextPoint, t);
    });

    curvePaths[i] = new THREE.CatmullRomCurve3(lerpedPoints);

    geometries[i].copy(new THREE.TubeGeometry(curvePaths[i]));
    curveObjects[i].geometry.dispose();
    curveObjects[i].geometry = geometries[i];
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
