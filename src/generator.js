import * as stdlib from "../src/stdlib.js"

export default function generate(program) {
  const output = []

  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = node => generators[node.constructor.name](node)

  const generators = {
    Program(p) {
        gen(p.statements)
    },
    VariableDeclaration(v) {
        output.push(`let ${gen(v.variable)} = ${gen(v.expression)};`)
    },
    FunctionDeclaration(f) {
        output.push(`function ${gen(f.header)}(${gen(f.header.parameters).join(", ")}) {`)
        gen(f.body)
        output.push("}")
    },
    Print(p) {
        output.push(`console.log(${gen(p.argument)});`)
    },
    BinaryExpression(b) {
        return `${gen(b.left)} ${b.op} ${gen(b.right)}`
    },
    UnaryExpression(u) {
        let op = "";
        if(["++", "--"].includes(u.op)) op = ";"
        output.push(`${gen(u.left)}${u.op}${op}`)
    },
    Conditional(c) {
        output.push(`if(${gen(c.expression)}) {`)
        gen(c.statements)
        if(c.elseStatements[0]) {
            output.push(`} else {`)
        }
        output.push(`${gen(c.elseStatements)}}`)
    },
    Assignment(a) {
        output.push(`${gen(a.target)} = ${gen(a.source)};`)
    },
    WhileLoop(w) {
        output.push(`while(${gen(w.expression)}) {`);
        gen(w.body);
        output.push(`}`);
    },
    ReturnStatement(r) {
        output.push(`return ${gen(r.expression)};`);
    },
    FuncCall(f) {
        console.log(f)
        output.push(`${gen(f.callee.header.name)}(${gen(f.args).join(", ")});`)
    },
    Function(f) {
        return targetName(f)
    },
    Parameter(p) {
        return targetName(p)
    },
    Variable(v) {
        return targetName(v)
    },
    Number(e) {
        return e
    },
    BigInt(e) {
        return e
    },
    Boolean(e) {
        return e
    },
    String(e) {
        return JSON.stringify(e)
    },
    Array(a) {
        return a.map(gen)
    }
}
    console.log(program)
    gen(program)
    return output.join("\n")
}