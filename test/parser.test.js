import assert from "assert";
import parse from "../src/parser.js";

const goodPrograms = [
  `lookAtThisGraph x = 5`,
  `whenLifeGivesYouLemons int myFunction(int y) {
        lookAtThisGraph x = 5 
        print x
      }
    myFunction(x)`,
  `whenLifeGivesYouLemons int myOtherFunction(int x, int y) {
    lookAtThisGraph z = x - y
    lookAtThisGraph a = "test"
    print x
    print a
    return a
  }`,
  `iAintGunnaStopLovinYou(x < 5) x++`,
  `bitchIhopeTheFuckYouDo(x andIoop y) print 14 / 2 orWhat print 14 * 2`,
  `bitchIhopeTheFuckYouDo(x > 5) x = 7 orWhat x = -7`,
];

const badPrograms = [
  `whenLifeGivesYouLemons int myFunction(params) {lookAtThisGraph x = 5}`,
  `whenLifeGivesYouLemons myFunction(y) {
    lookAtThisGraph x = 5 
    print x
  }
  myFunction(x)`,
  `whenLifeGivesYouLemons myOtherFunction(x, y) {
    lookAtThisGraph z = x - y
    lookAtThisGraph a = "test"
    print x
    print a
  }`,
  `lookAtThisGraph x`,
  `bitchIhopeTheFuckYouDo(youreNotMyDad) x = 7 orWhat x = -7`,
  `x +`,
  `print )`,
];

describe("The parser", () => {
  for (const program of goodPrograms) {
    it(`recognizes good programs`, () => {
      assert.ok(parse(program));
    });
  }
  for (const program of badPrograms) {
    it(`rejects bad programs`, () => {
      assert.throws(() => parse(program));
    });
  }
});
