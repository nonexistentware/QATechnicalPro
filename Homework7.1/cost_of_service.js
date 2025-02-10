const priceList =  {
    "Еспрессо" : "10 грн",
    "Американо" : "20 грн",
    "Лате" : "30 грн"
}
priceList["Капучино"] = "40 грн";


console.log("Об`кт містить: " + priceList); 

// сума вартості всіх властивостей об'єкта
function sumPrice(priceList) {
    let sum = 0;
    for (let key in priceList) {
        sum += parseInt(priceList[key]);
    }
    return sum;
};

// мінімальна вартість властивостей об'єкта
function minPrice(priceList) {
    const priceArray = Object.entries(priceList);
    const minItem = priceArray.reduce((min, current) => {
        return parseInt(current[1]) < parseInt(min[1]) ? current : min;
    });

    return `${minItem[0]}  ${minItem[1]}`;
}

// максимальна вартість властивостей об'єкта
function maxPrice(priceList) {
    const priceArray = Object.entries(priceList);
    const minItem = priceArray.reduce((min, current) => {
        return parseInt(current[1]) > parseInt(min[1]) ? current : min;
    });

    return `${minItem[0]}  ${minItem[1]}`;
} 

// сума вартості всіх властивостей об'єкта
const sum = sumPrice(priceList);
console.log("Загльна сума властивостей об'єкта: " + Object.keys(priceList)+ " " + sumPrice(priceList) + " грн");


// мінімальна вартість властивостей об'єкта
const min = minPrice(priceList);
console.log("Мінімальна вартість: " + min);

// максимальна вартість властивостей об'єкта
const max = maxPrice(priceList);
console.log("Максимальна вартість: " + max);
 