import assert from "assert"
import parse from "../src/parser.js"

const goodPrograms = [

]

const badPrograms = [

]

describe("The parser", () => {
    for(const program of goodPrograms) {
        it(`recognizes good programs`, () => {
            assert.ok(parse(program))
        })
    }
    for(const program of badPrograms) {
        it(`rejects bad programs`, () => {
            assert.ok(!parse(program))
        })
    }
})