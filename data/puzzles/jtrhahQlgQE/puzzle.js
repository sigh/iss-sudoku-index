// Title: When All Else Fails
// Author: PhyDraLey
// Video: https://www.youtube.com/watch?v=jtrhahQlgQE
// Source: https://sudokupad.app/yva5yqfaam

// Rules encoded below:
//   - Normal sudoku rules apply.
//   - Thermometer: digits along a thermometer increase from bulb to tip.
//   - German whisper: adjacent digits along a green line differ by at least 5.
//   - Region sum: box borders divide a blue line into segments of equal sum.
// There are no given digits.
//
// Rule NOT encoded:
//   - "When all else fails: If it is impossible to place any digits, place a 3
//     in the top-most row that does not contain a 3, in the left-most cell that
//     could contain a 3." This clause is a condition on the state of a solving
//     procedure (deduction having stalled) rather than a property of the
//     finished grid, so no constraint over the completed grid expresses it.
//     The encoding below is therefore weaker than the published puzzle.
//   - "This puzzle does not require bifurcating" is a solving-difficulty
//     remark, not a constraint on the digits.

// Cell paths transcribed from the drawn strokes; each thermometer is listed
// bulb-first. The bulbs are the five grey filled circles, at R1C1, R2C4, R3C7,
// R4C8 and R7C7. The R3C6-R3C7 stroke is drawn tip-first, so its listing is the
// reverse of the drawn waypoint order.
const thermos = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R5C3'],
  ['R3C7', 'R3C6'],
  ['R4C8', 'R5C9'],
  ['R7C7', 'R6C7', 'R6C6'],
];

// Green line paths, in drawn order. Whisper binds consecutive pairs by list
// order, which is what these lines need: several of their steps are diagonal.
const whispers = [
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R6C2'],
  ['R2C6', 'R3C6', 'R4C5', 'R5C6'],
  ['R6C5', 'R7C6', 'R8C7'],
];

// The single blue line, in drawn order. RegionSumLine splits the path at box
// borders itself, giving the three two-cell segments R2C7/R3C8 (box 3),
// R4C7/R5C7 (box 6) and R4C6/R5C5 (box 5).
const regionSumLine = ['R2C7', 'R3C8', 'R4C7', 'R5C7', 'R4C6', 'R5C5'];

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...whispers.map((cells) => new Whisper(5, ...cells)),
  new RegionSumLine(...regionSumLine),
];
