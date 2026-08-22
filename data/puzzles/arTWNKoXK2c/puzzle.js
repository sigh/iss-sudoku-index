// Title: Light Bulb Moment
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=arTWNKoXK2c
// Source: https://app.crackingthecryptic.com/sudoku/JBNhmrn8dq
//
// Rules encoded here (standard rows/columns/boxes, no givens):
//
//   Riddle: 43 bulbs start off; person n (1..43) pulls every n-th cord. Bulb n
//   is pulled once per divisor of n, so it ends lit exactly when n has an odd
//   number of divisors, i.e. when n is a perfect square. Among 1..43 that is
//   {1, 4, 9, 16, 25, 36}. This is arithmetic the rules text sets out; nothing
//   outside the rules is used to obtain it.
//
//   "Lit hallway cells are brighter (higher) than their hallway neighbors.
//    Hallway cells get darker (lower) as you get further away from a lit cell.
//    Between every two lit cells in the hallway there will be a darkest
//    (lowest) cell. It can be anywhere between the two lit cells."
//   Along the hallway walk: from each lit cell the digits strictly fall to one
//   darkest cell and then strictly rise to the next lit cell; the position of
//   that darkest cell is free. After the last lit cell (bulb 36) the remaining
//   cells only get further from a lit cell, so they strictly fall to the end
//   of the hallway.
//
//   "Arrows show the way through the hall. Digits along an arrow sum to the
//    circled digit."
//
// Nothing is omitted. The 43-cell region drawn as a totalless cage marks the
// hallway; it is not a sum or all-different clue (43 cells cannot be
// all-different over 9 values), so it contributes scope only.

// Hallway walk, position 1..43. Cells in the drawn 43-cell hallway region, in
// the order the region lists them; position 1 is R1C3, which the rules name as
// bulb 1, and each of the five drawn arrows points from a lower to a higher
// position in this order.
const hallway = [
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C9',
  'R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1',
  'R4C1',
  'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C9',
  'R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1',
  'R8C1',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5',
];

// Perfect squares in 1..43 -- the lit bulbs.
const litPositions = [1, 4, 9, 16, 25, 36];

// One machine per stretch of hallway running from one lit cell to the next,
// both included. States: `fall` means the next digit must be lower (it is the
// step away from the leading lit cell, which the first rule requires to drop);
// `desc` means still descending but the darkest cell may be reached at any
// point; `asc` means the rise to the next lit cell has begun and cannot be
// undone. Equal adjacent digits are rejected everywhere, and only `asc` is
// accepting, so the stretch ends on a rise into the trailing lit cell.
const valleySpec = NFA.encodeSpec({
  startState: { phase: 'fall', prev: null },
  transition: ({ phase, prev }, value) => {
    if (prev === null) return { phase: 'fall', prev: value };
    if (phase === 'fall') {
      return value < prev ? { phase: 'desc', prev: value } : undefined;
    }
    if (phase === 'desc') {
      if (value < prev) return { phase: 'desc', prev: value };
      if (value > prev) return { phase: 'asc', prev: value };
      return undefined;
    }
    return value > prev ? { phase: 'asc', prev: value } : undefined;
  },
  accept: ({ phase }) => phase === 'asc',
}, 9);

const valleys = litPositions.slice(0, -1).map((from, i) => {
  const to = litPositions[i + 1];
  return new NFA(valleySpec, `valley${from}_${to}`, ...hallway.slice(from - 1, to));
});

// Tail after the last lit bulb (position 36): strictly falling to position 43.
// Thermo is strictly increasing from its first cell, so the tail is listed
// end-first.
const tail = new Thermo(...hallway.slice(litPositions[litPositions.length - 1] - 1).reverse());

// Arrows: circled cell (drawn as the purple circle at the arrow's tail) equals
// the sum of the cells the shaft passes through.
const arrows = [
  new Arrow('R1C7', 'R1C8', 'R1C9'),
  new Arrow('R3C8', 'R3C7', 'R3C6'),
  new Arrow('R3C2', 'R3C1', 'R4C1', 'R5C1'),
  new Arrow('R5C9', 'R6C9', 'R7C9'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
];

return [
  new Shape('9x9'),
  ...valleys,
  tail,
  ...arrows,
];
