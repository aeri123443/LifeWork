import {colorNames} from './color.js';
import {getCookie} from './controlcookie.js';

// 엘리먼트
const dailyHour = document.getElementById("num_daily-hour");
const dailyMin = document.getElementById("num_daily-min");
const dailyScore = document.getElementById("num_daily-score");

// 쿠키
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_ID = "ID";
const jwt = getCookie(COOKIENAME_TOKEN);
const id = getCookie(COOKIENAME_ID);

// 엔드포인트 생성
const dateToday = "2024-01-17"; // 추후 변경 필요
const ENDPOINT_GETUSERSCORE= `http://127.0.0.1:8080/score/statistics/${id}?startDate=${dateToday}&endDate=${dateToday}`;

// 오늘 점수 가져오기
getUserScore(ENDPOINT_GETUSERSCORE);

// 함수: 사용자 점수 획득
function getUserScore(endPoint){
    console.log('function: getBasicScore');
  
    fetch(endPoint, {
      method: "GET",
      headers: {
          Authorization: `Bearer ${jwt}`,
      },
    })
    .then((response) => response.json())
    .then((result) => {
        secondToHour(result[0].time);
        dailyScore.innerHTML = result[0].score;
    })
    .catch((error) => {
      console.error('오류 발생: ' + error);
    }); 
}


// time을 시간/초로
function secondToHour(timeSecond){
    const _hour = Math.floor(timeSecond / 3600);
    const _min = Math.floor( (timeSecond % 3600) / 60 );
    dailyHour.innerHTML = _hour;
    dailyMin.innerHTML = _min;
}