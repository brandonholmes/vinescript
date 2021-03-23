#! /usr/bin/env node

import fs from "fs/promises"
import process from "process"
import compile from "./compiler.js"

const instructions = `vinescript compiler

Syntax: src/vinescript.js <filename> <outputType>

Prints to stdout based on <outputType>, current supported options are:

    ast    the abstract syntax tree
`

async function compileFromFile(filename, outputType) {
    try {
        const buffer = await fs.readFile(filename)
        console.log(compile(buffer.toString(), outputType))
    }
    catch (e) {
        console.error(`${e}`)
        process.exitCode = 1
    }
}

if (process.argv.length !== 4) {
    console.log(instructions)
} else {
    compileFromFile(process.argv[2], process.argv[3])
}