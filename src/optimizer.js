import * as ast from "./ast.js";

export default function optimize(node) {
  return optimizers[node.constructor.name](node);
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements);
    return p;
  },
  VariableDeclaration(v) {
    v.expression = optimize(v.expression);
    return v;
  },
  FunctionDeclaration(f) {
    f.body = optimize(f.body);
    f.header = optimize(f.header);
    return f;
  },
  Variable(v) {
    return v;
  },
  Function(f) {
    f.parameters = optimize(f.parameters);
    return f;
  },
  Parameter(p) {
    return p;
  },
  Assignment(s) {
    s.source = optimize(s.source);
    s.target = optimize(s.target);
    if (s.source === s.target) {
      return [];
    }
    return s;
  },
  BreakStatement(s) {
    return s;
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  IfStatement(s) {
    s.expression = optimize(s.expression);
    s.statements = optimize(s.statements);
    s.elseStatements = optimize(s.elseStatements);
    if (s.expression.constructor === Boolean) {
      return s.expression ? s.statements : s.elseStatements;
    }
    return s;
  },
  WhileLoop(w) {
    w.expression = optimize(w.expression);
    if (w.expression === false) {
      return [];
    }
    w.body = optimize(w.body);
    return w;
  },

  BinaryExpression(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op === "andIoop") {
      if (e.left === true) return e.right;
      else if (e.right === true) return e.left;
    } else if (e.op === "||") {
      if (e.left === false) return e.right;
      else if (e.right === false) return e.left;
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right;
        else if (e.op === "-") return e.left - e.right;
        else if (e.op === "*") return e.left * e.right;
        else if (e.op === "/") return e.left / e.right;
        else if (e.op === "**") return e.left ** e.right;
        else if (e.op === "<") return e.left < e.right;
        else if (e.op === "<=") return e.left <= e.right;
        else if (e.op === "==") return e.left === e.right;
        else if (e.op === "!=") return e.left !== e.right;
        else if (e.op === ">=") return e.left >= e.right;
        else if (e.op === ">") return e.left > e.right;
      } else if (e.left === 0 && e.op === "+") return e.right;
      else if (e.left === 1 && e.op === "*") return e.right;
      else if (e.left === 0 && e.op === "-")
        return new ast.UnaryExpression("-", e.right);
      else if (e.left === 1 && e.op === "**") return 1;
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
    } else if (e.right.constructor === Number) {
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
      else if (e.op === "*" && e.right === 0) return 0;
      else if (e.op === "**" && e.right === 0) return 1;
    }
    return e;
  },
  UnaryExpression(e) {
    e.left = optimize(e.left);
    if (e.left.constructor === Number) {
      if (e.op === "-") {
        return -e.left;
      }
    }
    return e;
  },
  FuncCall(c) {
    c.callee = optimize(c.callee);
    c.args = optimize(c.args);
    return c;
  },
  NegExpression(n) {
    n.left = optimize(n.left);
    if(n.left.type.name === "boolean") {
      if(n.op === "youreNotMyDad") {
        return !n.left;
      }
    }
    return n.left;
  },
  ArrayExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },
  BigInt(e) {
    return e;
  },
  Number(e) {
    return e;
  },
  Boolean(e) {
    return e;
  },
  String(e) {
    return e;
  },
  Array(a) {
    return a.flatMap(optimize);
  },
};
