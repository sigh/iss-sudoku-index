// Title: Riddler on the FOOF
// Author: Olima
// Video: https://www.youtube.com/watch?v=fpYirYC6MtE
// Source: https://app.crackingthecryptic.com/sudoku/jgp8jqr7qm

// Normal sudoku rules apply (default Shape gives rows/cols/boxes). No givens.
// Green lines: neighbouring digits differ by at least 5 -> Whisper(5, ...).
// Grey lines: interior digits strictly between the two circled end digits
// -> Between(...cells), first/last cells are the circled endpoints.
// Black dots: 1:2 ratio between the two adjacent cells -> BlackDot(a, b).
// Rules state not all such pairs are marked, so no exhaustiveness constraint
// is added over unmarked adjacent pairs.

const betweenLines = [
  // Grey line clue-cell tables transcribed from the puzzle's drawn grey
  // circle overlays sitting on each line's two endpoint cells.
  ['R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R3C2', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R9C6', 'R9C7', 'R9C8'],
].map(cells => new Between(...cells));

const whisperLines = [
  // Green line cell paths transcribed from the puzzle's drawn line strokes.
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C2', 'R1C3'],
  ['R1C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R2C3', 'R2C4', 'R1C5', 'R2C6'],
].map(cells => new Whisper(5, ...cells));

const blackDots = [
  // Black dot pairs transcribed from the puzzle's drawn edge overlay marks.
  ['R5C2', 'R5C3'],
  ['R4C5', 'R5C5'],
  ['R5C7', 'R5C8'],
  ['R6C6', 'R7C6'],
  ['R6C5', 'R7C5'],
  ['R6C4', 'R7C4'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...betweenLines,
  ...whisperLines,
  ...blackDots,
];
