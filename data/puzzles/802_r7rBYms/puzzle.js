// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=802_r7rBYms
// Source: https://cracking-the-cryptic.web.app/sudoku/9qb7qPFgNm

// Normal sudoku rules apply (9x9, standard 3x3 boxes -- matches the
// payload's `regions` array, so no explicit Regions constraint is needed).
//
// Two diamond-shaped chains of shaded cells (grey, 15 cells; green, 8
// cells) each obey a Fibonacci rule read clockwise: two single-digit seed
// cells start the chain, then every following cell "adds the last two
// numbers". Encoded as an NFA carrying the previous two chain values.
//
// GREEN (8 cells, a closed ring): the digital root of the sum -- if a+b
// exceeds 9, subtract 9 -- is the only tested arithmetic under which the
// ring's own row/column/box coincidences, plus the puzzle's givens, admit
// any assignment at all (checked directly against the shape, not against a
// solved grid: a literal, non-wrapping sum is impossible for any chain past
// ~6 cells on a 1-9 grid, and a mod-10 "last digit" wrap, which can produce
// an unreachable 0, is also excluded the same way). The video description
// says the green ring's starting point (which two adjacent cells are the
// free seed pair) is not shown, so the rule is a disjunction over all 8
// rotations of the ring's fixed clockwise order.
//
// GREY (15 cells, open -- see below): omitted. A drawn arrow (payload
// arrows[0]) points into R3C3, the chain's first listed cell, fixing a
// start unlike green's. But with that start (either direction), none of
// the three tested arithmetics is satisfiable together with the shape's
// own row/column/box coincidences and the puzzle's givens: a literal sum
// is impossible for the same reason as green's; a mod-10 wrap admits zero
// of the 81 seed pairs even before the givens are added (an exhaustive,
// solve-free check against the shape alone); and the digital root -- the
// one reading satisfiable for the shape alone (18 of 81 seed pairs) --
// still admits zero once the givens are added, in either direction. No
// omitted-clause-free encoding could be found from local evidence.

// NFA state {a, b}: the previous two chain values (undefined until seeded).
// First two symbols seed a and b freely; every later symbol must equal the
// digital root of (a + b) -- i.e. a + b, minus 9 once if that exceeds 9.
const fibDigitalRootSpec = {
  startState: { a: undefined, b: undefined },
  transition: ({ a, b }, value) => {
    if (a === undefined) return { a: value, b: undefined };
    if (b === undefined) return { a, b: value };
    const expected = ((a + b - 1) % 9) + 1;
    if (expected !== value) return undefined;
    return { a: b, b: value };
  },
  accept: () => true,
};
const fibDigitalRoot = NFA.encodeSpec(fibDigitalRootSpec, /* numValues= */ 9);

const given = [
  ['R2C1', 1], ['R2C5', 2], ['R4C4', 3], ['R5C6', 5],
  ['R7C8', 8], ['R9C1', 4], ['R9C7', 1], ['R9C8', 3],
];

// Green ring: 8 cells, clockwise order (arbitrary reference start -- the
// true seed pair is not shown). Transcribed from the payload's green
// (#A3E048) underlay centres.
const green = [
  'R4C3', 'R5C4', 'R6C5', 'R7C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2',
];

const givens = given.map(([cell, value]) => new Given(cell, value));

// Green: disjunction over the 8 possible seed-pair positions. For a chosen
// rotation r, the scan starts at green[r] and reads the ring clockwise for
// all 8 cells; green[r] and green[r+1] act as the free seeds and the
// remaining 6 cells are checked in ring order, without wrapping past the
// seed pair again (the NFA only constrains cells after the first two).
const greenOptions = [];
for (let r = 0; r < green.length; r++) {
  const rotation = [];
  for (let k = 0; k < green.length; k++) {
    rotation.push(green[(r + k) % green.length]);
  }
  greenOptions.push(new NFA(fibDigitalRoot, 'FibDigitalRoot', ...rotation));
}

return [
  new Shape('9x9'),
  ...givens,
  new Or(greenOptions),
];
