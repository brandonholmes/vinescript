import assert from "assert";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
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
            whenLifeGivesYouLemons int myFunc(int y) { youKnowWhatIAmGonnaSayIt y }
            `,
    expected: dedent(`
            function myFunc_1(y_2) {
                console.log(y_2);
            }
        `),
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
        `),
  },
  {
    name: "unary expression",
    source: `lookAtThisGraph x = 7 x++`,
    expected: dedent(`
            let x_1 = 7;
            x_1++;
        `),
  },
  {
    name: "if statement",
    source: `lookAtThisGraph x = 4 bitchIHopeTheFuckYouDo (x > 7) youKnowWhatIAmGonnaSayIt 1 orWhat youKnowWhatIAmGonnaSayIt 3`,
    expected: dedent(`
            let x_1 = 4;
            if(x_1 > 7) {
                console.log(1);
            } else {
                console.log(3);
            }
        `),
  },
  {
    name: "while statement",
    source: `lookAtThisGraph happy = thatIsNotCorrect iAintNevaGunnaStopLuvinYouBiiitch ( happy ) { youKnowWhatIAmGonnaSayIt "Dance" }`,
    expected: dedent(`
            let happy_1 = false;
            while(happy_1) {
                console.log("Dance");
            }
        `),
  },
  {
    name: "if without else",
    source: `bitchIHopeTheFuckYouDo(7 > 6) youKnowWhatIAmGonnaSayIt 8`,
    expected: dedent(`
            if(7 > 6) {
                console.log(8);
            }
        `),
  },
  {
    name: "multiple parameter function",
    source: `whenLifeGivesYouLemons int myFunc(int x, int y) {youKnowWhatIAmGonnaSayIt x + y}`,
    expected: dedent(`
            function myFunc_1(x_2, y_3) {
                console.log(x_2 + y_3);
            }
        `),
  },
  {
    name: "function with return",
    source: `whenLifeGivesYouLemons double lemonade() { thisBitchEmpty 6.5 + 6.5}`,
    expected: dedent(`
            function lemonade_1() {
                return 6.5 + 6.5;
            }
        `),
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
        `),
  },
  {
    name: "break",
    source: `lookAtThisGraph x = 8 iAintNevaGunnaStopLuvinYouBiiitch (x > 7) { yeet }`,
    expected: dedent(`
            let x_1 = 8;
            while(x_1 > 7) {
                break;
            }
        `),
  },
  {
    name: "long function",
    source: `
            lookAtThisGraph start = 1
            lookAtThisGraph end = 100
            
            whenLifeGivesYouLemons int myGenerator(int x) {
                thisBitchEmpty x + 1
            }

            iAintNevaGunnaStopLuvinYouBiiitch (start < end) {
                start = myGenerator(start)
                bitchIHopeTheFuckYouDo((start / 2) != 0) 
                    youKnowWhatIAmGonnaSayIt start
                
            }
        `,
    expected: dedent(`
            let start_1 = 1;
            let end_2 = 100;

            function myGenerator_3(x_4) {
                return x_4 + 1;
            }

            while(start_1 < end_2) {
                start_1 = myGenerator_3(start_1);
                if(start_1 / 2 != 0) {
                    console.log(start_1);
                }
            }
        `),
  },
];

describe("The code generator", () => {
  for (const program of programs) {
    it(`produces expected js output for the ${program.name} program`, () => {
      const actual = generate(analyze(parse(program.source)));
      assert.deepStrictEqual(actual, program.expected);
    });
  }
});
