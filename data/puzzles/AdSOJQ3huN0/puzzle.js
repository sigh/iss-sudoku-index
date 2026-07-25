// Title: Stepped Thermos
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=AdSOJQ3huN0
// Source: https://sudokupad.app/g21db32fo4

// Normal sudoku (rows, columns, default 3x3 boxes) is the solver baseline.
// Thermometers: digits strictly increase from the bulb end -- Thermo enforces
// this directly. Threesome rule: within each 3x3 box, the three cells of any
// full row-within-box or column-within-box must not be three consecutive
// digits in some order (any permutation, e.g. {4,5,6}, is forbidden). Box
// all-different already makes the three cells distinct, so this reduces to
// "the triple's max - min must not equal 2"; encoded below as a small NFA.

const givens = [
  new Given('R8C1', 7),
  new Given('R9C3', 9),
];

// Thermometer cells, bulb first; the bulb end of each is confirmed by the
// matching filled-circle underlay drawn at R6C4, R4C4, R4C6, R6C6.
const thermos = [
  new Thermo('R6C4', 'R7C4', 'R7C3', 'R8C3', 'R8C2', 'R9C2'),
  new Thermo('R4C4', 'R4C3', 'R3C3', 'R3C2', 'R2C2', 'R2C1'),
  new Thermo('R4C6', 'R3C6', 'R3C7', 'R2C7', 'R2C8', 'R1C8'),
  new Thermo('R6C6', 'R6C7', 'R7C7', 'R7C8', 'R8C8', 'R8C9'),
];

// State = the {lo, hi} spread of values read so far, order-independent so it
// works over any triple regardless of read direction. Reject a final spread
// of exactly 2, i.e. three consecutive digits.
const noThreeConsecutiveSpec = {
  startState: null,
  transition: (state, value) => (state === null
    ? { lo: value, hi: value }
    : { lo: Math.min(state.lo, value), hi: Math.max(state.hi, value) }),
  accept: (state) => state !== null && state.hi - state.lo !== 2,
};
const noThreeConsecutiveNFA = NFA.encodeSpec(noThreeConsecutiveSpec, 9);

// Every horizontal and vertical threesome within each 3x3 box, derived from
// the default box layout (not hand-enumerated).
const threesomes = [];
for (let boxRow = 0; boxRow < 3; boxRow++) {
  for (let boxCol = 0; boxCol < 3; boxCol++) {
    for (let r = 0; r < 3; r++) {
      threesomes.push([0, 1, 2].map(c =>
        makeCellId(boxRow * 3 + r + 1, boxCol * 3 + c + 1)));
    }
    for (let c = 0; c < 3; c++) {
      threesomes.push([0, 1, 2].map(r =>
        makeCellId(boxRow * 3 + r + 1, boxCol * 3 + c + 1)));
    }
  }
}
const noThreeConsecutive = threesomes.map(
  cells => new NFA(noThreeConsecutiveNFA, 'no3Consec', ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  ...noThreeConsecutive,
];
