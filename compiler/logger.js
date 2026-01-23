
export function error(utkrisht, message, line) {
    const red = "\x1b[31m";
    const reset = "\x1b[0m";

    console.error(`${red}Error on line ${line}${reset}: ${message}`)
    utkrisht.hadError = true;
}



