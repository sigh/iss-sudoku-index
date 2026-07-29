// Title: Flying Dutchmen
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=n9gMPPpqr9c
// Source: https://app.crackingthecryptic.com/flh8lr4syy

// Normal Sudoku rules apply. Adjacent digits on each orange line differ by at
// least four. Each hand-transcribed line follows the orange stroke waypoints.
const orangeLines = [
  ['R1C1', 'R2C2', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R2C2'],
  ['R6C9', 'R5C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R7C3', 'R6C4', 'R7C5', 'R8C4', 'R9C3', 'R9C4', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C8', 'R6C7', 'R7C6'],
];

// Each hand-transcribed pair is joined by a drawn 6 ball and must sum to 6.
const sixBallPairs = [
  ['R2C1', 'R3C1'],
  ['R2C5', 'R3C5'],
  ['R7C8', 'R8C8'],
  ['R3C8', 'R3C9'],
  ['R9C7', 'R9C8'],
];
const sumToSix = Pair.fnToKey((a, b) => a + b === 6, 9);

return [
  new Shape('9x9'),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
  ...sixBallPairs.map(cells => new Pair(sumToSix, '6 ball', ...cells)),
];
