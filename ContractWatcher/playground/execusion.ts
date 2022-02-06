function square(num: number) {
    let answer = num * num
    return answer
}

function main() {
    let n = 2
    console.log(n)
    console.log("n:", n)
    square(4)

    let x = square(n)
    console.log("x:", x)
    let y;
    y = square(4)
    console.log("y:", y)

}

main()