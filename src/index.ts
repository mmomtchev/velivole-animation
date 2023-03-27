const WIDTH = 1280;
const HEIGHT = 720;
const MOLECULE = HEIGHT / 320;
const RADIUS = HEIGHT / 4;
const NUMBER = Math.round((2 * RADIUS * RADIUS * Math.PI) / 100 / (2 * MOLECULE * MOLECULE * Math.PI));
const AMBIENT = NUMBER * 8;
const SPEED = 2.5;
const DURATION = 32;
const SCALE = false;
const INFLATE = false;

const PRESSURE_RATIO = NUMBER / AMBIENT * 2.5 / RADIUS;

const FRAMEPERIOD = 1000 / 50;

let baloon = RADIUS;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

type Molecule = {
  direction: number;
  speed: number;
  x: number;
  y: number;
};

const molecules = Array.apply(null, Array(NUMBER)).map(() => {
  const r = Math.random() * baloon;
  const a = Math.random() * 2 * Math.PI;
  return {
    direction: Math.random() * 2 * Math.PI,
    speed: SPEED,
    x: Math.cos(a) * r,
    y: Math.sin(a) * r
  } as Molecule;
});

const ambient = Array.apply(null, Array(AMBIENT)).map(() => {
  const r = baloon + Math.random() * baloon;
  const a = Math.random() * 2 * Math.PI;
  return {
    direction: Math.random() * 2 * Math.PI,
    speed: 2.5,
    x: Math.cos(a) * r,
    y: Math.sin(a) * r
  } as Molecule;
});

function toDeg(r: number): number {
  return r / Math.PI * 180;
}

function drawMolecules() {
  let c = 0;
  ctx.fillStyle = 'black';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.translate(WIDTH * 0.5, HEIGHT * 0.5);
  if (SCALE) {
    ctx.translate(WIDTH * 0.8, HEIGHT * 0.5);
    ctx.scale(6, 6);
  }

  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.arc(0, 0, baloon, 0, 2 * Math.PI);
  ctx.stroke();

  for (const m of [...molecules, ...ambient]) {
    ctx.beginPath();
    if (c % 5 == 0)
      ctx.fillStyle = 'tomato';
    else
      ctx.fillStyle = 'dodgerblue';
    c++;
    ctx.arc(m.x, m.y, MOLECULE, 0, 2 * Math.PI);
    ctx.fill();
  }
  requestAnimationFrame(drawMolecules);
}

function moveMolecule(m: Molecule, insideWall: number, outsideWall: number) {
  const r = m.x * m.x + m.y * m.y;
  const push = (wall) => {
    const wallDirection = (Math.atan2(-m.y, m.x) + 2 * Math.PI) % (2 * Math.PI);
    m.x = Math.cos(wallDirection) * wall;
    m.y = -Math.sin(wallDirection) * wall;
  }
  if (r > outsideWall * outsideWall) push(outsideWall);
  if (r < insideWall * insideWall) push(insideWall);
  m.x += Math.cos(m.direction) * m.speed;
  m.y -= Math.sin(m.direction) * m.speed;
  const r2 = m.x * m.x + m.y * m.y;

  const rebound = (wall) => {
    const wallDirection = (Math.atan2(-m.y, m.x) + 2 * Math.PI) % (2 * Math.PI);
    m.direction = (m.direction + Math.PI + 2 * (wallDirection - m.direction)) % (2 * Math.PI);
    m.x = Math.cos(wallDirection) * wall;
    m.y = -Math.sin(wallDirection) * wall;
    const rem = Math.sqrt(r2) - Math.sqrt(r);
    m.x += Math.cos(m.direction) * rem;
    m.y -= Math.sin(m.direction) * rem;
  }
  if (r2 > outsideWall * outsideWall) rebound(outsideWall);
  if (r2 < insideWall * insideWall) rebound(insideWall);
}

function moveMolecules() {
  const pressure = (NUMBER / AMBIENT * SPEED / baloon) / PRESSURE_RATIO;
  if (INFLATE)
    baloon = baloon + baloon * (pressure - 1) / 250;

  for (const m of molecules) {
    moveMolecule(m, 0, baloon);
  }

  for (const m of ambient) {
    moveMolecule(m, baloon, RADIUS * 3);
  }
}

setInterval(moveMolecules, FRAMEPERIOD);
requestAnimationFrame(drawMolecules);

const videoStream = canvas.captureStream(25);
const mediaRecorder = new MediaRecorder(videoStream);
const chunks = [];
mediaRecorder.ondataavailable = function (e) {
  chunks.push(e.data);
};
mediaRecorder.onstop = function (e) {
  const blob = new Blob(chunks, { type: 'video/mp4' });
  const videoURL = URL.createObjectURL(blob);
  const video = document.getElementById('video') as HTMLVideoElement;
  video.src = videoURL;
};

mediaRecorder.start();
setTimeout(() => mediaRecorder.stop(), DURATION * 1000);
