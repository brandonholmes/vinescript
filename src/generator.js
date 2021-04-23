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
        console.log(p.argument)
        output.push(`console.log(${gen(p.argument)})`)
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
    gen(program)
    return output.join("\n")
}