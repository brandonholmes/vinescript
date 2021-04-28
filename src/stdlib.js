import { Type, Variable, Function } from "./ast.js";

function makeFunction(name, type) {
  return Object.assign(new Function(name), { type });
}

export const types = {
  int: Type.INT,
  boolean: Type.BOOLEAN,
  string: Type.STRING,
  double: Type.DOUBLE,
};

export const functions = {
  print: makeFunction("print", new Function([Type.ANY], Type.VOID)),
};
