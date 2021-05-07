import assert from "assert";
import parse from "../src/parser.js";
import * as ast from "../src/ast.js";

const source = `
  lookAtThisGraph x = 7
  x++
  x--
`;
const expectedAST = new ast.Program([
  new ast.VariableDeclaration(new ast.Variable("x", false), 7n),
  new ast.UnaryExpression("++", new ast.IdentifierExpression("x")),
  new ast.UnaryExpression("--", new ast.IdentifierExpression("x")),
]);

const goodPrograms = [
  `["myFirst", "mySecond", "myThird"]`,
  `lookAtThisGraph x = 5`,
  `whenLifeGivesYouLemons int myFunction(int y) {
        lookAtThisGraph x = 5 
        youKnowWhatIAmGonnaSayIt x
      }
    myFunction(x)`,
  `whenLifeGivesYouLemons int myOtherFunction(int x, int y) {
    lookAtThisGraph z = x - y
    lookAtThisGraph a = "test"
    youKnowWhatIAmGonnaSayIt x
    youKnowWhatIAmGonnaSayIt a
    return a
  }`,
  `iAintNevaGunnaStopLuvinYouBiiitch(x < 5) { x++ }`,
  `bitchIHopeTheFuckYouDo(x andIoop y) youKnowWhatIAmGonnaSayIt 14 / 2 orWhat youKnowWhatIAmGonnaSayIt 14 * 2`,
  `bitchIHopeTheFuckYouDo(x > 5) x = 7 orWhat x = -7`,
  `lookAtThisGraph greeting = "Hello World"
    youKnowWhatIAmGonnaSayIt greeting`,
  `whenLifeGivesYouLemons int fibonacci(int n) {
       bitchIHopeTheFuckYouDo(n == 0) 
           thisBitchEmpty 0
       orWhat
           lookAtThisGraph x = 0
           lookAtThisGraph y = 1
           lookAtThisGraph i = 1
           iAintNevaGunnaStopLuvinYouBiiitch(i < n) {
               lookAtThisGraph z = x + y
               x = y
               y = z
           }
           thisBitchEmpty y

    }
    lookAtThisGraph times = 10
    fibonacci(times)`,
];

const badPrograms = [
  `whenLifeGivesYouLemons int myFunction(params) {lookAtThisGraph x = 5}`,
  `whenLifeGivesYouLemons myFunction(y) {
    lookAtThisGraph x = 5 
    youKnowWhatIAmGonnaSayIt x
  }
  myFunction(x)`,
  `whenLifeGivesYouLemons myOtherFunction(x, y) {
    lookAtThisGraph z = x - y
    lookAtThisGraph a = "test"
    youKnowWhatIAmGonnaSayIt x
    youKnowWhatIAmGonnaSayIt a
  }`,
  `lookAtThisGraph x`,
  `bitchIHopeTheFuckYouDo(youreNotMyDad) x = 7 orWhat x = -7`,
  `x +`,
  `youKnowWhatIAmGonnaSayIt )`,
];

describe("The parser", () => {
  it("produces a correct AST", () => {
    assert.deepStrictEqual(parse(source), expectedAST);
  });
});

describe("The parser", () => {
  for (const program of goodPrograms) {
    it(`recognizes good programs`, () => {
      assert.ok(parse(program));
    });
  }
  for (const program of badPrograms) {
    it(`rejects bad programs`, () => {
      assert.throws(() => parse(program));
    });
  }
});
