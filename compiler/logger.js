


export function error(uki, message, line) {
    console.error(`Error: ${message}`)
    uki.hadError = true;
}

