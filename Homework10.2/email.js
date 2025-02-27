let arr = [
    {
        userName:"Test",
        lastName:"Test",
        email:"test.test@gmail.com"
    },
    {
        userName:"Dmitro",
        lastName:"Porohov",
        email:"dmitro.porohov@yahoo.com"
    },
    {
        userName:"Andrii",
        lastName:"",
        email:"andrii@mail.ru" 
    },

    {
        userName:"Ivan", //тестовий кастомер з невалідним імейлом 
        lastName:"testuser",
        email:"@#%@#5 #hgjtl.com"
    },

    {
        userName:"Customer11", //тестовий кастомер з невалідним імейлом 
        lastName:"Test999",
        email:"імейл@gmail.com"
    }
];

function checkEmail(arr) {
    const pattern = /@gmail|@yahoo/;
    const pattern2 = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/; //додав валідацію для перевірки імейлу перед @
    arr.forEach(user => {
        if (user.email.match(pattern) && user.email.match(pattern2)) {
            console.log(`Email ${user.email} is valid`);
        } else {
            console.log(`Email ${user.email} is not valid`);
        }
    });
}
checkEmail(arr);