//要變身紅鼻子小丑，我們只需要抓取 AI 偵測到的 「鼻子 (Nose)」 座標（編號 0），
//並在該位置畫一個紅色的圓球即可。
let video;
let bodyPose;
let poses = [];

// 1. 手動定義骨架連接成對的編號 (COCO 17點標準)
const SKELETON_CONNECTIONS = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],         // 肩、肘、腕 (上半身)
  [5, 11], [6, 12], [11, 12],                      // 肩到髖、髖到髖 (軀幹)
  [11, 13], [13, 15], [12, 14], [14, 16]           // 髖、膝、踝 (下半身)
];

function preload() {
  // 載入 MoveNet，不要在這裡翻轉，我們手動翻轉畫布
  bodyPose = ml5.bodyPose("MoveNet");
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // 開始偵測
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  background(0);

  // --- 第一步：進入鏡像模式 (前鏡頭畫面才直覺) ---
  push(); 
  translate(width, 0);
  scale(-1, 1); // 水平翻轉整個畫布
  
  // 1. 畫影像
  image(video, 0, 0, width, height);
  
  
  // --- 第二步：變身小丑 (AI 互動) ---
  if (poses.length > 0) {
    let pose = poses[0];
    
    drawKeypoints(pose);
    
    // 取得鼻子關鍵點 (編號 0)
    let nose = pose.keypoints[0]; 
    
    // 只有當 AI 信心分數夠高時才變身
    if (nose && nose.confidence > 0.5) {
      // 2. 畫紅鼻子 (小丑核心)
      fill(255, 0, 0); // 亮紅色
      noStroke(); // 不要外框
      circle(nose.x, nose.y, 40); // 畫一個半徑 40 的圓
      
      // 3. (選做) 加一點小丑妝
      // fill(255); circle(nose.x - 10, nose.y - 10, 10); // 白光點
    }
    
    // 4. (選做) 畫骨架與關鍵點 (增加科技感)
    //drawKeypoints(pose);
    
    drawSkeleton(pose);
  }
  pop(); 
  // --- 鏡射結束 ---

  // --- 第三步：顯示 UI (在鏡像模式外) ---
  if (poses.length > 0) {
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text("🤡 小丑模式已開啟", 20, 40);
  } else {
    fill(255, 255, 0);
    textSize(24);
    textAlign(LEFT);
    text("正在尋求小丑...", 20, 40);
  }
}

// 專門用來畫「正向文字標籤」的函式
function drawKeypointLabels(pose) {
  for (let i = 0; i < pose.keypoints.length; i++) {
    let kp = pose.keypoints[i];
    if (kp.confidence > 0.1) {
      fill(255);
      textSize(14);
      // 因為畫布翻轉了，文字座標要手動鏡射回來
      text(i, width - kp.x + 10, kp.y - 10);
    }
  }
}

// 畫關鍵點與正向編號
function drawKeypoints(pose) {
  //0代表鼻子，i從1開始，就不會畫鼻子的綠點
  for (let i = 0; i < pose.keypoints.length; i++) {
    let kp = pose.keypoints[i];
    if (kp.confidence > 0.1) {
      fill(0, 255, 0); // 綠色
      noStroke();
      
      circle(kp.x, kp.y, 10);
    }
  }
}

// 畫骨架連線
function drawSkeleton(pose) {
  stroke(0, 255, 0, 150); // 綠色半透明
  strokeWeight(2);
  for (let i = 0; i < SKELETON_CONNECTIONS.length; i++) {
    let indexA = SKELETON_CONNECTIONS[i][0];
    let indexB = SKELETON_CONNECTIONS[i][1];
    let ptA = pose.keypoints[indexA];
    let ptB = pose.keypoints[indexB];
    if (ptA.confidence > 0.1 && ptB.confidence > 0.1) {
      line(ptA.x, ptA.y, ptB.x, ptB.y);
    }
  }
}

function gotPoses(results) {
  poses = results;
}
