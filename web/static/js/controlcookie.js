const JWT_NAME = "JWT";

// 쿠키 저장
function setCookie(cookieName, cookieValue){
    document.cookie = cookieName + "=" + cookieValue;
}

// 쿠키 가져오기
function getCookie(cookieName){
    var value = document.cookie.match('(^|;) ?' + cookieName + '=([^;]*)(;|$)');
    return value? value[2] : null;
}

// 쿠키 삭제
function removeCookie(){
    document.cookie = JWT_NAME + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export {setCookie, getCookie, removeCookie};


