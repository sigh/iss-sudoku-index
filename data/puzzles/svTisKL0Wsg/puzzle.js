// Title: Y is the heating transport so X-tremely slow?
// Author: olima
// Video: https://www.youtube.com/watch?v=svTisKL0Wsg
// Source: https://sudokupad.app/258y2m2nv3

// Normal sudoku rules apply. No given digits.
//
// Three thermometers: digits must not decrease from the bulb to the tip(s)
// (ties allowed -- this is a "slow" thermometer, not the usual strict one).
// One thermometer forks into two tips from a single bulb (the rule's
// "tip(s)"); it is drawn as two strokes sharing their first three cells
// (R4C1, R5C2, R6C3), so it is encoded as two chains that overlap there.

// a <= b applied to each consecutive pair along a thermometer, bulb-first.
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

const thermometers = [
  // Bulb R6C8 -> tip R2C2.
  ['R6C8', 'R7C7', 'R8C6', 'R7C5', 'R6C6', 'R5C7', 'R4C6', 'R5C5', 'R6C4',
    'R5C3', 'R4C4', 'R3C5', 'R2C4', 'R3C3', 'R4C2', 'R3C1', 'R2C2'],
  // Bulb R1C4 -> tip R8C8.
  ['R1C4', 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9', 'R6C9', 'R7C8', 'R8C7',
    'R8C8'],
  // Forked thermometer, branch to tip R7C1.
  ['R4C1', 'R5C2', 'R6C3', 'R7C2', 'R8C1', 'R7C1'],
  // Same forked thermometer, branch to tip R8C4.
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(
    cells => new Pair(slowThermoKey, 'SlowThermo', ...cells)),
];
