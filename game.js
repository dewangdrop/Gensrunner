const canvas = document.getElementById("renderCanvas");
let engine = new BABYLON.Engine(canvas, true);
let scene;
let player, camera;

let lane = 0; // -1 = left, 0 = center, 1 = right
let yVelocity = 0;
let isJumping = false;
let isSliding = false;

const GRAVITY = -0.015;
const JUMP_FORCE = 0.35;

function createScene() {
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.02, 0.05, 0.03);

  // HEMI LIGHT
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 50, 0), scene);
  light.intensity = 1.2;

  // CAMERA
  camera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 5, -12), scene);
  camera.radius = 12;
  camera.heightOffset = 5;
  camera.rotationOffset = 0;

  // FOREST GROUND
  createGround();

  // PLAYER BEAR
  createPlayer();

  return scene;
}

function createGround() {
  for (let i = 0; i < 20; i++) {
    const ground = BABYLON.MeshBuilder.CreateBox(
      "ground" + i,
      { width: 20, height: 0.4, depth: 20 },
      scene
    );
    ground.position.z = i * 20;

    const mat = new BABYLON.StandardMaterial("gmat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    ground.material = mat;
  }
}

function createPlayer() {
  // LOW-POLY BEAR BODY
  player = BABYLON.MeshBuilder.CreateBox("bear", { height: 2, width: 1.2, depth: 2 }, scene);
  player.position.y = 1;
  player.position.z = 0;

  let mat = new BABYLON.StandardMaterial("bearMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
  player.material = mat;

  camera.lockedTarget = player;
}

// SWIPE CONTROLS FOR MOBILE
let startX = 0;
let startY = 0;

window.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

window.addEventListener("touchend", (e) => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20) moveRight();
    else moveLeft();
  } else {
    if (dy < -20) jump();
    else slide();
  }
});

// KEYBOARD CONTROLS (Desktop)
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowUp") jump();
  if (e.key === "ArrowDown") slide();
});

// MOVEMENTS
function moveLeft() {
  if (lane > -1) lane--;
}
function moveRight() {
  if (lane < 1) lane++;
}

function jump() {
  if (!isJumping) {
    yVelocity = JUMP_FORCE;
    isJumping = true;
  }
}

function slide() {
  isSliding = true;
  setTimeout(() => (isSliding = false), 800);
}

function updatePlayer() {
  // LANE SMOOTH MOVEMENT
  player.position.x += (lane * 3 - player.position.x) * 0.2;

  // FORWARD RUNNING
  player.position.z += 0.4;

  // GRAVITY
  if (isJumping) {
    player.position.y += yVelocity;
    yVelocity += GRAVITY;

    if (player.position.y <= 1) {
      player.position.y = 1;
      isJumping = false;
      yVelocity = 0;
    }
  }
}

scene = createScene();

engine.runRenderLoop(() => {
  updatePlayer();
  scene.render();
});

// Resize
window.addEventListener("resize", () => engine.resize());

// Splash start
document.getElementById("startBtn").onclick = () => {
  document.getElementById("splash").style.display = "none";
};
