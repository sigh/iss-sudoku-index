// Title: Sept. 27, 2021: Ring of Fire
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=_MOJnibGiKY
// Source: https://tinyurl.com/ytmzkkn7

// Normal sudoku rules apply. Digits along thermometers must increase from
// the bulb to the tip. No given digits.

// Six thermometers, each transcribed bulb (round end, first cell) to tip
// (last cell), from the drawn lines.
const thermos = [
  ['R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'],
  ['R8C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C1'],
  ['R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3'],
  ['R3C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6'],
  ['R4C3', 'R5C4', 'R6C5'],
  ['R2C4', 'R3C5'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
];
