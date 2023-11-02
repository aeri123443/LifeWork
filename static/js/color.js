// color.css의 색상 변수를 가져옵니다.
// color.css의 색상 변수명에 변동(수정, 삭제, 추가)이 있을 때마다 colorNames 값을 수정해야 합니다.
// 추후 해당 부분 자동화되도록 하겠음.
let colorNames = {
    '--black': null,
    '--blue': null,
    '--skyblue': null,
    '--white': null,
    '--green': null,
    '--red': null,
    '--yellow': null,
}

function getCssVariables(){
    console.log("function: getCssVariables");

    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);

    for (const key in colorNames){
        colorNames[key] = rootStyle.getPropertyValue(key);
    }

    return colorNames;
}

getCssVariables();
export {colorNames};