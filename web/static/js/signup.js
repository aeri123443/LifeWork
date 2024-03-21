
// endPoint 
let ENDPOINT= "http://127.0.0.1:8080/user/signup"

// 회원가입 입력 변수 선언
let signupData = {
    userName: 'name',
    userId: 'id',
    userPw1: 'pw1',
    userPw2: 'pw2',
    userMail: 'mail',
};

// 회원가입 버튼 클릭
document.getElementById('signin-submit').onclick = function() {
    console.log('signin-submit clicked');
    signupData.userName = document.getElementById('signin_user-name').value;
    signupData.userId = document.getElementById('signin_user-id').value;
    signupData.userPw1 = document.getElementById('signin_user-pw1').value;
    signupData.userPw2 = document.getElementById('signin_user-pw2').value;
    signupData.userMail = document.getElementById('signin_user-mail').value;

    console.log('signupData: ', signupData);

    sendData(ENDPOINT, signupData);
}


// 함수: 데이터 송신
function sendData(_endPoint, data){
    console.log('function: sendData');

    // 오늘 날짜 생성
    let today = new Date();   
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜
    let dataDate = year + '-' + month + '-' + date;

    console.log(JSON.stringify({
        "userID": data.userId,
        "username": data.userName,
        "password": data.userPw1,
        "email": data.userMail,
        "createAt": dataDate
    }));

    fetch("http://127.0.0.1:8080/user/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userID": data.userId,
            "username": data.userName,
            "password": data.userPw1,
            "email": data.userMail,
            "createAt": dataDate
        }),
      })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if(result.token){
            alert("회원가입 성공!");
            const redirectTo = '/templates/basicscore.html'; // 다음 페이지의 URL
            window.location.href = redirectTo;
        }
    });
}

