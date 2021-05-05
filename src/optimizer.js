// Optimizer
//
// This module exports a single function to perform machine-independent
// optimizations on the analyzed semantic graph.
//
// The only optimizations supported here are:
//
//   - assignments to self (x = x) turn into no-ops
//   - constant folding
//   - some strength reductions (+0, -0, *0, *1, etc.)
//   - turn references to built-ins true and false to be literals
//   - remove all disjuncts in || list after literal true
//   - remove all conjuncts in && list after literal false
//   - while-false becomes a no-opa
//   - repeat-0 is a no-op
//   - for-loop over empty array is a no-op
//   - for-loop with low > high is a no-op
//   - if-true and if-false reduce to only the taken arm

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
    v.initializer = optimize(v.initializer);
    return v;
  },
  FunctionDeclaration(f) {
    console.log(f);
    console.log(f.header);
    f.body = optimize(f.body);
    return f;
  },
  Variable(v) {
    return v;
  },
  Function(f) {
    // f.body = optimize(f.body)
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
    s.test = optimize(s.test);
    s.consequent = optimize(s.consequent);
    s.alternate = optimize(s.alternate);
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate;
    }
    return s;
  },
  whileLoop(w) {
    w.test = optimize(w.test);
    if (w.test === false) {
      // while false is a no-op
      return [];
    }
    w.body = optimize(w.body);
    return w;
  },

  Conditional(e) {
    e.test = optimize(e.test);
    e.consequent = optimize(e.consequent);
    e.alternate = optimize(e.alternate);
    if (e.test.constructor === Boolean) {
      return e.test ? e.consequent : e.alternate;
    }
    return e;
  },

  //CODE FROM CARLOS, we also might need to look at our binary expression in our generator?
  BinaryExpression(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op === "??") {
      // Coalesce Empty Optional Unwraps
      if (e.left.constructor === ast.EmptyOptional) {
        return e.right;
      }
    } else if (e.op === "&&") {
      // Optimize boolean constants in && and ||
      if (e.left === true) return e.right;
      else if (e.right === true) return e.left;
    } else if (e.op === "||") {
      if (e.left === false) return e.right;
      else if (e.right === false) return e.left;
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
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
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
      else if (e.op === "*" && e.right === 0) return 0;
      else if (e.op === "**" && e.right === 0) return 1;
    }
    return e;
  },
  UnaryExpression(e) {
    e.operand = optimize(e.operand);
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand;
      }
    }
    return e;
  },
  //   FuncCall(c) {
  //     c.callee = optimize(c.callee);
  //     c.args = optimize(c.args);
  //     return c;
  //   },
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
    // Flatmap since each element can be an array
    return a.flatMap(optimize);
  },
};
