export let value;
let characteristic;

export async function connectBt() {
  const UUID = 0xffe0;
  const CHAR = 0xffe1;

  // 블루투스 디바이스 찾기
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [UUID] }],
  });

  // GATT 서버 연결
  const server = await device.gatt.connect();

  // 서비스 가져오기 (UUID에는 실제 사용 중인 서비스 UUID를 사용)
  const service = await server.getPrimaryService(UUID); // 유효한 16진수로 변경

  // 특성 가져오기 (UUID에는 실제 사용 중인 특성 UUID를 사용)
  characteristic = await service.getCharacteristic(CHAR);
}

export async function btWeb() {
  try {
    // 특성 읽기
    value = await characteristic.readValue();

    // 바이트 배열을 Float32로 변환
    const floatValue = new DataView(value.buffer).getFloat32(0, true);
    console.log("해석된 값1:", floatValue);

    return floatValue;

    // console.log("블루투스 디바이스에 연결됨:", device);
  } catch (error) {
    console.error("블루투스 디바이스에 연결 중 오류 발생:", error);
  }
}
