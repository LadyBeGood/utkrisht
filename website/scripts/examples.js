
export const examples = {
    "prime": `
# Checks if a number is prime or not
is-prime number ~ {
    when number < 2
        exit wrong

    loop 2..<number with i
        when remainder number, i = 0
            exit wrong 

    exit right
}

write is-prime 117

`,

    "bubble-sort": `
bubble-sort numbers ~ {
    loop numbers with [i]
        loop 1..((length numbers) - j - 2) with j
            when numbers.(j) > numbers.(j + 1)
                [numbers.(j), numbers.(j + 1)] = [numbers.(j + 1), numbers.(j)]

    exit numbers
}

`,

    "fibonacci": `
fibonacci number ~ {
    when number < 2
        exit number
    exit (fibonacci number - 1) + fibonacci number - 2
}
`

}
