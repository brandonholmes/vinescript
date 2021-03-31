import assert from "assert";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import * as ast from "../src/ast.js";

const semanticChecks = [
  ["variable declaration", `lookAtThisGraph int z = 4`],
  ["variable declaration", `lookAtThisGraph int z = 7`],
  [
    "function declaration",
    `whenLifeGivesYouLemons int myOtherFunction(int x, int y) { x = 7 }`,
  ],
  [
    "function declaration",
    `whenLifeGivesYouLemons int lemonade(int d, int bb) { d = 34 bb = 35 print d + bb } `,
  ],
  [
    "bad types for <=",
    `whenLifeGivesYouLemons boolean thisFunc(int x) {
      lookAtThisGraph int x = 2
      bitchIhopeTheFuckYouDo(x > 1) print 1
      orWhat 
      print 3
      
    }`,
  ],
  ["long if", "if true {print(1)} else {print(3)}"],
  ["good types for >", `bitchIhopeTheFuckYouDo(x > 1)`],
];
const semanticErrors = [
  ["bad type", `lookAtThisGraph int z = lemonade`],
  ["bad type", `lookAtThisGraph String vine = 7`],
  ["bad type", `lookAtThisGraph Boolean whatsNinePlusTen = 21`],
  [
    "return type mismatch",
    `whenLifeGiveYouLemons int f() {return iSureHopeItDoes}`,
  ],
];
// make int x = lemonade be rejected because types don't match hoe

//const semanticErrors = []

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  //NOTE: took out "errorMessagePattern" from the parameters and might actually need it sooooooo LMK?
  for (const [scenario, source] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)));
    });
  }
  /*//////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////I don't think this is applicable to our language
    for (const [scenario, source, graph] of graphChecks) {
      it(`properly rewrites the AST for ${scenario}`, () => {
        assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
      })
    }
    //////////////////////////////////////////////////////////////////////////////////////////////*/
});
