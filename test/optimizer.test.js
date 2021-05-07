import assert from "assert";
import optimize from "../src/optimizer.js";
import * as ast from "../src/ast.js";

// Make some test cases easier to read
const x = new ast.Variable("x", false);
const xpp = new ast.UnaryExpression("++", x)
const xmm = new ast.UnaryExpression("--", x)
const return1p1 = new ast.ReturnStatement(new ast.BinaryExpression("+", 1, 1));
const return2 = new ast.ReturnStatement(2);
const returnX = new ast.ReturnStatement(x);
const onePlusTwo = new ast.BinaryExpression("+", 1, 2);
const identity = Object.assign(new ast.Function("id"), { body: returnX });
const intFun = (body) => new ast.FunctionDeclaration("f", [], "int", body);
const callIdentity = (args) => new ast.FuncCall(identity, args);
// const or = (...d) => d.reduce((x, y) => new ast.BinaryExpression("||", x, y));
// const and = (...c) => c.reduce((x, y) => new ast.BinaryExpression("&&", x, y));
const less = (x, y) => new ast.BinaryExpression("<", x, y);
const eq = (x, y) => new ast.BinaryExpression("==", x, y);
const times = (x, y) => new ast.BinaryExpression("*", x, y);
const neg = (x) => new ast.UnaryExpression("-", x);
//const array = (...elements) => new ast.ArrayExpression(elements);
const unwrapElse = (o, e) => new ast.BinaryExpression("??", o, e);
const conditional = (x, y, z) => new ast.IfStatement(x, y, z);
const some = (x) => new ast.UnaryExpression("some", x);
const breakStatement = new ast.BreakStatement();

const tests = [
  ["folds +", new ast.BinaryExpression("+", 5, 8), 13],
  ["folds -", new ast.BinaryExpression("-", 5n, 8n), -3n],
  ["folds *", new ast.BinaryExpression("*", 5, 8), 40],
  ["folds /", new ast.BinaryExpression("/", 5, 8), 0.625],
  ["folds **", new ast.BinaryExpression("**", 5, 8), 390625],
  ["folds <", new ast.BinaryExpression("<", 5, 8), true],
  ["folds <=", new ast.BinaryExpression("<=", 5, 8), true],
  ["folds ==", new ast.BinaryExpression("==", 5, 8), false],
  ["folds !=", new ast.BinaryExpression("!=", 5, 8), true],
  ["folds >=", new ast.BinaryExpression(">=", 5, 8), false],
  ["folds >", new ast.BinaryExpression(">", 5, 8), false],
  ["optimizes +0", new ast.BinaryExpression("+", x, 0), x],
  ["optimizes -0", new ast.BinaryExpression("-", x, 0), x],
  ["optimizes *1", new ast.BinaryExpression("*", x, 1), x],
  ["optimizes /1", new ast.BinaryExpression("/", x, 1), x],
  ["optimizes *0", new ast.BinaryExpression("*", x, 0), 0],
  ["optimizes 0*", new ast.BinaryExpression("*", 0, x), 0],
  ["optimizes 0/", new ast.BinaryExpression("/", 0, x), 0],
  ["optimizes 0+", new ast.BinaryExpression("+", 0, x), x],
  ["optimizes 0-", new ast.BinaryExpression("-", 0, x), neg(x)],
  ["optimizes 1*", new ast.BinaryExpression("*", 1, x), x],
  //change negation to youreNotMyDad
  ["folds negation", new ast.UnaryExpression("-", 8), -8],
  ["optimizes 1**", new ast.BinaryExpression("**", 1, x), 1],
  ["optimizes **0", new ast.BinaryExpression("**", x, 0), 1],
  //   ["removes left false from ||", or(false, less(x, 1)), less(x, 1)],
  //   ["removes right false from ||", or(less(x, 1), false), less(x, 1)],
  //   ["removes left true from &&", and(true, less(x, 1)), less(x, 1)],
  //   ["removes right true from &&", and(less(x, 1), true), less(x, 1)],
  ["removes x=x at beginning", [new ast.Assignment(x, x), xpp], [xpp]],
  ["removes x=x at end", [xpp, new ast.Assignment(x, x)], [xpp]],
  ["removes x=x in middle", [xpp, new ast.Assignment(x, x), xpp], [xpp, xpp]],
  ["optimizes if-true", new ast.IfStatement(true, xpp, []), xpp],
  ["optimizes if-false", new ast.IfStatement(false, [], xpp), xpp],
  ["optimizes while-false", [new ast.WhileLoop(false, xpp)], []],
  [
    "applies if-false after folding",
    new ast.IfStatement(eq(1, 1), xpp, 0),
    xpp,
  ],
  ["optimizes left conditional true", conditional(true, 55, 89), 55],
  ["optimizes left conditional false", conditional(false, 55, 89), 89],
  ["optimizes in functions", intFun(return1p1), intFun(return2)],
  //["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
  ["optimizes break statement", new ast.BreakStatement(), breakStatement],
  ["optimizes assignment", new ast.Assignment("x", 7 + 5), new ast.Assignment("x", 12)],
  ["optimizes self assignment", new ast.Assignment("x", "x"), []],
  ["optimizes variabe declaration", new ast.VariableDeclaration("x", 7 + 5), new ast.VariableDeclaration("x", 12)],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      new ast.Program([new ast.ReturnStatement(true)]),
      new ast.VariableDeclaration("x", true, "z"),
      new ast.Assignment(x, new ast.BinaryExpression("*", x, "z")),
      new ast.Assignment(x, new ast.UnaryExpression("-", x)),
      new ast.WhileLoop(true, [new ast.BreakStatement()]),
      conditional(x, 1, 2),
      unwrapElse(some(x), 7),
      new ast.IfStatement(x, [], []),
    ]), 
  ],

];
describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after);
    });
  }
});
