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

// Create all elements
createBasketballCourt();

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