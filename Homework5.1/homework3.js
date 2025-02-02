function pow (x, n) {
    let result = x;
    for (let i = 1; i < n; i++) {
        result *= x;
    }
    return result;
};

const result = pow(2, 3);

console.log(result);
