let video;
let bodyPose;
let poses = [];

// --- 計數器變數 ---
let counter = 0;
let isHandUp = false; // 紀錄目前手是否在上方

function preload() {
  // 載入 MoveNet
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

  // --- 1. 鏡像顯示區 (背景與骨架) ---
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (poses.length > 0) {
    let pose = poses[0];
    
    // 取得關鍵點：左手腕 (9) 與 鼻子 (0)
    let leftWrist = pose.keypoints[9];
    let nose = pose.keypoints[0];

    // 畫出偵測點 (輔助觀察)
    fill(0, 255, 0);
    circle(leftWrist.x, leftWrist.y, 15);
    fill(255, 0, 0);
    circle(nose.x, nose.y, 10);

    // --- 2. 核心計數邏輯 ---
    // 在 p5.js 中，y 座標越小代表越高
    if (leftWrist.confidence > 0.5 && nose.confidence > 0.5) {
      
      // 條件 A：手高過鼻子，且之前狀態是「放下」
      if (leftWrist.y < nose.y && isHandUp === false) {
        counter++;       // 分數加 1
        isHandUp = true; // 切換狀態為「已舉起」
      } 
      
      // 條件 B：手回到鼻子下方，切換回「已放下」
      else if (leftWrist.y > nose.y + 50) { // 加上 50 像素緩衝，避免在鼻子附近抖動觸發
        isHandUp = false;
      }
    }
  }
  pop();

  // --- 3. UI 顯示 (文字要在鏡像外才是正的) ---
  drawUI();
}

function drawUI() {
  // 半透明背景框
  fill(0, 150);
  noStroke();
  rect(20, 20, 250, 80, 10);

  // 顯示次數
  fill(255, 255, 0);
  textSize(40);
  textAlign(LEFT, TOP);
  text("左手次數: " + counter, 40, 40);

  // 顯示狀態提示
  textSize(16);
  fill(255);
  if (isHandUp) {
    text("狀態: ✋ 已舉起", 40, 85);
  } else {
    text("狀態: ⬇️ 請舉手", 40, 85);
  }
}

function gotPoses(results) {
  poses = results;
}

// 點擊滑鼠可以重設分數
function mousePressed() {
  counter = 0;
}
