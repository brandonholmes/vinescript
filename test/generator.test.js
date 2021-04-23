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
            whenLifeGivesYouLemons int myFunc(int y) { print y }
            `,
        expected: dedent(`
            function myFunc_1(y_2) {
                console.log(y_2);
            }
        `)
    },
    {
        name: "binary expression",
        source: `
            lookAtThisGraph x = 7
            x = x + 9
        `,
        expected: dedent(`
            let x_1 = 7;
            x_1 = x_1 + 9;
        `)
    },
    {
        name: "unary expression",
        source: `lookAtThisGraph x = 7 x++`,
        expected: dedent(`
            let x_1 = 7;
            x_1++;
        `)
    },
    {
        name: "if statement",
        source: `lookAtThisGraph x = 4 bitchIhopeTheFuckYouDo (x > 7) print 1 orWhat print 3`,
        expected: dedent(`
            let x_1 = 4;
            if(x_1 > 7) {
                console.log(1);
            } else {
                console.log(3);
            }
        `
        )
    },
    {
        name: "while statement",
        source: `lookAtThisGraph happy = thatIsNotCorrect iAintGunnaStopLovinYou ( happy ) { print "Dance" }`,
        expected: dedent(`
            let happy_1 = false;
            while(happy_1) {
                console.log("Dance");
            }
        `)
    },
    {
        name: "if without else",
        source: `bitchIhopeTheFuckYouDo(7 > 6) print 8`,
        expected: dedent(`
            if(7 > 6) {
                console.log(8);
            }
        `)
    },
    {
        name: "multiple parameter function",
        source: `whenLifeGivesYouLemons int myFunc(int x, int y) {print x + y}`,
        expected: dedent(`
            function myFunc_1(x_2, y_3) {
                console.log(x_2 + y_3);
            }
        `)
    },
    {
        name: "function with return",
        source: `whenLifeGivesYouLemons double lemonade() { thisBitchEmpty 6.5 + 6.5}`,
        expected: dedent(`
            function lemonade_1() {
                return 6.5 + 6.5;
            }
        `)
    },
    {
        name: "function call",
        source: `whenLifeGivesYouLemons int myFunc(int x) {
            thisBitchEmpty x + 5
          }
          lookAtThisGraph y = 7
          myFunc(y)`,
        expected: dedent(`
          function myFunc_1(x_2) {
              return x_2 + 5;
          }
          let y_3 = 7;
          myFunc_1(y_3);
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