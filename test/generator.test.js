import assert from 'assert'
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const programs = [
    {
      name: "one line",
      source: `
        lookAtThisGraph x = 7
      `,
      expected: dedent(`
        let x_1 = 7;
      `),
    },
    {
        name: "simple function",
        source: `
            whenLifeGivesYouLemons int myFunc(int x) { print x }
            `,
        expected: dedent(`
            function myFunc_1(x_1) {
                console.log(x_1)
            }
        `)

    }
]

describe("The code generator", () => {
    for (const program of programs) {
      it(`produces expected js output for the ${program.name} program`, () => {
        const actual = generate(analyze(parse(program.source)))
        assert.deepStrictEqual(actual, program.expected)
      })
    }
  })