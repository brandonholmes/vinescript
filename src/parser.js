import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const grammar = ohm.grammar(fs.readFileSync("./src/vinescript.ohm"))

const astBuilder = grammar.createSemantics().addOperation("tree", {
  Program(statements) {
    return new ast.Program(statements.tree())
  },
  Function(_whenLifeGivesYouLemons, type, name, _left, params, _right, _open, body, _close){
    const returnType = type.tree()
    return new ast.FunctionDeclaration(
      returnType.length === 0 ? null : returnType[0], 
      name.sourceString, 
      params.tree(), 
      body.tree())
  },
  Variable(_lookAtThisGraph, type, name, _equal, expression) {
    return new ast.VariableDeclaration(type.tree(), name.souceString, expression.tree())
  },
  Params(paramList) {
    return paramList.asIteration().tree()
  },
  Param(type, id) {
    return new ast.Parameter(type.tree(), id.sourceString)
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
  },/*
  NegExp_negative(_neg, expression) {
    return new ast.NegExpression(_neg.tree(), expression.tree())
  },*/
  PrimaryExp_paren (_left, statement, _right) {
    return new ast.PrimaryExpression(expression.tree())
  },
  PrimaryExp_return (_return, expression) {
    //const returnValue = expression.tree()
    return new ast.ReturnStatement(expression.tree())
  },
  FuncCall(calle, _left, args, _right) {
    return new ast.FuncCall(calle.tree(), args.tree())
  },
  NonemptyListOf(first, _, rest) {
    return [first.tree(), ...rest.tree()];
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  strlit(_left, strlit, _right) {
    return strlit.sourceString
  },
  numlit(_neg, _digits, _dot, _decimals, _carrot, _exponents) {
    return Number(this.sourceString)
  },
  _terminal() {
    return this.sourceString
  }
})

export default function parse(sourceCode) {
  const match = grammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).tree()
}