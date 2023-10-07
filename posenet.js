// 비디오 및 캔버스 엘리먼트 가져오기
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// 웹캠을 활성화하고 비디오 스트림을 연결
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false }) // 웹캠에서 오디오를 사용하지 않음
  .then(function (stream) {
    video.srcObject = stream; // 비디오 스트림을 비디오 엘리먼트에 연결
  });

// PoseNet 모델 로드
posenet.load().then((model) => {
  // 이곳의 model과 아래 predict의 model은 같아야 합니다.
  video.onloadeddata = (e) => {
    // 비디오가 load된 다음에 predict하도록 합니다. (안하면 콘솔에 에러가 발생할 수 있습니다)
    predict();
  };

  let frameCount = 0; // 프레임 수를 세는 변수
  let totalX0 = 0; // 0번 키포인트 x 좌표 합계를 저장할 변수
  let totalY0 = 0; // 0번 키포인트 y 좌표 합계를 저장할 변수
  let totalX5 = 0; // 5번 키포인트 x 좌표 합계를 저장할 변수
  let totalY5 = 0; // 5번 키포인트 y 좌표 합계를 저장할 변수
  let totalX6 = 0; // 6번 키포인트 x 좌표 합계를 저장할 변수
  let totalY6 = 0; // 6번 키포인트 y 좌표 합계를 저장할 변수
  let shouldStop = false; // 프로그램을 멈추기 위한 플래그

  function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    // 스켈레톤 그리기 함수
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
      keypoints,
      minConfidence
    );

    adjacentKeyPoints.forEach((keypoints) => {
      const [ay, ax] = toTuple(keypoints[0].position);
      const [by, bx] = toTuple(keypoints[1].position);

      // 신뢰도가 일정 수준 이상인 경우에만 스켈레톤 선을 그립니다.
      if (
        keypoints[0].score >= minConfidence &&
        keypoints[1].score >= minConfidence
      ) {
        drawSegment([ay, ax], [by, bx], color, scale, ctx);
      }
    });
  }

  function predict() {
    // 프레임마다 포즈 추정 함수를 호출합니다.
    model.estimateSinglePose(video).then((pose) => {
      // 캔버스 크기를 비디오 크기와 일치하도록 설정합니다.
      canvas.width = video.width;
      canvas.height = video.height;

      // PoseNet에서 추정한 포즈 정보를 로그로 출력합니다.
      console.log("Pose Estimation Result:", pose);

      // 모든 키포인트의 좌표를 로그로 출력하고 평균을 계산합니다.
      for (let i = 0; i < pose.keypoints.length; i++) {
        const keypoint = pose.keypoints[i];
        console.log(
          `Keypoint ${i}: (${keypoint.position.x}, ${keypoint.position.y})`
        );

        // 키포인트 중 0번, 5번, 6번의 좌표를 합산합니다.
        if (i === 0) {
          totalX0 += keypoint.position.x;
          totalY0 += keypoint.position.y;
        } else if (i === 5) {
          totalX5 += keypoint.position.x;
          totalY5 += keypoint.position.y;
        } else if (i === 6) {
          totalX6 += keypoint.position.x;
          totalY6 += keypoint.position.y;
        }
      }

      frameCount++; // 프레임 수 증가

      // 5초(150프레임) 동안의 평균을 구하고 출력합니다.
      if (frameCount === 150) {
        const avgX0 = totalX0 / 150;
        const avgY0 = totalY0 / 150;
        const avgX5 = totalX5 / 150;
        const avgY5 = totalY5 / 150;
        const avgX6 = totalX6 / 150;
        const avgY6 = totalY6 / 150;

        console.log(`Average of keypoint 0: (${avgX0}, ${avgY0})`);
        console.log(`Average of keypoint 5: (${avgX5}, ${avgY5})`);
        console.log(`Average of keypoint 6: (${avgX6}, ${avgY6})`);

        // 측정을 멈춥니다.
        shouldStop = true;
      }

      // 프로그램을 멈추는 조건을 검사하고, 조건이 충족되면 종료합니다.
      if (shouldStop) {
        return;
      }
 // 키포인트와 스켈레톤을 그리는 함수를 호출합니다.
      drawKeypoints(pose.keypoints, 0.6, context); // 키포인트 그리기 (정확도 설정 가능)
      drawSkeleton(pose.keypoints, 0.6, context); // 스켈레톤 그리기 (정확도 설정 가능)
      // 프레임마다 재귀적으로 predict 함수를 호출합니다.
      requestAnimationFrame(predict);
    });
  }
});

/* PoseNet을 사용하는 함수들 코드 (주석 추가) */

// TensorFlow.js에서 제공하는 파트
const color = "aqua"; // 그리기에 사용할 색상 설정
const boundingBoxColor = "red"; // 바운딩 박스의 색상 설정
const lineWidth = 2; // 그리기 선의 두께 설정

function toTuple({ y, x }) {
  return [y, x]; // TensorFlow.js PoseNet에서 사용되는 튜플로 변환
}

function drawPoint(ctx, y, x, r, color) {
  // 지정한 위치에 원을 그리는 함수
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color; // 원의 색상 설정
  ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  // 두 점을 연결하는 선을 그리는 함수
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale); // 시작점 설정
  ctx.lineTo(bx * scale, by * scale); // 끝점 설정
  ctx.lineWidth = lineWidth; // 선의 두께 설정
  ctx.strokeStyle = color; // 선의 색상 설정
  ctx.stroke(); // 그리기
}

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  // 키포인트 그리기 함수
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color); // 원의 반지름 3으로 키포인트 그리기
  }
}

function drawBoundingBox(keypoints, ctx) {
  // 바운딩 박스 그리기 함수
  const boundingBox = posenet.getBoundingBox(keypoints);

  ctx.rect(
    boundingBox.minX,
    boundingBox.minY,
    boundingBox.maxX - boundingBox.minX,
    boundingBox.maxY - boundingBox.minY
  );

  ctx.strokeStyle = boundingBoxColor; // 바운딩 박스의 선의 색상 설정
  ctx.stroke(); // 바운딩 박스 그리기
}