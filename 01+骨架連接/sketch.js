//關鍵點編號顯示程式+骨架連接

// 手動定義骨架連接成對的編號 (COCO 17點標準)
const SKELETON_CONNECTIONS = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],         // 肩、肘、腕 (上半身)
  [5, 11], [6, 12], [11, 12],                      // 肩到髖、髖到髖 (軀幹)
  [11, 13], [13, 15], [12, 14], [14, 16]           // 髖、膝、踝 (下半身)
];

let video;
let bodyPose;
let poses = [];

function preload() {
  // 不要在這裡翻轉，我們手動翻轉畫布
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

  // --- 鏡射處理區塊 ---
  push(); 
  translate(width, 0);
  scale(-1, 1); // 水平翻轉整個畫布
  
  // 畫影像
  image(video, 0, 0, width, height);

  // 畫點位與骨架
  if (poses.length > 0) {
    let pose = poses[0];
    
    // 畫出所有綠色點
    for (let i = 0; i < pose.keypoints.length; i++) {
      let kp = pose.keypoints[i];
      if (kp.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(kp.x, kp.y, 10);
        
        // 在鏡射狀態下畫字會變反，所以這裡暫時不畫編號
      }
    }
    drawSkeleton(pose)
  }
  pop(); 
  // --- 鏡射結束 ---

  // --- 文字顯示區塊 (放在 pop 之後，字才是正的) ---
  if (poses.length > 0) {
    fill(255, 255, 0);
    textSize(24);
    textAlign(LEFT);
    text("AI 偵測中...", 20, 40);
    
    // 如果想在正向畫面標示編號，需要手動計算鏡射座標
    drawKeypointLabels(poses[0]);
  }
}

// 專門用來畫「正向文字」的函式
function drawKeypointLabels(pose) {
  for (let i = 0; i < pose.keypoints.length; i++) {
    let kp = pose.keypoints[i];
    if (kp.confidence > 0.1) {
      fill(255);
      textSize(14);
      // 關鍵邏輯：因為畫布翻轉了，文字座標要手動鏡射回來
      text(i, width - kp.x + 10, kp.y - 10);
    }
  }
}

function drawSkeleton(pose) {
  stroke(255, 0, 0); // 紅色線條
  strokeWeight(3);   // 線條粗度

  for (let i = 0; i < SKELETON_CONNECTIONS.length; i++) {
    let indexA = SKELETON_CONNECTIONS[i][0];
    let indexB = SKELETON_CONNECTIONS[i][1];

    let ptA = pose.keypoints[indexA];
    let ptB = pose.keypoints[indexB];

    // 只有當兩端的點都「看得到」(信心分數高) 才畫線
    if (ptA.confidence > 0.1 && ptB.confidence > 0.1) {
      line(ptA.x, ptA.y, ptB.x, ptB.y);
    }
  }
  
}

function gotPoses(results) {
  poses = results;
}
