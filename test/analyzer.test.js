import assert from 'assert';
import parse from '../src/parser.js';
import analyze from '../src/analyzer.js';
import * as ast from '../src/ast.js';

const semanticChecks = [
  ['int declaration', `lookAtThisGraph z = 4`],
  ['boolean declaration', `lookAtThisGraph z = thatIsNotCorrect`],
  ['string declaration', `lookAtThisGraph z = "HelloWorld"`],
  ['function declaration', `whenLifeGivesYouLemons int myOtherFunction(int x, int y) { x = 7 }`],
  [
    '4.function declaration',
    `whenLifeGivesYouLemons int lemonade(int d, int bb) { d = 34 bb = 35 print d + bb } `,
  ],
  [
    'printing a int is valid',
    `lookAtThisGraph myInt = 7
     print myInt`,
  ],
  ['return int', `whenLifeGivesYouLemons int lemonade() { lookAtThisGraph x = 7 thisBitchEmpty x}`],
  [
    'return string',
    `whenLifeGivesYouLemons string lemonade() { lookAtThisGraph x = "HelloWorld" thisBitchEmpty x}`,
  ],
  [
    'return double',
    `whenLifeGivesYouLemons double lemonade() { lookAtThisGraph x = 7.5 thisBitchEmpty x}`,
  ],
  ['return int', `whenLifeGivesYouLemons int lemonade() { thisBitchEmpty 7}`],
  ['return string', `whenLifeGivesYouLemons string lemonade() { thisBitchEmpty "HelloWorld"}`],
  [
    'return double expression',
    `whenLifeGivesYouLemons double lemonade() { thisBitchEmpty 6.5 + 6.5}`,
  ],
  ['return int expression', `whenLifeGivesYouLemons int lemonade() { thisBitchEmpty 6 + 6}`],
  ['increment operator', `lookAtThisGraph x = 7 x++`], 
  ['decrement operator', `lookAtThisGraph x = 7 x--`],
  // -also check that it recognizes inequalities (or's and ands)
  ['conditional', `lookAtThisGraph x = 4 bitchIhopeTheFuckYouDo (x > 7) print 1 orWhat print 3`],
  [
    'good types for >',
    ` lookAtThisGraph x = 7 bitchIhopeTheFuckYouDo(x > 1) print 1 orWhat print 3`,
  ],
  ['While Loop', `lookAtThisGraph x = 7 iAintGunnaStopLovinYou ( x > 7 ) { print x }`],
  [
    'While Loop with Boolean variable condition',
    `lookAtThisGraph happy = iSureHopeItDoes
     iAintGunnaStopLovinYou ( happy ) { print "Dance" }`,
  ],
  ['break', `lookAtThisGraph x = 8 iAintGunnaStopLovinYou (x > 7) { yeet }`],
  [
    'break in while condition',
    `lookAtThisGraph x = 8
    iAintGunnaStopLovinYou (x > 7) {
      bitchIhopeTheFuckYouDo(x < 2)
      yeet
    }`,
  ],
  ['negation', `lookAtThisGraph x = youreNotMyDad thatIsNotCorrect`],
  ['conditional without else', `bitchIhopeTheFuckYouDo(7 > 6) print 8`],
  ['conditional with else', `bitchIhopeTheFuckYouDo(8 > 5) print 9 print 7 orWhat lookAtThisGraph x = 7 print x`],
  [
    'function call',
    `whenLifeGivesYouLemons int myFunc(int x) {
      thisBitchEmpty x + 5
    }
    lookAtThisGraph y = 7
    myFunc(y)
    `,
  ],
  ['function with multiple parameters', `whenLifeGivesYouLemons int myFunc(int x, int y) {print x + y}`]
];

const semanticErrors = [
  //doesnt allow comparing a number and a string, and a boolean and a number
  [
    "compare int and string",
    `lookAtThisGraph x = 7
    lookAtThisGraph y = "myString"
    bitchIhopeTheFuckYouDo(x andIoop y) print 8`,
    /Expected a boolean, found string/
  ],
  [
    "compare int or string",
    `lookAtThisGraph x = 7
    lookAtThisGraph y = "myString"
    bitchIhopeTheFuckYouDo(x || y) print 8`,
    /Expected a boolean, found string/
  ],
  [
    "compare int and boolean",
    `lookAtThisGraph x = 7
    lookAtThisGraph y = thatIsNotCorrect
    bitchIhopeTheFuckYouDo(x > y) print 8`,
    /Operands do not have the same type/
  ],
  [
    "compare int and string",
    `lookAtThisGraph x = 7
    lookAtThisGraph y = "myString"
    bitchIhopeTheFuckYouDo(x > y) print 8`,
    /Operands do not have the same type/
  ],
  [
    'rejects attempt to shadow',
    `whenLifeGivesYouLemons int thisFunc(int x) {
      lookAtThisGraph x = 2
      thisBitchEmpty x
    }`,
    /Identifier x already declared/,
  ],
  [
    'return type mismatch',
    `whenLifeGivesYouLemons int f() {thisBitchEmpty "HelloWorld"}`,
    /Cannot assign a string to a int/,
  ],
  [
    'assigns int to string',
    `lookAtThisGraph myBoolean = "HelloWorld"
  myBoolean = 7`,
    /Cannot assign a int to a string/,
  ],
  ['returns outside a function', `thisBitchEmpty 7`, /Return can only appear in a function/],
  [
    'break outside a loop',
    `lookAtThisGraph x = 7
    yeet`,
    /Break can only appear in a loop/,
  ],
  [
    'invalid conditional expression',
    `bitchIhopeTheFuckYouDo("hello" > 7)
    print 3`,
    /Operands do not have the same type/,
  ],
  ['variable not declared', `x = 7`, /Identifier x not declared/],
  [
    'assign string to int',
    `lookAtThisGraph x = 7
    x = "HelloWorld"`,
    /Cannot assign a string to a int/,
  ],
  [
    'assign int to string',
    `lookAtThisGraph x = "helloworld"
    x = 9`,
    /Cannot assign a int to a string/,
  ],
  [
    'parameter type mismatch',
    `whenLifeGivesYouLemons int myFunc(int y) {
      thisBitchEmpty 7
    }
    lookAtThisGraph x = "HelloWorld"
    myFunc(x)`,
    /Cannot assign a string to a int/,
  ],
  ['return outside a function', `thisBitchEmpty x`, /Return can only appear in a function/],
  ['decrement on a boolean', `lookAtThisGraph x = thatIsNotCorrect x++`, /Expected a number, found boolean/],
  ['increment on a boolean', `lookAtThisGraph x = thatIsNotCorrect x--`, /Expected a number, found boolean/],
  ['bad types for ==', 'print(thatIsNotCorrect==1)', /Operands do not have the same type/],
  ['negation of integer', `lookAtThisGraph x = youreNotMyDad 7`, /Expected a boolean, found int/],
  ['negation of double', `lookAtThisGraph x = youreNotMyDad 7.5`, /Expected a boolean, found double/],
  ['negation of string', `lookAtThisGraph x = youreNotMyDad "myString"`, /Expected a boolean, found string/],
];

describe('The analyzer', () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }

  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
});
