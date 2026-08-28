// Title: Double Trouble
// Author: Reverend
// Video: https://www.youtube.com/watch?v=ZbAEh1TbAOA
// Source: https://cracking-the-cryptic.web.app/sudoku/NBMbJf4jrb

// Standard 9x9 sudoku (default row/column/box all-different). On each grey
// line, digits need not all ascend together, but the even digits along it
// increase reading away from the bulb, and separately the odd digits along
// it also increase reading away from the bulb (video description). Three of
// the eight lines fork from a single bulb into two tips; each arm below is
// scanned as its own bulb-first sequence.

// One NFA carries the last odd digit seen and the last even digit seen along
// a bulb-first arm. Each new digit must exceed the last one of its own
// parity (or be the first of that parity); the other parity's tracked value
// is untouched. There is no accept-state restriction: the "not necessarily
// ascend" clause means any point along the arm is a valid stopping state.
const parityAscendSpec = NFA.encodeSpec({
  startState: { lastOdd: null, lastEven: null },
  transition: ({ lastOdd, lastEven }, value) => {
    if (value % 2 === 1) {
      if (lastOdd !== null && value <= lastOdd) return undefined;
      return { lastOdd: value, lastEven };
    }
    if (lastEven !== null && value <= lastEven) return undefined;
    return { lastOdd, lastEven: value };
  },
  accept: () => true,
}, 9);

// Thermometer arms, bulb-first, provenance: the 8 grey-circle bulb underlays
// and the 11 drawn grey lines merged at their 3 stroke junctions. A forked
// line becomes two arms that both start at the shared bulb cell.
const arms = [
  ['R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R6C4', 'R6C3', 'R6C2', 'R6C1', 'R7C1'],
  ['R4C4', 'R4C3', 'R4C2', 'R4C1', 'R3C1'],
  ['R4C4', 'R3C3', 'R2C3'],
  ['R4C6', 'R3C7', 'R2C7'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R3C9'],
  ['R7C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
];

// Givens, provenance: the 7 filled cells in the payload.
const givens = [
  ['R2C1', 2], ['R2C4', 4], ['R4C4', 6], ['R4C6', 5],
  ['R6C4', 3], ['R7C9', 1], ['R9C1', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arms.map((arm, i) => new NFA(parityAscendSpec, `parity-ascend-${i}`, ...arm)),
];
