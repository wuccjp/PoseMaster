let video;
let bodyPose;
let poses = [];

// --- 遊戲變數 ---
let targetX, targetY;
let targetSize = 100; // 目標球大小
let score = 0;

function preload() {
  // 1. 關鍵：設定 flipHorizontal 為 false，讓 AI 給原始座標
  // 我們統一在 draw() 裡手動翻轉畫布
  bodyPose = ml5.bodyPose("MoveNet", { flipHorizontal: false });
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  spawnTarget(); // 初始化第一個目標球
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  background(0);

  // --- 第一步：進入「鏡像模式」 (像照鏡子一樣) ---
  push(); // 儲存目前的畫布狀態
  translate(width, 0); // 將座標原點移到畫布右側
  scale(-1, 1); // 水平翻轉整個畫布 (-1 倍寬度)
  
  // 2. 畫出影片 (在翻轉狀態下，人看起來才是正的)
  image(video, 0, 0, width, height);

  // --- 第二步：在鏡像世界中畫出遊戲元素 ---
  if (poses.length > 0) {
    let pose = poses[0];
    
    // 取得左手腕 (9) 與 右手腕 (10)
    let lw = pose.keypoints[9];
    let rw = pose.keypoints[10];

    // 畫出拳頭 (亮綠色)
    fill(0, 255, 0);
    noStroke();
    if (lw.confidence > 0.5) circle(lw.x, lw.y, 25);
    if (rw.confidence > 0.5) circle(rw.x, rw.y, 25);

    // --- 3. 核心遊戲邏輯：碰撞偵測 ---
    // 在 scale(-1, 1) 的狀態下，dist() 依然有效
    // 我們檢查兩隻手是否碰到了目標球
    checkHit(lw);
    checkHit(rw);
  }

  // 4. 畫出目標球 (半透明紅色)
  fill(255, 0, 0, 150);
  noStroke();
  ellipse(targetX, targetY, targetSize);
  
  pop(); // 離開「鏡像模式」 (還原正常畫布狀態)
  // --- 鏡射結束 ---

  // --- 第三步：在正常模式下畫出 UI 文字 ---
  // 文字絕對不能放在 push/pop 裡面，否則字會變反的
  drawUI();
}

// 碰撞偵測函式
function checkHit(handKeypoint) {
  if (handKeypoint.confidence > 0.5) {
    // 計算手與目標球中心點的距離
    let d = dist(handKeypoint.x, handKeypoint.y, targetX, targetY);
    
    // 如果距離小於目標球半徑，視為擊中
    if (d < targetSize / 2) {
      score += 10; // 加分
      spawnTarget(); // 產生下一個目標
      
      // (選做) 可以在這裡加入擊中音效
    }
  }
}

// 產生隨機位置的目標球
function spawnTarget() {
  // 留一點邊距 (50)，避免球產生在畫布邊緣打不到
  targetX = random(targetSize / 2 + 50, width - targetSize / 2 - 50);
  targetY = random(targetSize / 2 + 50, height - targetSize / 2 - 50);
}

function drawUI() {
  // 半透明黑色背景框
  fill(0, 150);
  noStroke();
  rect(10, 10, 180, 60, 10);

  // 顯示得分
  fill(255, 255, 0); // 黃色字
  textSize(32);
  textAlign(LEFT, TOP);
  text("得分: " + score, 25, 25);
}

function gotPoses(results) {
  poses = results;
}
