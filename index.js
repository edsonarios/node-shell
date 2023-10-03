import readline from 'readline'
import keypress from 'keypress'
import { exec } from 'child_process'
import { getSuggestion } from './src/suggestion.js'
import { clearLastLine } from './src/utils.js'
import { config } from './config.js'

let currentInput = ''
let suggestion = ''
const completeCommands = ['cd proyect', 'ls -la', 'mkdir carpeta', 'npm start', 'cd otro']
let prompt = ''

// Init config
keypress(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

let themeFunction

async function loadTheme () {
    try {
        const themeModule = await import(`./src/themes/${config.activeTheme}.js`)
        themeFunction = themeModule.theme
        displayPrompt()
    } catch (error) {
        console.error('default theme loaded')
        const themeModule = await import('./src/themes/default.js')
        themeFunction = themeModule.theme
        displayPrompt()
    }
}

function displayPrompt () {
    if (!themeFunction) {
        return
    }
    prompt = themeFunction()
    process.stdout.write(prompt + currentInput)
}

function endRunCommand () {
    currentInput = ''
    displayPrompt()
}

function handleKeyPress (ch, key) {
    if (key && key.ctrl && key.name === 'c') {
        process.exit()
    }
    if (ch) {
        currentInput += ch
    }
    if (key && key.name === 'backspace') {
        currentInput = currentInput.slice(0, -2)
    }
    if (key && key.ctrl && key.name === 'u') {
        currentInput = ''
    }

    clearLastLine()
    displayPrompt()

    suggestion = getSuggestion(completeCommands, currentInput)
    if (suggestion && currentInput.length !== 0) {
        process.stdout.write('\x1b[36m' + suggestion + '\x1b[0m')
        process.stdout.cursorTo(prompt.length + currentInput.length)
    }

    if (key && key.name === 'return') {
        if (currentInput.startsWith('cd ')) {
            handleCD(currentInput)
        } else {
            handleCommandExecution(currentInput)
        }
    }
}

function handleCD (command) {
    try {
        process.chdir(command.slice(3).trim())
        process.stdout.write('\n')
        endRunCommand()
    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
}

function handleCommandExecution (command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            process.stdout.write(`\nError ejecutando el comando: ${error.message}`)
        }
        if (stdout || stdout.length === 0) {
            process.stdout.write('\n' + stdout)
            endRunCommand()
        }
        if (stderr) {
            // console.error(stderr);
        }
    })
}

process.stdin.on('keypress', handleKeyPress)

readline.createInterface({
    input: process.stdin,
    output: null
}).on('close', () => {
    console.log('\n¡Hasta luego!')
    process.exit(0)
})

loadTheme()
