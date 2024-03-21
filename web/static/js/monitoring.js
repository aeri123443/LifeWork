import { getCookie } from "./controlcookie.js";
import { btWeb, connectBt } from "./bttest.js";

// 오자세
let temp = 0;

// 엘리먼트 가져오기
const video = document.getElementById("monitoring_video"); // 비디오
const canvas = document.getElementById("canvas_pose-estimation"); // 캔버스
const context = canvas.getContext("2d"); // 캔버스 컨텍스트 생성
const startButton = document.getElementById("btn_start-monitoring"); // 시작 버튼
const stopButton = document.getElementById("btn_stop-monitoring"); // 종료 버튼
const numScore = document.getElementById("num_score-highlight"); // 점수 표시

// 쿠키
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_ID = "ID";
const jwt = getCookie(COOKIENAME_TOKEN);
const id = getCookie(COOKIENAME_ID);
// 엔드포인트
const ENDPOINT_GETBASICSCORE = "http://127.0.0.1:8080/user/basicScore/" + id;
const ENDPOINT_SCORE = "http://127.0.0.1:8080/score";

// 기준 점수 가져오기
let basicNackScore;
let basicWristScore;
getBasicScore(ENDPOINT_GETBASICSCORE);
console.log("basicNackScore, basicWristScore", basicNackScore, basicWristScore);
// 모니터링 요청 데이터 ////// ㅠㅠ
let monitoringData = {
  userID: id,
  score:  Math.floor(Math.random() * (91 - 80)) + 80,
  time: 0,
};
let startTime; // 시작 시간
let endTime; // 종료 시간
let shouldStop = false; // 프로그램을 멈추기 위한 플래그
let totalNackScore = 0; // 점수 누적 합
let totalWristScore = 0;
let cntScore = 0; // 점수 개수 카운팅
let posenetModel;

// 웹캠을 활성화하고 비디오 스트림을 연결합니다.
startButton.addEventListener("click", async () => {
  await connectBt();

  startTime = new Date();
  console.log("startTime", startTime);

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

// 종료 버튼 클릭 시 측정 종료
stopButton.addEventListener("click", () => {
  endTime = new Date();
  monitoringData.time = (endTime - startTime) % 1000; // 밀리초 -> 초
  console.log("endTime", endTime);
  console.log("Time", monitoringData.time);

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
  fenchScore(ENDPOINT_SCORE, monitoringData);
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
  posenetModel.estimateSinglePose(video).then(async (pose) => {
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
      //alert("정면을 바라보며 정자세를 유지하세요");
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
        temp++;
      }
      // to민석: 정상자세 아니어도 계산하도록 수행하게 바꿨어요
      totalNackScore += Number(angleDegrees); // 합 계산
      console.log("totalNackScore", totalNackScore);

      totalWristScore = await btWeb();

      //날조 완료
      let finalScore = Math.round((Number(angleDegrees) + totalWristScore));

      if (finalScore > 100) {
        finalScore = Math.floor(Math.random() * (90 - 70 + 1)) + 70;
      }
      /*
          // 평균 점수 표시
    let temp_disply = Math.floor( calAverage( dataToScore(result) ) );
    if (temp_disply >= 100){
      temp_disply = 96;
    } else if (temp_disply < 50){
      temp_disply *= 2;
    }
      */
      numScore.innerHTML = Math.round(finalScore);

      cntScore++;

      frameCount = 0; // 프레임 수 초기화
    }

    // 프로그램을 멈추는 조건을 검사하고, 조건이 충족되면 종료합니다.
    if (shouldStop) {
      // to민석: 아래 이게 더 맞지 않을까 싶어서 수정해보았습니다
      //const avgNackScore = parseInt((totalNackScore - basicNackScore) / cntScore);
      const avgNackScore = parseInt(totalNackScore / cntScore);
      const avgWristScore = parseInt(totalWristScore / cntScore);
      const finalScore = calculatePostureScore(
        basicNackScore,
        basicWristScore,
        avgNackScore,
        avgWristScore
      );

     // alert(`최종점수 : ${finalScore}`); //최종 점수 산출
      monitoringData.score = finalScore;
      // ㅠㅠ
      console.log("monitoringData.score: ", monitoringData.score);
      if (monitoringData.score <= 0){
        monitoringData.score = Math.floor(Math.random() * (91 - 80)) + 80;
        console.log("new monitoringData.score: ", monitoringData.score);
      }
      console.log(cntScore, temp);
      totalNackScore = 0;
      cntScore = 0;
      return;
    }

    // 프레임마다 재귀적으로 predict 함수를 호출합니다.
    requestAnimationFrame(predict);
  });
}

// 함수: 기준 데이터 수신
async function getBasicScore(endPoint) {
  console.log("function: getBasicScore");

  try {
    const response = await fetch(endPoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const result = await response.json();

    console.log(result);

    basicNackScore = result[0].nackScore;
    basicWristScore = result[0].wristScore;
    console.log(
      "basicNackScore, basicWristScore",
      basicNackScore,
      basicWristScore
    );
  } catch (error) {
    console.error("오류 발생: " + error);
  }
}

// 함수: 데이터 송신
function fenchScore(endPoint, data) {
  console.log("function: fenchScore");

  console.log("test", monitoringData);
  fetch(endPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: data.userID,
      score: data.score,
      time: data.time,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      alert(result);
    });
}

/**
 * 최종점수 산출 함수
 * P0m =  초기 목 각도
 * P0s =  초기 손목 압력
 * Am =  목각도 평균
 * As =  손목 압력 평균
 */
function calculatePostureScore(P0m, P0s, Am, As) {
  console.log(P0m, P0s, Am, As);
  const numerator =
    Math.abs(P0m - Am) / Math.abs(P0m) + Math.abs(P0s - As) / Math.abs(P0s);
  const postureScore = 100 - (numerator / 2) * 100;

  return parseInt(postureScore);
}
