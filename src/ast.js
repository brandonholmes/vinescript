import util from "util"
//ALL OUR CLASSES GO HERE
export class Program {
    constructor(statements) {
        this.statements = statements
    }
    [util.inspect.custom]() {
      return prettied(this)
    }
}

export class Type {
  constructor(name) {
    this.name = name
  }

  static BOOLEAN = new Type("boolean")
  static INT = new Type("int")
  static STRING = new Type("string")
  
  isEquivalentTo(target) {
    return this == target
  }
  
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  }
}

export class Conditional {
    constructor(expression, statements, elseStatements) {
        Object.assign(this, { expression, statements, elseStatements })
    }
}

export class WhileLoop {
    constructor(expression, body) {
        Object.assign(this, { expression, body })
    }
}

export class FunctionDeclaration {
    constructor(name, parameters, body) {
        Object.assign(this, { name, parameters, body })
    }
}

// Created during semantic analysis only!
export class Function {
  constructor(name) {
    this.name = name
    // Other properties set after construction
  }
}


export class Parameter {
    constructor(name) {
      Object.assign(this, { name })
    }
}


//VariableDeclaration(_lookAtThisGraph, type, name, _equal, expressions) 
export class VariableDeclaration {
    constructor(type, name, expression) {
      Object.assign(this, { type, name, expression })
    }
}

// Created during semantic analysis only!
export class Variable {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class Assignment {
    constructor(target, source) {
      Object.assign(this, { target, source })
    }
  }

export class Print {
    constructor(argument) {
      this.argument = argument
    }
}
  
export class BinaryExpression {
    constructor(op, left, right) {
      Object.assign(this, { op, left, right })
    }
}

export class UnaryExpression {
    constructor(op, left) {
        Object.assign(this, {op, left})
    }
}

export class NegExpression {
    constructor(op, left) {
        Object.assign(this, {op, left})
    }
}
/*
export class PrefixExpression {
    constructor(op, right) {
      Object.assign(this, { op, right });
    }
}

export class PostfixExpression {
    constructor(left, op) {
      Object.assign(this, { left, op });
    }
}
*/
export class IdentifierExpression {
    constructor(name) {
      this.name = name
    }
}

export class FuncCall {
  constructor(calle, args) {
    Object.assign(this, { calle, args })
  }
}
/*
  export class NumericLiteral  {
    constructor(value) {
      this.value = value;
    }
  }
  
  export class StringLiteral  {
    constructor(value) {
      this.value = value;
    }
  }
  */

 function prettied(node) {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough.
  const tags = new Map()

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    tags.set(node, tags.size + 1)
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child)
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""]
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, " ")} | ${type}${props}`
    }
  }

  tag(node)
  return [...lines()].join("\n")
}