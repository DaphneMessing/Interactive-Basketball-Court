import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create three-point basketball court lines 
function createThreePointArcMesh(positionX, rotationZDegrees, courtLineMaterial) {
  const arcGeometry = new THREE.RingGeometry(6.7, 6.9, 16, 1, 0, Math.PI); 
  const arcMesh = new THREE.Mesh(arcGeometry, courtLineMaterial);
  arcMesh.rotation.x = degrees_to_radians(-90);
  arcMesh.rotation.z = degrees_to_radians(rotationZDegrees);
  arcMesh.position.set(positionX, 0.11, 0);
  return arcMesh;
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);

  // White court lines 
  const courtLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Center line
  const centerLineGeometry = new THREE.BoxGeometry(0.2, 0, 15);
  const centerLineMesh = new THREE.Mesh(centerLineGeometry, courtLineMaterial);
  centerLineMesh.position.y = 0.11;
  scene.add(centerLineMesh);

  // Center circle
  const circleGeometry = new THREE.RingGeometry(2, 2.2, 32);
  const circleMesh = new THREE.Mesh(circleGeometry, courtLineMaterial);
  circleMesh.rotation.x = degrees_to_radians(-90);
  circleMesh.position.y = 0.11;
  scene.add(circleMesh);

  // Three-point lines
  scene.add(createThreePointArcMesh(15, 90, courtLineMaterial));   // Right side
  scene.add(createThreePointArcMesh(-15, -90, courtLineMaterial)); // Left side
}

function createHoop(positionX) {
  // Backboard
  const backboardGeometry = new THREE.BoxGeometry(2.8, 1.6, 0.1);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const backboardMesh = new THREE.Mesh(backboardGeometry, backboardMaterial);
  if (positionX < 0) {
    backboardMesh.position.set(positionX + 1, 5, 0);
    backboardMesh.rotation.y = degrees_to_radians(90);
  } else {
    backboardMesh.position.set(positionX - 1, 5, 0);
    backboardMesh.rotation.y = degrees_to_radians(-90);
  }
  backboardMesh.castShadow = true;
  backboardMesh.receiveShadow = true;
  scene.add(backboardMesh);

  // Rim 
  const rimGeometry = new THREE.TorusGeometry(0.23, 0.02, 8, 16);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff4500 }); // orange
  const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
  rimMesh.rotation.x = degrees_to_radians(-90);
  if (positionX < 0) {
    rimMesh.position.set(positionX + 1.3, 4.5, 0);
  } else {
    rimMesh.position.set(positionX - 1.3, 4.5, 0);
  }

  rimMesh.castShadow = true;
  scene.add(rimMesh);

  // Net (8 line segments hanging down)
  const netGroup = new THREE.Group();
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const segments = 8;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const xTop = Math.cos(angle) * 0.23;
    const zTop = Math.sin(angle) * 0.23;
    const xBottom = Math.cos(angle) * 0.15;
    const zBottom = Math.sin(angle) * 0.15;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xTop, 0, zTop),
      new THREE.Vector3(xBottom, -0.4, zBottom),
    ]);
    const line = new THREE.Line(geometry, netMaterial);
    netGroup.add(line);
  }
  if (positionX < 0) {
    netGroup.position.set(positionX + 1.3, 4.5, 0);
  } else {
    netGroup.position.set(positionX - 1.3, 4.5, 0);
  }
  scene.add(netGroup);

  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
  poleMesh.position.set(positionX, 3, 0);
  poleMesh.castShadow = true;
  scene.add(poleMesh);

  // Arm
  const armGeometry = new THREE.BoxGeometry(0.2, 0.15, 1);
  const armMesh = new THREE.Mesh(armGeometry, poleMaterial);
  if (positionX < 0) {
    armMesh.position.set(positionX + 0.5, 5, 0);
    armMesh.rotation.y = degrees_to_radians(90);
  } else {
    armMesh.position.set(positionX - 0.5, 5, 0);
    armMesh.rotation.y = degrees_to_radians(-90);
  }
  armMesh.castShadow = true;
  scene.add(armMesh);
}

function createBasketball() {
  const basketballGroup = new THREE.Group();

  // Basketball base mesh (orange)
  const ballGeometry = new THREE.SphereGeometry(0.12, 64, 64);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4500,
    shininess: 30
  });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  basketballGroup.add(ballMesh);

  const ballRadius = 0.118; // Slightly smaller so seams are visible outside
  const seamMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

  // Helper function to create seam from points
  function createSeam(points) {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.003, 8, false);
    return new THREE.Mesh(tubeGeometry, seamMaterial);
  }

  function createVerticalSeam(offsetAngle) {
    const seamPoints = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const phi = Math.PI * t;
      const theta = offsetAngle + Math.sin(phi * 2) * 0.4;
      const x = ballRadius * Math.sin(phi) * Math.cos(theta);
      const y = ballRadius * Math.cos(phi);
      const z = ballRadius * Math.sin(phi) * Math.sin(theta);
      seamPoints.push(new THREE.Vector3(x, y, z));
    }
    const seam = createSeam(seamPoints);
    basketballGroup.add(seam);
  }

  // 🔄 Create 6 seams at 0°, 60°, 120°, 180°, 240°, 300°
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3; // 60-degree increments
    createVerticalSeam(angle);
  }


  // Horizontal equator seam
  const seamEquator = [];
  const equatorPhi = Math.PI / 2;
  for (let i = 0; i <= 32; i++) {
    const theta = (i / 32) * 2 * Math.PI;
    seamEquator.push(new THREE.Vector3(
      ballRadius * Math.sin(equatorPhi) * Math.cos(theta),
      ballRadius * Math.cos(equatorPhi),
      ballRadius * Math.sin(equatorPhi) * Math.sin(theta)
    ));
  }
  basketballGroup.add(createSeam(seamEquator));

  // Position at center court
  basketballGroup.position.set(0, 0.25, 0);
  basketballGroup.rotation.y = Math.PI / 6;
  basketballGroup.rotation.x = Math.PI / 12;

  scene.add(basketballGroup);
}


// Create all elements
createBasketballCourt();
createHoop(-15); // Left side
createHoop(15);  // Right side
createBasketball();


// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);

}

animate();