import {
  IfStatement,
  WhileLoop,
  Function,
  Variable,
  Assignment,
  FunctionType,
  Print,
  BinaryExpression,
  Type,
} from "./ast.js";
import * as stdlib from "./stdlib.js";
import util from "util";
import { Console } from "console";
import { lookup } from "dns";

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

const check = (self) => ({
  isNumeric() {
    must(
      [Type.INT, Type.DOUBLE].includes(self.type),
      `Expected a number, found ${self.type.name}`
    );
  },
  isNumericOrString() {
    must(
      [Type.INT, Type.DOUBLE, Type.STRING].includes(self.type),
      `Expected a number or string, found ${self.type.name}`
    );
  },
  isBoolean() {
    must(
      self.type === Type.BOOLEAN,
      `Expected a boolean, found ${self.type.name}`
    );
  },
  isAType() {
    must(self instanceof Type, "Type expected");
  },
  hasSameTypeAs(other) {
    must(
      self.type.isEquivalentTo(other.type),
      "Operands do not have the same type"
    );
  },
  isAssignableTo(type) {
    must(
      self.type === type || self.type.returnType === type,
      `Cannot assign a ${self.type.name} to a ${type.name}`
    );
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`);
  },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop");
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function");
  },
  isCallable() {
    must(self.constructor.name === "Function", "Call of non-function");
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType);
  },
  match(targetTypes) {
    must(
      targetTypes.length === self.length,
      `${targetTypes.lenght} argument(s) required but ${self.length} passed`
    );
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type));
  },
  matchParametersOf(callee) {
    check(self).match(callee.parameters.map((p) => p.type));
  },
});

class Context {
  constructor(parent = null, configuration = {}) {
    this.parent = parent;
    this.locals = new Map();
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false;
    this.function = configuration.forFunction ?? parent?.function ?? null;
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name);
  }
  add(name, entity) {
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`);
    }
    this.locals.set(name, entity);
  }
  lookup(name) {
    const entity = this.locals.get(name);
    if (entity) {
      return entity;
    } else if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new Error(`Identifier ${name} not declared`);
  }
  newChild(configuration = {}) {
    return new Context(this, configuration);
  }
  analyze(node) {
    return this[node.constructor.name](node);
  }
  Program(p) {
    p.statements = this.analyze(p.statements);
    return p;
  }
  Array(a) {
    return a.map((item) => this.analyze(item));
  }
  VariableDeclaration(v) {
    v.expression = this.analyze(v.expression);
    v.variable.type = v.expression.type;
    this.add(v.variable.name, v.variable);
    return v;
  }
  FunctionDeclaration(f) {
    check(f.header.returnType).isAType();
    const childContext = this.newChild({
      inLoop: false,
      forFunction: f.header,
    });
    f.header.parameters = childContext.analyze(f.header.parameters);
    f.header.type = new FunctionType(
      f.header.parameters.map((p) => p.type),
      f.header.returnType
    );
    this.add(f.header.name, f.header);
    f.body = childContext.analyze(f.body);
    return f;
  }
  Parameter(p) {
    p.type = this.analyze(p.type);
    check(p.type).isAType();
    this.add(p.name, p);
    return p;
  }
  NegExpression(n) {
    n.left = this.analyze(n.left);
    check(n.left).isBoolean();
    return n;
  }
  Assignment(a) {
    a.source = this.analyze(a.source);
    a.target = this.analyze(a.target);
    check(a.source).isAssignableTo(a.target.type);
    check(a.target).isNotReadOnly();
    return a;
  }
  IdentifierExpression(e) {
    e = this.lookup(e.name);
    return e;
  }
  Print(p) {
    p.argument = this.analyze(p.argument);
    return p;
  }
  BinaryExpression(b) {
    b.left = this.analyze(b.left);
    b.right = this.analyze(b.right);
    if (["+", "-", "*", "/", "%", "**"].includes(b.op)) {
      check(b.left).isNumeric();
      check(b.left).hasSameTypeAs(b.right);
      b.type = b.left.type;
    } else if (["<=", ">=", "<", ">"].includes(b.op)) {
      check(b.left).isNumericOrString();
      check(b.left).hasSameTypeAs(b.right);
      b.type = Type.BOOLEAN;
    } else if (["==", "!="].includes(b.op)) {
      check(b.left).hasSameTypeAs(b.right);
      b.type = Type.BOOLEAN;
    } else if (["andIoop", "||"].includes(b.op)) {
      check(b.right).isBoolean();
      check(b.left).isBoolean();
    }

    return b;
  }
  UnaryExpression(b) {
    b.left = this.analyze(b.left);
    check(b.left).isNumeric();
    return b;
  }
  IfStatement(c) {
    c.expression = this.analyze(c.expression);
    check(c.expression).isBoolean;
    c.statements = this.newChild().analyze(c.statements);
    c.elseStatements = this.newChild().analyze(c.elseStatements);
    return c;
  }
  ReturnStatement(r) {
    check(this).isInsideAFunction();
    r.expression = this.analyze(r.expression);
    check(r.expression).isReturnableFrom(this.function);
    return r;
  }
  BreakStatement(b) {
    check(this).isInsideALoop();
    return b;
  }
  WhileLoop(w) {
    w.expression = this.analyze(w.expression);
    check(w.expression).isBoolean();
    w.body = this.newChild({ inLoop: true }).analyze(w.body);
    return w;
  }
  FuncCall(c) {
    c.callee = this.analyze(c.callee);
    check(c.callee).isCallable();
    c.args = this.analyze(c.args);
    check(c.args).matchParametersOf(c.callee);
    c.type = c.callee.returnType;
    return c;
  }
  Type(t) {
    return t;
  }
  Number(e) {
    return e;
  }
  BigInt(e) {
    return e;
  }
  Boolean(e) {
    return e;
  }
  String(e) {
    return e;
  }
}

export default function analyze(node) {
  Number.prototype.type = Type.DOUBLE;
  BigInt.prototype.type = Type.INT;
  Boolean.prototype.type = Type.BOOLEAN;
  String.prototype.type = Type.STRING;

  const initialContext = new Context();
  const library = { ...stdlib.types, ...stdlib.functions };
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type);
  }
  return initialContext.analyze(node);
}
