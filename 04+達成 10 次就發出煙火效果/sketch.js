//當計數器剛好等於 10 的那一瞬間，我們產生一堆往四周散開的小圓點。
//為了讓程式碼保持整潔，我們建立一個 Firework 類別 (Class) 來管理煙火的物理動態。
let video;
let bodyPose;
let poses = [];

// --- 計數與狀態變數 ---
let counter = 0;
let isHandUp = false;
let particles = []; // 存放煙火粒子的陣列

function preload() {
  bodyPose = ml5.bodyPose("MoveNet");
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  background(0);

  // --- 1. 鏡像顯示相機 ---
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (poses.length > 0) {
    let pose = poses[0];
    let leftWrist = pose.keypoints[9];
    let nose = pose.keypoints[0];

    // --- 2. 計數邏輯 ---
    if (leftWrist.confidence > 0.5 && nose.confidence > 0.5) {
      if (leftWrist.y < nose.y && !isHandUp) {
        counter++;
        isHandUp = true;
        
        // 🌟 核心觸發：如果達到 10 次，在手腕位置爆發煙火
        if (counter === 10) {
          createFirework(leftWrist.x, leftWrist.y);
        }
      } else if (leftWrist.y > nose.y + 50) {
        isHandUp = false;
      }
    }
    
    // 畫出點位確認
    fill(0, 255, 0);
    circle(leftWrist.x, leftWrist.y, 10);
  }

  // --- 3. 更新與顯示煙火粒子 ---
  // 從後往前跑迴圈，方便刪除消失的粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].done()) {
      particles.splice(i, 1);
    }
  }
  pop();

  // --- 4. UI 顯示 ---
  drawUI();
}

// 產生煙火的函式
function createFirework(x, y) {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(x, y));
  }
}

// 粒子類別 (類別定義通常放在最後面)
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D(); // 隨機方向
    this.vel.mult(random(2, 10));    // 隨機速度
    this.acc = createVector(0, 0.2); // 重力感
    this.lifespan = 255;             // 透明度（壽命）
    this.color = color(random(255), random(255), random(255));
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5; // 慢慢消失
  }

  show() {
    strokeWeight(4);
    stroke(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    point(this.pos.x, this.pos.y);
  }

  done() {
    return this.lifespan < 0;
  }
}

function drawUI() {
  fill(0, 150);
  rect(20, 20, 220, 100, 10);
  fill(255, 255, 0);
  textSize(32);
  text("次數: " + counter, 40, 65);
  
  if (counter >= 10) {
    fill(255, 100, 100);
    textSize(20);
    text("🎉 恭喜達成目標！", 40, 100);
  }
}

function gotPoses(results) {
  poses = results;
}

function mousePressed() {
  counter = 0;
  particles = [];
}
