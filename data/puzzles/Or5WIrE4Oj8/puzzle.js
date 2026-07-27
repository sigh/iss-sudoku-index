// Title: Warp Speed
// Author: The Bard
// Video: https://www.youtube.com/watch?v=Or5WIrE4Oj8
// Source: https://sudokupad.app/z7ls0c722e

// Rules encoded: normal Sudoku (rows/cols/boxes, default), Knight's Move
// (AntiKnight, global), German Whispers (Whisper, default difference 5),
// Thermometer (Thermo, strictly increasing from the bulb), Palindrome lines,
// Quadruples (Quad), and Killer cages (Cage; a no-total cage is cannot-repeat
// only, per the "if given" clause in the rules text).
//
// The payload draws each Whisper line twice: once in the `whispers` array and
// again, with identical cells, in a generic green `line` entry (isNewConstraint,
// same colour). That is one drawn clue, encoded once below.
//
// Thermometer cell order in the source payload starts at the bulb (format
// convention), so the first cell of each thermometer is the bulb end.

const whisperLines = [
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R4C5', 'R5C4'],
];

const palindromeLines = [
  ['R3C7', 'R4C6', 'R5C5'],
  ['R6C7', 'R7C6'],
  ['R3C4', 'R4C3', 'R5C2'],
  ['R3C9', 'R4C8'],
  ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3'],
  ['R1C4', 'R2C3'],
];

// Quadruple entries: [topLeftCell, ...values]. Each entry's first listed cell
// is already the 2x2's top-left corner (source: `quadruple` array).
const quads = [
  ['R8C8', 1, 2, 8, 9],
  ['R1C1', 1, 3, 4, 6],
  ['R2C7', 2, 7],
  ['R7C1', 7],
];

// No-total killer cage: 9 cells, cannot repeat (no corner total in the source).
const noTotalCage = [
  'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C1', 'R7C4', 'R8C4', 'R9C3', 'R9C4',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...whisperLines.map(cells => new Whisper(...cells)),
  new Thermo('R9C1', 'R8C2', 'R7C3'),
  ...palindromeLines.map(cells => new Palindrome(...cells)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
  new AllDifferent(...noTotalCage),
  new Cage(14, 'R1C8', 'R1C9', 'R2C9'),
];
