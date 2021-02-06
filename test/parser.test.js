import assert from "assert"
import parse from "../src/parser.js"

const goodPrograms = [
  'lookAtThisGraph x = 5',
  'whenLifeGivesYouLemons myFunction(params) lookAtThisGraph x = 5',
  'iAintGunnaStopLovinYou(x < 5) x++',
  'bitchIhopeTheFuckYouDo(x > 5) x = 7 orWhat x = -7'
]

const badPrograms = [
  'whenLifeGivesYouLemons myFunction(params) {lookAtThisGraph x = 5}',
  'lookAtThisGraph x',
  'bitchIhopeTheFuckYouDo(youreNotMyDad) x = 7 orWhat x = -7',
  'x +',
  'print )'
]

describe("The parser", () => {
    for(const program of goodPrograms) {
        it(`recognizes good programs`, () => {
            assert.ok(parse(program))
        })
    }
    for(const program of badPrograms) {
        it(`rejects bad programs`, () => {
            assert.ok(!parse(program))
        })
    }
})