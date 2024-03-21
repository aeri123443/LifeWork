// 아이디, 비밀번호 임시로 하나
// aaaa
// Aaaa1111!
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWEiLCJpYXQiOjE2OTgzMzI2MzYsImV4cCI6MTY5ODQxOTAzNn0.APQGH_Nt8y3MZtC4dhU7To_fgUGWilF45h5V0VJ1X0c"
// endPoint 

import {setCookie} from './controlcookie.js';

const ENDPOINT= "http://127.0.0.1:8080/user/login";
const COOKIENAME_TOKEN = "JWT";
const COOKIENAME_USERID = "ID";

// 로그인 입력 변수 선언
let loginData = {
    userId: 'id',
    userPw: 'pw',
};

// 회원가입 버튼 클릭
document.getElementById('login-submit').onclick = function() {
    console.log('signin-submit clicked');
    loginData.userId = document.getElementById('user_id').value;
    loginData.userPw = document.getElementById('user_pw').value;
    // const keepLogin = document.getElementById('checkbox_keep-login').checked;
    console.log('loginData: ', loginData);
    // console.log('keepLogin: ', keepLogin);

    sendData(ENDPOINT, loginData);

}


// 함수: 데이터 송신
function sendData(_endPoint, data){

    console.log('function: sendData');

    console.log(JSON.stringify({
        "userID": data.userId,
        "password": data.userPw
    }));

    fetch(ENDPOINT, {
        method: "POST",
        //credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userID": data.userId,
            "password": data.userPw
        }),
      })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);//
        redirectLogin(result)
    }).catch((error) => {
        console.error('오류 발생: ' + error);
    });
}

// 함수: 로그인 후 리디렉션
function redirectLogin(result){
    console.log('function: redirectLogin');

    // 로그인 성공시 리디렉션
    if (result.token) {
        // 토큰 쿠키 저장 (일단 보안 신경 안씀)
        setCookie(COOKIENAME_TOKEN, result.token);
        setCookie(COOKIENAME_USERID, result.userID);
        
        const redirectTo = '/templates/monitoring.html'; // 다음 페이지의 URL
        window.location.href = redirectTo;

        console.log("리디엑션");
    } else {
        console.log('로그인 실패: ' + result.message);
        // 로그인 실패 시 처리
    }
}
