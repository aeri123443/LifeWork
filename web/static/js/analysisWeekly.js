import {colorNames} from './color.js';
import {getCookie} from './controlcookie.js';
import {calAverage, dateToLabel, dataToScore} from './controlData.js';

// 엘리먼트
const canvasWeeklyLinechart = document.getElementById('canvas_weekly-linechart').getContext('2d');
const weeklyScore = document.getElementById("num_weekly-score");

// 쿠키
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_ID = "ID";
const jwt = getCookie(COOKIENAME_TOKEN);
const id = getCookie(COOKIENAME_ID);

// 주간 데이터 통신

// 엔드포인트 생성
const startDate = "2024-01-14"; // 추후 변경 필요
const endDate = "2024-01-20"; // 추후 변경 필요
const ENDPOINT_GETUSERSCORE= `http://127.0.0.1:8080/score/statistics/${id}?startDate=${startDate}&endDate=${endDate}`;

// 주간 차트 생성
displayWeeklyChart(ENDPOINT_GETUSERSCORE);

// 함수: 주간 차트 생성
function displayWeeklyChart(endPoint){
    console.log('function: getBasicScore');

    // 오늘 점수 가져오기
    fetch(endPoint, {
      method: "GET",
      headers: {
          Authorization: `Bearer ${jwt}`,
      },
    })
    .then((response) => response.json())
    .then((result) => {
        // 데이터 날짜순 정렬
        result.sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return 0;
        });
        // x,y축 데이터 리스트
        let labelData = dateToLabel(result);
        let chartData = dataToScore(result);
        // 평균 점수 표시
        weeklyScore.innerHTML = Math.floor( calAverage(chartData) );
        drawWeeklyChart(canvasWeeklyLinechart, labelData, chartData);
    })
    .catch((error) => {
      console.error('오류 발생: ' + error);
    }); 
}

// 함수: 주별 라인차트 그리기
function drawWeeklyChart(chartArea, labelData, chartData){
    const chartBackgroundColor = `rgba${colorNames['--skyblue'].slice(3, -1)}, ${'0.4)'}`;

    // 차트 기본 설정
    Chart.defaults.font.size = 16;
    Chart.defaults.font.family = 'Pretendard Variable';
    Chart.defaults.color = colorNames['--black'];

    // 창 크기 변동 시 차트가 넘어가는 문제 발생: 추후 수정 요망
    let weeklyLinechart = new Chart(chartArea, {
        type: 'line',
        data: {
            labels: labelData,
            datasets: [{
                data: chartData,
                borderColor: colorNames['--blue'],
                borderWidth: 1,
                fill: 'start',
                backgroundColor: chartBackgroundColor
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x:{
                    ticks: {
                        padding: 16
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        padding: 16
                    },
                }
            },
            plugins:{
                legend: {
                    display: false
                }
            }
        }
    });
}
