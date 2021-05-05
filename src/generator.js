import { IfStatement } from "./ast.js";
import * as stdlib from "../src/stdlib.js";

export default function generate(program) {
  const output = [];

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name}_${mapping.get(entity)}`;
    };
  })(new Map());

  const gen = (node, inAssign) =>
    generators[node.constructor.name](node, inAssign);

  const generators = {
    Program(p) {
      gen(p.statements);
    },
    VariableDeclaration(v) {
      output.push(`let ${gen(v.variable)} = ${gen(v.expression)};`);
    },
    FunctionDeclaration(f) {
      output.push(
        `function ${gen(f.header)}(${gen(f.header.parameters).join(", ")}) {`
      );
      gen(f.body);
      output.push("}");
    },
    Print(p) {
      output.push(`console.log(${gen(p.argument)});`);
    },
    BinaryExpression(b) {
      const op = { "==": "===", "!=": "!==" }[b.op] ?? b.op;
      return `${gen(b.left)} ${b.op} ${gen(b.right)}`;
    },
    UnaryExpression(u) {
      let op = "";
      if (["++", "--"].includes(u.op)) op = ";";
      output.push(`${gen(u.left)}${u.op}${op}`);
    },
    IfStatement(c) {
      output.push(`if(${gen(c.expression)}) {`);
      gen(c.statements);
      if (c.elseStatements[0]) {
        output.push(`} else {`);
      }
      output.push(`${gen(c.elseStatements)}}`);
    },
    Assignment(a) {
      if (a.source.constructor.name == "FuncCall") {
        output.push(`${gen(a.target)} = ${gen(a.source, true)};`);
      } else {
        output.push(`${gen(a.target)} = ${gen(a.source)};`);
      }
    },
    WhileLoop(w) {
      output.push(`while(${gen(w.expression)}) {`);
      gen(w.body);
      output.push(`}`);
    },
    ReturnStatement(r) {
      output.push(`return ${gen(r.expression)};`);
    },
    BreakStatement() {
      output.push(`break;`);
    },
    FuncCall(f, inAssign = false) {
      if (inAssign === true) {
        return `${gen(f.callee)}(${gen(f.args).join(", ")})`;
      } else {
        output.push(`${gen(f.callee)}(${gen(f.args).join(", ")});`);
      }
    },
    Function(f) {
      return targetName(f);
    },
    Parameter(p) {
      return targetName(p);
    },
    Variable(v) {
      return targetName(v);
    },
    Number(e) {
      return e;
    },
    BigInt(e) {
      return e;
    },
    Boolean(e) {
      return e;
    },
    String(e) {
      return JSON.stringify(e);
    },
    Array(a) {
      return a.map(gen);
    },
  };
  gen(program);
  return output.join("\n");
}
