const readline = require('readline')
const keypress = require('keypress')
const { exec } = require('child_process')
const { getSuggestion } = require('./src/suggestion')

let currentInput = ''
let suggestion = ''
const completeCommands = ['cd proyecto', 'ls -la', 'mkdir carpeta', 'npm start', 'cd otro']
const header = '>_ '
let currentDirectory = ''
// Init config
keypress(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

function displayPrompt () {
    currentDirectory = process.cwd()
    process.stdout.write(currentDirectory + header + currentInput)
}

function clearLastLine () {
    process.stdout.cursorTo(0)
    process.stdout.clearLine()
}

function endRunCommand () {
    currentInput = ''
    displayPrompt()
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

async function handleCommandExecution (command) {
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

async function handleKeyPress (ch, key) {
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
        process.stdout.cursorTo(currentInput.length + currentDirectory.length + header.length)
    }

    if (key && key.name === 'return') {
        if (currentInput.startsWith('cd ')) {
            handleCD(currentInput)
        } else {
            await handleCommandExecution(currentInput)
        }
    }
}

process.stdin.on('keypress', handleKeyPress)

readline.createInterface({
    input: process.stdin,
    output: null
}).on('close', () => {
    console.log('\n¡Hasta luego!')
    process.exit(0)
})

displayPrompt()
