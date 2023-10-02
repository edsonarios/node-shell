export function clearLastLine () {
    process.stdout.cursorTo(0)
    process.stdout.clearLine()
}
