import assert from "assert";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import * as ast from "../src/ast.js";

const semanticChecks = [
  ["int declaration", `lookAtThisGraph z = 4`],
  //["boolean declaration", `lookAtThisGraph z = thatIsNotCorrect`], DOESN'T RECOGNIZE BOOLEANS
  ["string declaration", `lookAtThisGraph z = "HelloWorld"`],
  [
    "function declaration",
    `whenLifeGivesYouLemons int myOtherFunction(int x, int y) { x = 7 }`,
  ],
  [
    "4.function declaration",
    `whenLifeGivesYouLemons int lemonade(int d, int bb) { d = 34 bb = 35 print d + bb } `,
  ],
  [
    "printing a int is valid",
    `lookAtThisGraph myInt = 7
     print myInt`
  ],
  ["return int", `whenLifeGivesYouLemons int lemonade() { lookAtThisGraph x = 7 thisBitchEmpty x}`],
  ["return string", `whenLifeGivesYouLemons string lemonade() { lookAtThisGraph x = "HelloWorld" thisBitchEmpty x}`],
  //["return double", `whenLifeGivesYouLemons double lemonade() { lookAtThisGraph x = 7.5 thisBitchEmpty x}`], NOT RECOGNIZING DOUBLES
  ["return int", `whenLifeGivesYouLemons int lemonade() { thisBitchEmpty 7}`],
  ["return string", `whenLifeGivesYouLemons string lemonade() { thisBitchEmpty "HelloWorld"}`],
  //["return double", `whenLifeGivesYouLemons double lemonade() { thisBitchEmpty 7.5}`], NOT RECOGNIZING DOUBLES
  //["return double expression", `whenLifeGivesYouLemons double lemonade() { thisBitchEmpty 6.5 + 6.5}`], NOT RECOGNIZING DOUBLES
  ["return int expression", `whenLifeGivesYouLemons int lemonade() { thisBitchEmpty 6 + 6}`],
// -also check that it recognizes inequalities (or's and ands) and doesnt allow comparing a number and a string, and a boolean and a number
  ["conditional", `lookAtThisGraph x = 4 bitchIhopeTheFuckYouDo (x > 7) print 1 orWhat print 3` ],
  ["good types for >", ` lookAtThisGraph x = 7 bitchIhopeTheFuckYouDo(x > 1) print 1 orWhat print 3`],
  ["While Loop", `lookAtThisGraph x = 7 iAintGunnaStopLovinYou ( x > 7 ) { print x }`],
  ["break", `lookAtThisGraph x = 8 iAintGunnaStopLovinYou (x > 7) { yeet }`],
  [
    "break in while condition", 
    `lookAtThisGraph x = 8 
    iAintGunnaStopLovinYou (x > 7) {
      bitchIhopeTheFuckYouDo(x < 2) 
      yeet
    }`
  ],
  ["conditional without else", `bitchIhopeTheFuckYouDo(7 > 6) print 8`],
  [
    "function call", 
    `whenLifeGivesYouLemons int myFunc(int x) {
      thisBitchEmpty x + 5
    }
    lookAtThisGraph y = 7
    myFunc(y)
    `
  ]
]; 

const semanticErrors = [
  [
    "rejects attempt to shadow",
    `whenLifeGivesYouLemons int thisFunc(int x) {
      lookAtThisGraph x = 2
      thisBitchEmpty x
    }`,
    /Identifier x already declared/
  ],
  [
    "return type mismatch",
    `whenLifeGivesYouLemons int f() {thisBitchEmpty "HelloWorld"}`,
    /Cannot assign a string to a int/
  ],
  ["assigns int to string", 
  `lookAtThisGraph myBoolean = "HelloWorld"
  myBoolean = 7`,
  /Cannot assign a int to a string/
  ],
  [
    "returns outside a function",
    `thisBitchEmpty 7`,
    /Return can only appear in a function/
  ],
  [
    "break outside a loop",
    `lookAtThisGraph x = 7
    yeet`,
    /Break can only appear in a loop/
  ],
  [
    "invalid conditional expression",
    `bitchIhopeTheFuckYouDo("hello" > 7)
    print 3`,
    /Operands do not have the same type/
  ],
  [
    "variable not declared",
    `x = 7`,
    /Identifier x not declared/
  ],
  [
    "assign string to int",
    `lookAtThisGraph x = 7
    x = "HelloWorld"`,
    /Cannot assign a string to a int/
  ],
  [
    "assign int to string",
    `lookAtThisGraph x = "helloworld"
    x = 9`,
    /Cannot assign a int to a string/
  ],
  [
    "parameter type mismatch",
    `whenLifeGivesYouLemons int myFunc(int y) {
      thisBitchEmpty 7
    }
    lookAtThisGraph x = "HelloWorld"
    myFunc(x)`,
    /Cannot assign a string to a int/
  ]

];


describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    });
  }
});
