///// 코드 정리중인 파일로, 현재 동작 자체에 영향을 주지 않는 파일입니다.

import {colorNames} from './color.js';
import {getCookie} from './controlcookie.js';

// 엘리먼트

// 일간 엘리먼트
const dailyHour = document.getElementById("num_daily-hour");
const dailyMin = document.getElementById("num_daily-min");
const dailyScore = document.getElementById("num_daily-score");

// 주간 엘리먼트
const canvasWeeklyLinechart = document.getElementById('canvas_weekly-linechart').getContext('2d');
const weeklyScore = document.getElementById("num_weekly-score");

// 월간 엘리먼트
const monthlyScore = document.getElementById("num_monthly-score");

// 쿠키
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_ID = "ID";
const jwt = getCookie(COOKIENAME_TOKEN);
const id = getCookie(COOKIENAME_ID);