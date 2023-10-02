export function getSuggestion (commands, currentInput) {
    for (const command of commands) {
        if (command.startsWith(currentInput)) {
            return command.slice(currentInput.length)
        }
    }
    return ''
}
