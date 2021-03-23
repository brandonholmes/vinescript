import { Type, Variable, Function } from "./ast.js"

function makeConstant(name, type, value) {
  return Object.assign(new Variable(name, true), { type, value })
}

function makeFunction(name, type) {
  return Object.assign(new Function(name), { type })
}

export const types = {
  int: Type.INT,
  boolean: Type.BOOLEAN,
  string: Type.STRING,
}

export const functions = {
  print: makeFunction("print", new Function([Type.ANY], Type.VOID)),
}