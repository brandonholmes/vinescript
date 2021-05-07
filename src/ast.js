import util from "util";

export class Program {
  constructor(statements) {
    this.statements = statements;
  }
  [util.inspect.custom]() {
    return prettied(this);
  }
}

export class Type {
  constructor(name) {
    this.name = name;
  }

  static DOUBLE = new Type("double");
  static BOOLEAN = new Type("boolean");
  static INT = new Type("int");
  static STRING = new Type("string");

  isEquivalentTo(target) {
    return this == target;
  }
}

export class FunctionType extends Type {
  constructor(parameterTypes, returnType) {
    super(
      `(${parameterTypes.map((t) => t.name).join(",")})->${returnType.name}`
    );
    Object.assign(this, { parameterTypes, returnType });
  }
}

export class IfStatement {
  constructor(expression, statements, elseStatements) {
    Object.assign(this, { expression, statements, elseStatements });
  }
}

export class WhileLoop {
  constructor(expression, body) {
    Object.assign(this, { expression, body });
  }
}

export class FunctionDeclaration {
  constructor(header, body) {
    Object.assign(this, { header, body });
  }
}

export class Function {
  constructor(name, parameters, returnType) {
    Object.assign(this, { name, parameters, returnType });
  }
}

export class Parameter {
  constructor(type, name) {
    Object.assign(this, { type, name });
  }
}

export class VariableDeclaration {
  constructor(variable, expression) {
    Object.assign(this, { variable, expression });
  }
}

export class Variable {
  constructor(name, readOnly) {
    Object.assign(this, { name, readOnly });
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

export class Print {
  constructor(argument) {
    this.argument = argument;
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}

export class UnaryExpression {
  constructor(op, left) {
    Object.assign(this, { op, left });
  }
}

export class ReturnStatement {
  constructor(expression) {
    this.expression = expression;
  }
}

export class BreakStatement {
  //intentionally empty
}

export class NegExpression {
  constructor(op, left) {
    Object.assign(this, { op, left });
  }
}

export class ArrayExpression {
  constructor(elements) {
    this.elements = elements
  }
}

export class IdentifierExpression {
  constructor(name) {
    this.name = name;
  }
}

export class FuncCall {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}

function prettied(node) {
  // Return a compact and pretty string of the graph
  const tags = new Map();

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return;
    tags.set(node, tags.size + 1);
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child);
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      return util.inspect(e);
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""];
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`));
      yield `${String(id).padStart(4, " ")} | ${type}${props}`;
    }
  }

  tag(node);
  return [...lines()].join("\n");
}
