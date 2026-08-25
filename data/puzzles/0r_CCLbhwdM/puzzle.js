// Title: Picnic Sudoku
// Author: Justin Smart
// Video: https://www.youtube.com/watch?v=0r_CCLbhwdM
// Source: https://app.crackingthecryptic.com/webapp/GtFjLLNbFT
//
// Standard sudoku. Digits increase along each thermometer from the round
// bulb to its far end (Thermo enforces this). Each thermometer's bulb sits
// in a different row; the clue printed to the right of a row is the sum of
// that row's thermometer digits excluding the bulb cell and the far-end
// cell (the middle segment), encoded as Sum over just those middle cells.

const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'], // bulb row 1
  ['R2C3', 'R3C2', 'R4C2', 'R5C2'], // bulb row 2
  ['R3C8', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R6C8'], // bulb row 3
  ['R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4'], // bulb row 4
  ['R5C7', 'R5C6', 'R4C5', 'R3C6', 'R3C5'], // bulb row 5
  ['R6C3', 'R5C3', 'R6C4'], // bulb row 6
  ['R7C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1', 'R8C2'], // bulb row 7
  ['R8C6', 'R8C7', 'R8C8', 'R7C9', 'R8C9'], // bulb row 8
  ['R9C1', 'R9C2', 'R8C3', 'R8C4', 'R9C3', 'R9C4'], // bulb row 9
];

// Outside sum clue per row (right of grid), read against the thermo whose
// bulb is in that row.
const outsideSums = [16, 9, 19, 9, 19, 6, 19, 14, 22];

return [
  new Shape('9x9'),
  new Given('R1C6', 5),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...thermos.map((cells, i) => new Sum(outsideSums[i], ...cells.slice(1, -1))),
];
