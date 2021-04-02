import {
  Conditional,
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

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

const check = (self) => ({
  isNumeric() {
    must(
      [Type.INT, Type.FLOAT].includes(self.type),
      `Expected a number, found ${self.type.name}`
    );
  },
  isNumericOrString() {
    must(
      [Type.INT, Type.FLOAT, Type.STRING].includes(self.type),
      `Expected a number or string, found ${self.type.name}`
    );
  },
  isBoolean() {
    must(
      self.type === Type.BOOLEAN,
      `Expected a boolean, found ${self.type.name}`
    );
  },
  isInteger() {
    must(
      self.type === Type.INT,
      `Expected an integer, found ${self.type.name}`
    );
  },
  isAType() {
    must(self instanceof Type, "Type expected");
  },
  //isAnOptional <-- I don't think we need this since we don't have optionals?
  isAnArray() {
    must(self.type.constructor === ArrayType, "Array expected");
  },
  hasSameTypeAs(other) {
    console.log(`self type: ${self}`);
    console.log(`other type: ${other}`);
    must(  
      self.type.isEquivalentTo(other.type),
      "Operands do not have the same type"
    );
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type === self[0].type),
      "Not all elements have the same type"
    );
  },
  isAssignableTo(type) {
    must(
      type == Type.ANY || self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    );
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`);
  },
  areAllDistinct() {
    must(
      new Set(self.map((f) => f.name)).size === self.length,
      "Fields must be distinct"
    );
  },
  isInTheOBject(object) {
    must(object.type.fields.map((f) => f.name).includes(self), "No such field");
  },
  //isInsideALoop <-- I don't think we need this cuz we don't have a break?
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function");
  },
  isCallable() {
    must(self.constructor === FunctionType, "Call of non-function"); // do we need this since we don't have function type?
  },
  returnsNothing() {
    must(
      self.type.returnType === Type.VOID,
      "Something should be returned here"
    );
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, "Cannot return a value here");
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
  matchParametersOf(calleeType) {
    check(self).match(calleeType.parameterTypes);
  },
  matchFieldsOf(structType) {
    check(self).match(structType.fields.map((f) => f.type));
  },
});

class Context {
  constructor(parent = null, configuration = {}) {
    // Parent (enclosing scope) for static scope analysis
    this.parent = parent;
    // All local declarations. Names map to variable declarations, types, and
    // function declarations
    this.locals = new Map();
    // Whether we are in a function, so that we know whether a return
    // statement can appear here, and if so, how we typecheck it
    this.function = configuration.forFunction ?? parent?.function ?? null;
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name);
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain!
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
    // Create new (nested) context, which is just like the current context
    // except that certain fields can be overridden
    return new Context(this, configuration);
  }
  analyze(node) {
    return this[node.constructor.name](node);
  }
  Program(p) {
    p.statements = this.analyze(p.statements);
    return p;
  }
  Conditional(e) {
    e.expression = this.analyze(e.expression);
    check(e.expression).isBoolean();
    e.statements = this.analyze(e.statements);
    e.elseStatements = this.analyze(e.elseStatements);
    check(e.statements).hasSameTypeAs(e.elseStatements);
    e.type = e.statements.type;
    return e;
  }
  WhileLoop(s) {
    s.expression = this.analyze(s.expression);
    check(s.expression).isBoolean();
    s.body = this.newChild({ inLoop: true }).analyze(s.body);
    return s;
  }
  Type(t) {
    return t;
  }
  FunctionDeclaration(d) {
    d.returnType = this.analyze(d.returnType);
    //check(d.returnType).isAType()
    // Carlos: constructor(name, parameters, returnType, body) {
    // VineScript: constructor(name, parameters, body) {
    // d.returnType = d.returnType ? this.analyze(d.returnType) : Type.VOID
    // Declarations generate brand new function objects
    const f = (d.function = new Function(d.name));
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, forFunction: f });
    d.parameters = childContext.analyze(d.parameters);
    f.type = new FunctionType(
      d.parameters.map((p) => p.type),
      d.returnType
    );
    // Add before analyzing the body to allow recursion
    this.add(f.name, f);
    d.body = childContext.analyze(d.body);
    return d;
  }
  Parameter(p) {
    p.type = this.analyze(p.type);
    check(p.type).isAType()
    this.add(p.name, p);
    return p;
  }
  VariableDeclaration(d) {
    // Declarations generate brand new variable objects
    d.expression = this.analyze(d.expression);
    d.variable.type = d.expression.type;
    this.add(d.variable.name, d.variable);
    return d;
  }
  /*Variable(d) {
    // Declarations generate brand new variable objects
    d.expression = this.analyze(d.expression);
    d.variable = new Variable(d.name);
    d.variable.type = d.expression.type;
    this.add(d.variable.name, d.variable);
    return d;
  }*/
  Assignment(s) {
    s.source = this.analyze(s.source);
    s.target = this.analyze(s.target);
    check(s.source).isAssignableTo(s.target.type);
    check(s.target).isNotReadOnly();
    return s;
  }
  BinaryExpression(e) {
    e.left = this.analyze(e.left);
    e.right = this.analyze(e.right);
    if (["&", "|", "^", "<<", ">>"].includes(e.op)) {
      check(e.left).isInteger();
      check(e.right).isInteger();
      e.type = Type.INT;
    } else if (["+"].includes(e.op)) {
      check(e.left).isNumericOrString();
      check(e.left).hasSameTypeAs(e.right);
      e.type = e.left.type;
    } else if (["-", "*", "/", "%", "**"].includes(e.op)) {
      check(e.left).isNumeric();
      check(e.left).hasSameTypeAs(e.right);
      e.type = e.left.type;
    } else if (["<", "<=", ">", ">="].includes(e.op)) {
      check(e.left).isNumericOrString();
      check(e.left).hasSameTypeAs(e.right);
      e.type = Type.BOOLEAN;
    } else if (["==", "!="].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right);
      e.type = Type.BOOLEAN;
    }
    return e;
  }
  UnaryExpression(e) {
    e.left = this.analyze(e.left);
    if (e.op === "#") {
      check(e.left).isAnArray();
      e.type = Type.INT;
    } else if (e.op === "-") {
      check(e.left).isNumeric();
      e.type = e.left.type;
    } else if (e.op === "!") {
      check(e.left).isBoolean();
      e.type = Type.BOOLEAN;
    } else {
      // Operator is "some"
      //e.type = new OptionalType(e.left.type)
    }
    return e;
  }
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes);
    t.returnType = this.analyze(t.returnType);
    return t;
  }
  Print(e) {
    e.argument = this.analyze(e.argument);
    return e;
  }
  FuncCall(c) {
    c.callee = this.analyze(c.callee);
    check(c.callee).isCallable();
    c.args = this.analyze(c.args);
    // if (c.callee.constructor === StructDeclaration) {
    //   check(c.args).matchFieldsOf(c.callee)
    //   c.type = c.callee // weird but seems ok for now
    // } else {
    //   check(c.args).matchParametersOf(c.callee.type)
    //   c.type = c.callee.type.returnType
    // }
    return c;
  }
  Array(a) {
    return a.map((item) => this.analyze(item));
  }
  IdentifierExpression(e) {
    // Id expressions get "replaced" with the entities they refer to.
    return this.lookup(e.name);
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
  Number.prototype.type = Type.INT;
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
