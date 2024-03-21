import {getCookie} from './controlcookie.js';

const ENDPOINT= "http://127.0.0.1:8080/user/me"
const COOKIENAME_TOKEN = "JWT";
let userName;

// 쿠키 가져오기

const jwt = getCookie(COOKIENAME_TOKEN);

// 토큰 보내서 이름 정보 얻기

fetch(ENDPOINT, {
    method: "GET",
    //credentials: "include",
    headers: {
        //"Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
    },
  })
  .then((response) => response.json())
  .then((result) => {
    userName = result.username;
    document.getElementById("text_user-name").innerHTML = userName;
})
.catch((error) => {
    console.error('오류 발생: ' + error);
});

// 표시하기: text_user-name

//document.getElementById("text_user-name").innerHTML = userName;



