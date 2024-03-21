const arrDay = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * UTC 조정 (영국 시간으로 전달되는 문제 해결)
 * @param {Date} stringDate sql date field
 * @returns 노트북 기준 date
 */
function checkUTC(stringDate){
    const date = new Date(stringDate);
    return date;
}

/**
 * 날짜 데이터 정제 (ex. 2023-10-29 -> 10/29/일)
 * @param {Date} date ex. 2023-10-29
 * @returns ex. 10/29/일
 */
function dateCleansing(date){
    const dateMonth = date.getMonth()+1;
    const dateDate = date.getDate();
    const dateDay = date.getDay();
    const dateFormat = `${dateMonth}/${dateDate}/${arrDay[dateDay]}`;

    return dateFormat;
}

function calAverage(targetArr){
    const sum = targetArr.reduce((total, currentValue) => total + currentValue, 0);
    const average = sum / targetArr.length;
    return average;
}


/**
 * 날짜 라벨 리스트 생성
 * @param {Array} data fench result
 * @returns 날짜 라벨 리스트
 */
function dateToLabel(data){
    let _labelData = [];
    for(let i=0; i<data.length; i++){
        let date = data[i].date;
        date = checkUTC(date);
        const dateFormat = dateCleansing(date);
        _labelData.push(dateFormat);
    }
    return _labelData;
}

/**
 * 점수 데이터 리스트 생성
 * @param {Array} data fench result
 * @returns 점수 데이터 리스트 
 */
function dataToScore(data){
    let _chartData = [];
    for(let i=0; i<data.length; i++){
        let dataData = data[i].score;
        _chartData.push(dataData);  
    }
    return _chartData;
}

export {checkUTC, dateCleansing, calAverage, dateToLabel, dataToScore}

