#include <SoftwareSerial.h>

// 블루투스 모듈 포트 설정 (HM10)
#define BT_RXD 2
#define BT_TXD 3
SoftwareSerial BTSerial(BT_RXD, BT_TXD);

int sensor1 = A5;                 // 압력 1번 보드 A5
int sensor2 = A4;                      // 압력 2번 보드 A4
int sum1 = 0;                     // 1번 압력 측정값 합 저장
int sum2 = 0;                     // 2번 압력 측정값 합 저장
float avg1 = 0.0;                 // 1번 압력 측정값 평균 저장
float avg2 = 0.0;                 // 2번 압력 측정값 평균 저장
int count1 = 0;                   // 1번 압력 측정 횟수 저장
int count2 = 0;                   // 2번 압력 측정 횟수 저장
bool sensorDataRequested = true;  // 센서 데이터 요청

void setup() {
  pinMode(sensor1, INPUT);
  pinMode(sensor2, INPUT);
  Serial.begin(9600);
  BTSerial.begin(9600);
  Serial.println("Bluetooth initial");
}

void loop() {
  for (int j = 0; j < 3; j++) {
    unsigned long Time = millis();  // Time 변수에 millis() 시간 함수 저장

    for (int i = 0; i < 5; i++) {
      while (millis() - Time < 5000) {
        int value1 = analogRead(sensor1);
        int value2 = analogRead(sensor2);

        sum1 = sum1 + value1;
        sum2 = sum2 + value2;

        count1++;
        count2++;

        Serial.println("1번 압력 센서 현재 측정 값: " + String(value1));
        Serial.println("2번 압력 센서 현재 측정 값: " + String(value2));

        delay(500);  // 0.5초 대기
        sensorDataRequested = false;
      }
    }

    avg1 = sum1 / static_cast<float>(count1);  // 1번 압력 센서 평균값 계산
    avg2 = sum2 / static_cast<float>(count2);  // 2번 압력 센서 평균값 계산

    // 평균값 출력
    Serial.println("1번 압력 센서 평균 값: " + String(avg1));
    Serial.println("2번 압력 센서 평균 값: " + String(avg2));

    // 블루투스로 센서 데이터 전송
    BTSerial.write(reinterpret_cast<uint8_t*>(&avg1), sizeof(avg1));
    BTSerial.write(reinterpret_cast<uint8_t*>(&avg2), sizeof(avg2));

    // 재설정
    sum1 = 0;
    sum2 = 0;
    avg1 = 0.0;
    avg2 = 0.0;
    count1 = 0;
    count2 = 0;

    // 대기 시간 추가
    delay(5000);  // 10초 대기
  }

  // 프로그램을 멈춥니다.
  while (true) {
    // 프로그램을 멈춥니다.
  }
}