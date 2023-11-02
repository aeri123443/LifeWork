import {getCookie} from './controlcookie.js';
const COOKIENAME_ID = "ID";
const id = getCookie(COOKIENAME_ID);


const ENDPOINT = "http://127.0.0.1:8080/user/basicScore";

// 비디오 및 캔버스 엘리먼트 가져오기
const video = document.getElementById("monitoring_video"); // 비디오 엘리먼트 가져오기
const canvas = document.getElementById("canvas_pose-estimation"); // 캔버스 엘리먼트 가져오기
const context = canvas.getContext("2d"); // 캔버스 컨텍스트 생성
const startButton = document.getElementById("btn_start-monitoring"); // 시작 버튼 가져오기
const stopButton = document.getElementById("btn_stop-monitoring"); // 종료 버튼 가져오기
let shouldStop = false; // 프로그램을 멈추기 위한 플래그

// 점수 엘리먼트
const numScore = document.getElementById("num_score-highlight"); // 시작 버튼 가져오기
let arrScoreSize = 5;
let totalNackScore = 0;
let avgNackScore;
let cnt = 0; // 점수 횟수(5회) 체크

// PoseNet 모델 선언
let posenetModel;

// 웹캠을 활성화하고 비디오 스트림을 연결합니다.
startButton.addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false }) // 웹캠에서 오디오를 사용하지 않음
    .then(function (stream) {
      video.srcObject = stream; // 비디오 스트림을 비디오 엘리먼트에 연결
    });
  startButton.disabled = true; // 시작 버튼 비활성화
  startButton.style.display = "none";
  stopButton.disabled = false; // 종료 버튼 활성화
  stopButton.style.display = "block";

  shouldStop = false; // 측정 중으로 설정
  //predict(); // 측정 시작
});

// PoseNet 모델 로드 및 전역 변수에 할당
posenet.load().then((model) => {
  posenetModel = model; // 전역 변수에 모델 할당
  video.onloadeddata = (e) => {
    // 비디오가 load된 다음에 predict하도록 합니다. (안하면 콘솔에 에러가 발생할 수 있습니다)
    predict();
  };
});

const frame = 150; // 측정할 프레임 수 설정
let frameCount = 0; // 현재 측정된 프레임 수를 세는 변수

// predict() 함수를 전역 함수로 정의
function predict() {
  const totalX = Array(7).fill(0); // X 좌표를 저장할 배열 초기화
  const totalY = Array(7).fill(0); // Y 좌표를 저장할 배열 초기화

  // 프레임마다 포즈 추정 함수를 호출합니다.
  posenetModel.estimateSinglePose(video).then((pose) => {
    // 캔버스 크기를 비디오 크기와 일치하도록 설정합니다.
    canvas.width = video.width;
    canvas.height = video.height;

    // 왼쪽 눈, 오른쪽 눈의 정확도를 사용해서 정면 여부를 판단
    // 사용자가 정면을 바라보고 있는지 확인하고 포즈 정보를 처리합니다.
    if (pose.keypoints[1].score >= 0.7 && pose.keypoints[2].score >= 0.7) {
      // 특정 키포인트의 위치를 합산합니다.
      // [1],[2] : 양쪽 눈
      // [5],[6] : 양쪽 어깨
      [1, 2, 5, 6].forEach((i) => {
        totalX[i] += pose.keypoints[i].position.x;
        totalY[i] += pose.keypoints[i].position.y;
      });

      frameCount++; // 현재 측정된 프레임 수 증가
    } else {
      // 사용자가 정면을 응시하지 않을 경우 측정이 되지 않음
      alert("정면을 바라보며 정자세를 유지하세요");
    }

    if (frameCount === frame) {
      const avgX = totalX.map((sum) => sum / frame);
      const avgY = totalY.map((sum) => sum / frame);

      // 두 점 사이의 벡터 계산
      // 양쪽 어깨의 중간 값과 양쪽 눈의 중간 값을 이용하여 벡터 계산
      const VectorX = [(avgX[5] + avgX[6]) / 2] - [(avgX[1] + avgX[2]) / 2];
      const VectorY = [(avgY[5] + avgY[6]) / 2] - [(avgY[1] + avgY[2]) / 2];

      // 벡터 각도 계산 (라디안과 각도로 변환)
      const angleRadians = Math.atan2(VectorY, VectorX);
      const angleDegrees = ((angleRadians * 180) / Math.PI).toFixed(3);

      console.log(angleDegrees);
      if (angleDegrees > 100 || angleDegrees < 80) {
        // 정상 자세 각도는 90도
        alert("자세를 바로하세요");
      } else {
        // 정상 자세일 경우 평균에 카운트
        totalNackScore += Number(angleDegrees); // 합 계산
        console.log("totalNackScore", totalNackScore);
        cnt++;
      }

      frameCount = 0; // 프레임 수 초기화
    }

    if (cnt == arrScoreSize) {
      avgNackScore = totalNackScore / arrScoreSize;
      console.log(`avg : ${avgNackScore}`);
      alert(`avg : ${avgNackScore}`);
      shouldStop = true;
      sendData(ENDPOINT);
    }

    // 프로그램을 멈추는 조건을 검사하고, 조건이 충족되면 종료합니다.
    if (shouldStop) {
      return;
    }

    // 키포인트와 스켈레톤을 그리는 함수를 호출합니다.
    drawKeypoints(pose.keypoints, 0.6, context); // 키포인트 그리기 (정확도 설정 가능)

    // 프레임마다 재귀적으로 predict 함수를 호출합니다.
    requestAnimationFrame(predict);
  });
}

const color = "aqua"; // 그리기에 사용할 색상 설정

const drawPoint = (ctx, y, x, r, color) => {
  // 지정한 위치에 원을 그리는 함수
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color; // 원의 색상 설정
  ctx.fill();
};

const drawKeypoints = (keypoints, minConfidence, ctx, scale = 1) => {
  // 키포인트 그리기 함수
  keypoints.forEach((keypoint, i) => {
    if ([1, 2, 5, 6].includes(i)) {
      const { y, x } = keypoint.position;
      if (keypoint.score >= minConfidence) {
        drawPoint(ctx, y * scale, x * scale, 3, color); // 원의 반지름 3으로 키포인트 그리기
      }
    }
  });
};

// 종료 버튼 클릭 시 측정 종료
stopButton.addEventListener("click", () => {
  shouldStop = true;
  startButton.disabled = false; // 시작 버튼 활성화
  startButton.style.display = "block";
  stopButton.disabled = true; // 종료 버튼 비활성화
  stopButton.style.display = "none";
  const tracks = video.srcObject.getTracks();
  tracks.forEach(function (track) {
    track.stop(); // 웹캠 스트림 중지
  });
  video.srcObject = null; // 비디오 요소의 스트림 제거
});

// 함수: 데이터 송신
function sendData(_endPoint) {
  console.log("function: sendData");

  fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: id, 
      nackScore: avgNackScore,
      wristScore: 1, // 추후 센서와 연동
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      alert(result);
      const redirectTo = "/templates/login.html"; // 다음 페이지의 URL
      window.location.href = redirectTo;
    })
    .catch((error) => {
      console.error("오류 발생: " + error);
    });
}
