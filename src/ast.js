//ALL OUR CLASSES GO HERE
export class Program {
    constructor(statements) {
        this.statements = statements
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

export class Function {
    constructor(name, parameters, body) {
        Object.assign(this, { name, parameters, body })
    }
}
/*
export class Parameter {
    constructor(name) {
      Object.assign(this, { name })
    }
}
*/
export class Variable {
    constructor(type, name, expression) {
      Object.assign(this, { type, name, expression })
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