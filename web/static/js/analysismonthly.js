import {colorNames} from './color.js';
import {getCookie} from './controlcookie.js';
import {checkUTC, dateCleansing, calAverage, dataToScore} from './controlData.js';

// 쿠키
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_ID = "ID";
const jwt = getCookie(COOKIENAME_TOKEN);
const id = getCookie(COOKIENAME_ID);

// 타겟 날짜
let targetDate = new Date(2024, 1-1, 17);   // 추후 변경 필요
let targetyear = targetDate.getFullYear();
let targetMonth = targetDate.getMonth();
// 달력 매핑
let monthFristDate = new Date(targetyear, targetMonth, 1);
let monthLastDate = new Date(targetyear, targetMonth+1, 0);
// 엔드포인트 생성
const startDate = `${targetyear}-${targetMonth+1}-01`;
const endDate = `${targetyear}-${targetMonth+1}-${monthLastDate.getDate()}`;
const ENDPOINT_GETUSERSCORE= `http://127.0.0.1:8080/score/statistics/${id}?startDate=${startDate}&endDate=${endDate}`;

const monthlyScore = document.getElementById("num_monthly-score");

// 히트맵 데이터
let heatmapData = [];
const heatmapX = ['일', '월', '화', '수', '목', '금', '토'];
const heatmapY = [0]; //week no.

// 데이터 가져오기
fetch(ENDPOINT_GETUSERSCORE, {
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
    let weekNum = 0;
    for (let x of result){
      // UTC 변환
      x.date = checkUTC(x.date);
      // json에 담기
      const temp = {x: heatmapX[x.date.getDay()], y: heatmapY[weekNum], value: x.score, date: dateCleansing(x.date)};
      heatmapData.push(temp);
      if (temp.x == '토') {
        weekNum++;
        heatmapY.push(weekNum);
      };
    }
    
    // 히트맵 그리기
    drawMonthlyChart(); 

    monthlyScore.innerHTML = Math.floor( calAverage( dataToScore(result) ) );
    
})
.catch((error) => {
  console.error('오류 발생: ' + error);
}); 


// 함수: 히트맵 그리기
function drawMonthlyChart(){

  // 상위 요소 속성 가져오기
  const divMonthlyChart = document.getElementById('monthly-linechart');

  // 그래프 틀

  let monthlyChartWidth = parseFloat(getComputedStyle(divMonthlyChart).width.replace('px',''));
  let monthlyChartHeight = parseFloat(getComputedStyle(divMonthlyChart).height.replace('px',''));

  var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = monthlyChartWidth - margin.left - margin.right,
    height = monthlyChartHeight - margin.top - margin.bottom;

  var svg = d3.select("#monthly-linechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // X, Y축 설정

  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(heatmapX)
    .padding(0.01);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(heatmapY.reverse())
    .padding(0.01);
  svg.append("g")
    .attr("display", "none")
    .call(d3.axisLeft(y));

  // 맵 색상 지정 (범위 수정 필요)
  var myColor = d3.scaleLinear()
    .range([colorNames['--rangeRed'], colorNames['--rangeYellow'], colorNames['--rangeGreen']])
    .domain([60, 80, 100])

  // 툴팁 디자인
  var tooltip = d3.select("#monthly-linechart")
  .append("div")
  .attr("class", "tooltip")

  // 마우스 이벤트

  var mouseover = function(event, d) {
    tooltip.style("opacity", 1);
    d3.select(this)
    .style("transition", "all 0.2s ease-in-out")
    .style("opacity", 0.5)
  }

  var mousemove = function(d, event) {
    const rectHoveredPosition = getRectPosition(this);
    const tooltipX = rectHoveredPosition.x + rectHoveredPosition.width / 3;
    const tooltipY = rectHoveredPosition.y - 10;
    tooltip
      .html(`<b>${d.date}</b><br>Value: ${d.value}`)
      .style("position", "absolute")
      .style("transition", "all 0.2s ease-in-out")
      .style("left", `${tooltipX}px`)
      .style("top", `${tooltipY}px`)
  }

  var mouseleave = function(d) {
    tooltip.style("opacity", 0);
    d3.select(this)
    .style("transition", "all 0.2s ease-in-out")
    .style("opacity", 1)
  }

  // 함수: rect의 포지션 정보 반환
  function getRectPosition(rect) {
    const x = parseFloat(rect.getAttribute("x"));
    const y = parseFloat(rect.getAttribute("y"));
    const width = parseFloat(rect.getAttribute("width"));
    const height = parseFloat(rect.getAttribute("height"));

    return { x, y, width, height};
  }

  // 히트맵 데이터 매핑
  svg.selectAll()
    .data(heatmapData)
    .enter().append("rect")
    .attr("x", function(d) { return x(d.x) })
    .attr("y", function(d) { return y(d.y) })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return myColor(d.value)} )
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
}
