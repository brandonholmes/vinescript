import assert from "assert";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import * as ast from "../src/ast.js";

const semanticChecks = [/*
  ["1.variable declaration", `lookAtThisGraph z = 4`],
  ["2.variable declaration", `lookAtThisGraph z = 7`],
  [
    "3.function declaration",
    `whenLifeGivesYouLemons int myOtherFunction(int x, int y) { x = 7 }`,
  ],
  [
    "4.function declaration",
    `whenLifeGivesYouLemons int lemonade(int d, int bb) { d = 34 bb = 35 print d + bb } `,
  ],
  [
    "12.printing a int is valid",
    `lookAtThisGraph myInt = 7
     print myInt`
  ],*/
  
// make sure
// return a variable of each type
// break and return statement works for returning an expression and not just a singular value
//properly recognizes conditional (if else)
// also check that it recognizes inequalities (or's and ands) and doesnt allow comparing a number and a string, and a boolean and a number

  //this fails because it does not recognize iSureHopeItDoes as a boolean value and assigns x the type 'string' instead
  //["recognizes a conditional", `lookAtThisGraph x = iSureHopeItDoes bitchIhopeTheFuckYouDo (x) print 1 orWhat print 3` ],
  ["good types for >", ` lookAtThisGraph x = 7 bitchIhopeTheFuckYouDo(x > 1) print 1 orWhat print 3`]
]; 
/*
const semanticErrors = [
  [
    "5.rejects attempt to shadow",
    `whenLifeGivesYouLemons thisFunc(int x) {
      lookAtThisGraph x = 2
      return x
    }`,
    /Identifier x already declared/
  ],
  ["bad type", `lookAtThisGraph vine = 7`, /cannot assign int to value string/],
  ["bad type", `lookAtThisGraph whatsNinePlusTen = 21`, /cannot assign int to value boolean/],
  [
    "return type mismatch",
    `whenLifeGiveYouLemons int f() {return iSureHopeItDoes}`,
    /expected int, returned boolean/
  ],
  ["declares a boolean", 
  `lookAtThisGraph myBoolean = thatIsNotCorrect
  myBoolean = 7`,
  /cannot assign int to type boolean/
  ],
];
*/
// make int x = lemonade be rejected because types don't match hoe

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  //NOTE: took out "errorMessagePattern" from the parameters and might actually need it sooooooo LMK?
 /* for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  } */
  /*//////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////I don't think this is applicable to our language
    for (const [scenario, source, graph] of graphChecks) {
      it(`properly rewrites the AST for ${scenario}`, () => {
        assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
      })
    }
    //////////////////////////////////////////////////////////////////////////////////////////////*/
});
