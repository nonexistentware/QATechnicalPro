const priceList = {
    "Еспрессо" : "10 грн",
    "Американо" : "20 грн",
    "Лате" : "30 грн",
    "Капучино" : "40 грн",
    
    sumPrice: function() {
        let sum = 0;
        for (let key in this) {
            if (typeof this[key] === 'string' && this[key].endsWith('грн')) {
                sum += parseInt(this[key]);
            }
        }
        return sum;
    },

    minPrice: function() {
        const priceArray = Object.entries(this).filter(([key, value]) => 
            typeof value === 'string' && value.endsWith('грн')
        );
        const minItem = priceArray.reduce((min, current) => {
            return parseInt(current[1]) < parseInt(min[1]) ? current : min;
        });

        return `${minItem[0]}  ${minItem[1]}`;
    },

    maxPrice: function() {
        const priceArray = Object.entries(this).filter(([key, value]) => 
            typeof value === 'string' && value.endsWith('грн')
        );
        const maxItem = priceArray.reduce((max, current) => {
            return parseInt(current[1]) > parseInt(max[1]) ? current : max;
        });

        return `${maxItem[0]}  ${maxItem[1]}`;
    }
};

priceList["Мокачино"] = "50 грн";  // Нова властивість

console.log("Об`єкт містить: " + JSON.stringify(priceList));

// сума вартості всіх властивостей об'єкта
const sum = priceList.sumPrice();
console.log("Загльна сума властивостей об'єкта: " + sum + " грн");

// мінімальна вартість властивостей об'єкта
const min = priceList.minPrice();
console.log("Мінімальна вартість: " + min);

// максимальна вартість властивостей об'єкта
const max = priceList.maxPrice();
console.log("Максимальна вартість: " + max);