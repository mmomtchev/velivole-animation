const WIDTH = 1280;
const HEIGHT = 720;
const RADIUS = HEIGHT / 4;
const MOLECULE = RADIUS / 80;
const NUMBER = Math.round((2 * RADIUS * RADIUS * Math.PI) / 100 / (2 * MOLECULE * MOLECULE * Math.PI));
const SPEED = 2.5;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const molecules = Array.apply(null, Array(NUMBER)).map((d) => {
  const r = Math.random() * RADIUS;
  const a = Math.random() * 2 * Math.PI;
  return {
    direction: Math.random() * 2 * Math.PI,
    speed: SPEED,
    x: Math.cos(a) * r,
    y: Math.sin(a) * r
  };
});

function toDeg(r: number): number {
  return r / Math.PI * 180;
}

function drawMolecules() {
  let c = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.translate(WIDTH / 2, HEIGHT / 2);

  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.arc(0, 0, RADIUS, 0, 2 * Math.PI);
  ctx.stroke();

  for (const m of molecules) {
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
  //videoStream.getVideoTracks()[0].requestFraem()
}

function moveMolecules() {
  const RADIUSsq = RADIUS * RADIUS;
  for (const m of molecules) {
    const r = m.x * m.x + m.y * m.y;
    m.x += Math.cos(m.direction) * m.speed;
    m.y -= Math.sin(m.direction) * m.speed;
    const r2 = m.x * m.x + m.y * m.y;
    if (r2 > RADIUSsq) {
      const wallDirection = (Math.atan2(-m.y, m.x) + 2 * Math.PI) % (2 * Math.PI);
      m.direction = (m.direction + Math.PI + 2 * (wallDirection - m.direction)) % (2 * Math.PI);
      m.x = Math.cos(wallDirection) * RADIUS;
      m.y = -Math.sin(wallDirection) * RADIUS;
      const rem = Math.sqrt(r2) - Math.sqrt(r);
      m.x += Math.cos(m.direction) * rem;
      m.y -= Math.sin(m.direction) * rem;
    }
  }
}

setInterval(moveMolecules, 1000 / 50);
requestAnimationFrame(drawMolecules);

const videoStream = canvas.captureStream(25);
const mediaRecorder = new MediaRecorder(videoStream);
const chunks = [];
mediaRecorder.ondataavailable = function(e) {
  chunks.push(e.data);
}
mediaRecorder.onstop = function(e) {
  const blob = new Blob(chunks, {type: 'video/mp4'});
  const videoURL = URL.createObjectURL(blob);
  const video = document.getElementById('video') as HTMLVideoElement;
  video.src = videoURL;
}

mediaRecorder.start();
setTimeout(() => mediaRecorder.stop(), 30000);
