let font, bgImg, markerImg, clickSound;

let points = [];
let ripples = [];
let particles = [];
let currentPath = [];
let isDrawing = false;
let showInitialTip = true;

let tags = ["α-14", "R02-Z", "7", "9", "A8", "β", "X5"];

function preload() {
  font = loadFont("FZGongYHJW.TTF");
  bgImg = loadImage("background.png");
  markerImg = loadImage("marker.png");
  clickSound = loadSound("click.wav");
}

function setup() {
  createCanvas(600, 800);
  textFont(font);
  textAlign(LEFT, TOP);
  imageMode(CENTER);
}

function draw() {
  background(255);
  image(bgImg, width / 2, height / 2, width, height);

  drawDistortedLayers();
  drawDreamlikeParticles();
  drawDashedPath();     // 绘制虚线路径
  drawFinalLines();     // 手绘感连接线段
  drawMarkers();
  drawRulerLines();
  drawRipples();
  drawText();
  checkHoverMarker();
}

function drawText() {
  fill(0);
  noStroke();

  textSize(80);
  textStyle(BOLD);
  text("林克计划", 20, height - 180);
  text("2023-20XX", 20, height - 100);

  textSize(18);
  textStyle(BOLD);
  if (showInitialTip) {
    text("点击画面生成你的地图。", 20, 20);
  } else {
    text("拖动鼠标，点击圆点。", 20, 20);
  }
}

function mousePressed() {
  if (clickSound.isLoaded()) clickSound.play();

  points.push({ x: mouseX, y: mouseY, t: frameCount });
  currentPath = [];
  isDrawing = true;
  showInitialTip = false;

  ripples.push({ x: mouseX, y: mouseY, r: 0, alpha: 150 });

  for (let i = 0; i < 10; i++) {
    particles.push({
      x: mouseX,
      y: mouseY,
      vx: random(-1, 1),
      vy: random(-1, -3),
      alpha: 255,
      size: random(2, 5)
    });
  }
}

function mouseDragged() {
  if (isDrawing) {
    currentPath.push({ x: mouseX, y: mouseY });
  }
}

function mouseReleased() {
  isDrawing = false;
}

// ✅ 鼠标拖动时显示虚线路径
function drawDashedPath() {
  if (currentPath.length < 2) return;

  stroke(0);
  strokeWeight(1);
  noFill();

  drawingContext.setLineDash([6, 6]); // 虚线设置

  beginShape();
  for (let pt of currentPath) {
    vertex(pt.x, pt.y);
  }
  endShape();

  drawingContext.setLineDash([]); // 清除虚线设置
}

// ✅ marker 之间用手绘感曲线连接
function drawFinalLines() {
  if (points.length < 2) return;

  stroke(0);
  strokeWeight(1.5);
  noFill();

  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];

    let segs = 20;
    beginShape();
    for (let j = 0; j <= segs; j++) {
      let t = j / segs;
      let x = lerp(p1.x, p2.x, t) + random(-1.5, 1.5);
      let y = lerp(p1.y, p2.y, t) + random(-1.5, 1.5);
      curveVertex(x, y);
    }
    endShape();
  }
}

function drawMarkers() {
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let bounce = sin(frameCount * 0.3 + i) * 2 + random(-0.3, 0.3);
    image(markerImg, p.x, p.y + bounce, 24, 24);
  }
}

function drawRulerLines() {
  if (points.length < 2) return;

  stroke(0);
  strokeWeight(0.8);
  fill(0);
  textSize(10);
  textStyle(NORMAL);

  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];

    let d = dist(p1.x, p1.y, p2.x, p2.y);
    let steps = floor(d / 20);

    for (let j = 1; j < steps; j++) {
      let x = lerp(p1.x, p2.x, j / steps);
      let y = lerp(p1.y, p2.y, j / steps);

      push();
      translate(x, y);
      let angle = atan2(p2.y - p1.y, p2.x - p1.x);
      rotate(angle);
      line(0, -3, 0, 3);
      noStroke();
      fill(0);
      if (random() < 0.3) {
        text(random(tags), 3, -12);
      } else {
        text(j, 3, -10);
      }
      pop();
    }
  }
}

function drawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    noFill();
    stroke(0, r.alpha);
    strokeWeight(1);
    ellipse(r.x, r.y, r.r);
    r.r += 2;
    r.alpha -= 4;

    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

function drawDreamlikeParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    noStroke();
    fill(0, 20 + p.alpha * 0.5);
    ellipse(p.x, p.y, p.size);
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 2;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawDistortedLayers() {
  let shift = 1.5;
  blendMode(MULTIPLY);
  image(bgImg, width / 2 + random(-shift, shift), height / 2 + random(-shift, shift), width, height);
  blendMode(BLEND);
}

function checkHoverMarker() {
  let hoverRadius = 20;
  let hovering = false;

  for (let p of points) {
    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < hoverRadius) {
      hovering = true;
      fill(0);
      textSize(14);
      textStyle(BOLD);
      text("你的位置", p.x + 25, p.y - 10);
      break;
    }
  }

  if (hovering) {
    cursor('pointer');
  } else {
    cursor();
  }
}