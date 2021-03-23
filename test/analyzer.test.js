import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as ast from "../src/ast.js"

const semanticChecks = [
    ["variable declaration", 'lookAtThisGraph int z = 7']
    //,["variable declaration", 'lookAtThisGraph int z = 7']
]

//const semanticErrors = []

/*
    Bunch of stuff goes here
*/

describe("The analyzer", () => {
    for (const [scenario, source] of semanticChecks) {
      it(`recognizes ${scenario}`, () => {
        assert.ok(analyze(parse(source)))
      })
    }
    /*
    for (const [scenario, source, errorMessagePattern] of semanticErrors) {
      it(`throws on ${scenario}`, () => {
        assert.throws(() => analyze(parse(source)), errorMessagePattern)
      })
    }*/
    /*//////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////I don't think this is applicable to our language
    for (const [scenario, source, graph] of graphChecks) {
      it(`properly rewrites the AST for ${scenario}`, () => {
        assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
      })
    }
    //////////////////////////////////////////////////////////////////////////////////////////////*/
  })