import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const grammar = ohm.grammar(fs.readFileSync("./src/vinescript.ohm"))

const astBuilder = grammar.createSemantics().addOperation("tree", {
  Program(statements) {
    return new ast.Program(statements.tree())
  },
  Function(_whenLifeGivesYouLemons, name, _left, params, _right, _open, body, _close){
    return new ast.Function(name.tree(), params.tree(), body.tree())
  },
  Variable(_lookAtThisGraph, type, name, _equal, expressions) {
    return new ast.Variable(type.tree(), name.tree(), expressions.tree())
  },
  Params(paramList) {
    return paramList.asIteration().tree()
  },
  Assignment(target, _equal, source) {
    return new ast.Assignment(target.tree(), source.tree())
  },
  Print(_print, argument) {
    return new ast.Print(argument.tree())
  },
  WhileLoop(_iAintGunnaStopLovinYou, _left, expressions, _right, body) {
    return new ast.WhileLoop(expressions.tree(), body.tree())
  },
  Conditional(_bitchIhopeTheFuckYouDo, _left, expression, _right, statements, _orWhat, elseStatements) {
    return new ast.Conditional(expression.tree(), statements.tree(), elseStatements.tree())
  },
  Exp_plusminus (left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.tree(), right.tree())
  },
  Exp_increment(left, op) {
    return new ast.UnaryExpression(op.sourceString, left.tree())
  },
  LogExp_logical(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.tree(), right.tree())
  },
  MulExp_timesdivide(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.tree(), right.tree())
  },
  InEq_equality(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.tree(), right.tree())
  },
  NegExp_negation(_youreNotMyDad, expression) {
    return new ast.NegExpression(expression.tree())
  },
  NegExp_negative(_neg, expression) {
    return new ast.NegExpression(expression.tree())
  },
  FuncCall(calle, _left, args, _right) {
    return new ast.FuncCall(calle.tree(), args.tree())
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  strlit(_left, strlit, _right) {
    return strlit.sourceString
  },
  numlit(digits, _dot, decimals, _carrot, exponents) {
    return Number(digits.sourceString + "." + decimals.sourceString + "^" + exponents.sourceString)
  },
  _terminal() {
    return this.sourceString
  }
})

//homework2 - should be able to run 'npm test' with this in place and get 100% code coverage
export default function parse(sourceCode) {
  const match = grammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).tree()
}
/*
//homework1 parse function for making sure we didn't break anything from the original code base
export default function parse(source) {
  const match = grammar.match(source)
  return match.succeeded()
}
*/
