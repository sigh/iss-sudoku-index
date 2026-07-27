// Title: German Beetles
// Author: Katie Splendor
// Video: https://www.youtube.com/watch?v=K9Ov4kc4B28
// Source: https://sudokupad.app/9os1agpdp7
//
// Rules encoded: normal sudoku; green lines are German whispers (adjacent
// digits differ by >= 5); the four short lines drawn with a bulb underlay
// are thermometers, strictly increasing from the bulb; the two short lines
// drawn without a bulb are gray palindromes; the killer cages give distinct
// digits summing to the corner total; unlabeled dot marks are white Kropki
// dots (consecutive digits) -- no black-filled dot is drawn anywhere in the
// payload, so the black Kropki clause in the rules text has no clue to
// encode; X marks sum their pair to 10 and the V mark sums its pair to 5.
// None of the pairwise clues (Kropki, X, V) are exhaustively marked, so
// their absence elsewhere carries no information.

// Each green line is a closed 6-cell loop; repeat the first cell to cover
// the wrap-around edge.
const whisperLoops = [
  ['R7C2', 'R7C3', 'R8C3', 'R9C2', 'R9C1', 'R8C1', 'R7C2'],
  ['R7C7', 'R8C7', 'R9C8', 'R9C9', 'R8C9', 'R7C8', 'R7C7'],
  ['R1C8', 'R2C7', 'R3C7', 'R3C8', 'R2C9', 'R1C9', 'R1C8'],
  ['R2C3', 'R3C3', 'R3C2', 'R2C1', 'R1C1', 'R1C2', 'R2C3'],
];

// Bulb (first cell) identified by the circle underlay drawn at that end.
const thermos = [
  ['R3C3', 'R2C2', 'R1C1'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R7C3', 'R8C2', 'R9C1'],
];

const palindromes = [
  ['R4C3', 'R4C4', 'R3C4'],
  ['R7C6', 'R6C6', 'R6C7'],
];

const cages = [
  [12, 'R3C1', 'R3C2'],
  [12, 'R1C3', 'R2C3'],
  [14, 'R3C8', 'R3C9'],
  [14, 'R1C7', 'R2C7'],
  [12, 'R7C8', 'R7C9'],
  [12, 'R8C7', 'R9C7'],
  [14, 'R8C3', 'R9C3'],
  [14, 'R7C1', 'R7C2'],
];

const whiteDots = [
  ['R2C3', 'R2C4'],
  ['R8C6', 'R8C7'],
  ['R1C6', 'R1C7'],
  ['R9C3', 'R9C4'],
  ['R6C9', 'R7C9'],
];

const xPairs = [
  ['R6C2', 'R7C2'],
  ['R3C8', 'R4C8'],
  ['R6C1', 'R6C2'],
  ['R4C8', 'R4C9'],
  ['R3C5', 'R4C5'],
];

const vPairs = [
  ['R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),

  ...whisperLoops.map(cells => new Whisper(5, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
];
