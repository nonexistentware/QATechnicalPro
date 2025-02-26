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
        email:"andrii@mail.ru" // Нам такі не підходять
    },
];

function checkEmail(arr) {
    const pattern = /@gmail|@yahoo/;
    arr.forEach(user => {
        if (user.email.match(pattern)) {
            console.log(`Email ${user.email} is valid`);
        } else {
            console.log(`Email ${user.email} is not valid`);
        }
    });
}
checkEmail(arr);