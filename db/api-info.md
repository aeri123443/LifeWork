## API 설계서

### 1. 사용자 관리 및 인증

#### 1.1 회원 가입

- **요청**: `POST /user/signup`
- **요청 본문**:
  ```json
  {
    "userID": "사용자 고유 ID",
    "username": "사용자 이름",
    "password": "비밀번호",
    "email": "이메일 주소",
    "createAt": "계정 생성 일시"
  }
  ```
- **응답**:
  - 성공 시: 201 Created
    ```json
    {
      "token": "JWT_토큰",
      "userID": "사용자 고유 ID"
    }
    ```
  - 이미 존재하는 사용자인 경우: 409 Conflict
    ```json
    {
      "message": "사용자 ID가 이미 존재합니다."
    }
    ```

#### 1.2 로그인

- **요청**: `POST /user/login`
- **요청 본문**:
  ```json
  {
    "userID": "사용자 고유 ID",
    "password": "비밀번호"
  }
  ```
- **응답**:
  - 성공 시: 200 OK
    ```json
    {
      "token": "JWT_토큰",
      "userID": "사용자 고유 ID"
    }
    ```
  - 사용자가 존재하지 않거나 비밀번호가 일치하지 않는 경우: 401 Unauthorized
    ```json
    {
      "message": "인증에 실패했습니다. 사용자 ID 또는 비밀번호를 확인하세요."
    }
    ```

#### 1.3 현재 사용자 프로필 조회

- **요청**: `GET /user/me`
- **요청 헤더**: Authorization 헤더에 JWT 토큰을 포함
- **응답**:
  - 성공 시: 200 OK
    ```json
    {
      "token": "JWT_토큰",
      "username": "사용자 이름"
    }
    ```
  - 인증되지 않은 요청인 경우: 401 Unauthorized
    ```json
    {
      "message": "인증되지 않았습니다. 로그인 후 다시 시도하세요."
    }
    ```
  - 사용자를 찾을 수 없는 경우: 404 Not Found
    ```json
    {
      "message": "사용자를 찾을 수 없습니다."
    }
    ```

#### 1.4 기준 점수 가져오기

- **요청**: `GET /user/basicScores/:id`
- **요청 파라미터**: id (사용자 ID)
- **응답**:
  - 성공 시: 200 OK
    ```json
    {
      "scores": [
        {
          "userID": "userId",
          "nackScore": "목 기준 각도",
          "wristScore": "손목 기준 압력"
        }
      ]
    }
    ```

### 2. 점수 관리

#### 2.1 특정 사용자의 점수 조회

- **요청**: `GET /score/:id`
- **요청 파라미터**: id (사용자 ID)
- **요청 헤더**: Authorization 헤더에 JWT 토큰을 포함
- **응답**:
  - 성공 시: 200 OK
    ```json
    {
      "scores": [
        {
          "Date": "날짜",
          "Score": "점수",
          "time": "측정 시간"
        }
        // 다른 점수 데이터
      ]
    }
    ```
  - 인증되지 않은 요청인 경우: 401 Unauthorized
    ```json
    {
      "message": "인증되지 않았습니다. 로그인 후 다시 시도하세요."
    }
    ```
  - 사용자를 찾을 수 없는 경우: 404 Not Found
    ```json
    {
      "message": "사용자를 찾을 수 없습니다."
    }
    ```

#### 2.2 새로운 점수 생성

- **요청**: `POST /score`
- **요청 본문**:
  ```json
  {
    "userID": "사용자 고유 ID",
    "score": "점수",
    "time": "측정 시간"
  }
  ```
- **요청 헤더**: Authorization 헤더에 JWT 토큰을 포함
- **응답**:
  - 성공 시: 201 Created
    ```json
    {
      "message": "점수 데이터가 성공적으로 저장되었습니다."
    }
    ```
  - 인증되지 않은 요청인 경우: 401 Unauthorized
    ```json
    {
      "message": "인증되지 않았습니다. 로그인 후 다시 시도하세요."
    }
    ```
