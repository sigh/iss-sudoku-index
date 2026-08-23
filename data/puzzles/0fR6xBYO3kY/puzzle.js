// Title: Whispering Knight
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=0fR6xBYO3kY
// Source: https://app.crackingthecryptic.com/sudoku/L6FBpNTnhN

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). Given: R8C5 = 6.
//
// "Digits separated by a knight's move (in chess) cannot contain the same
// digit" -- global AntiKnight, not scoped to any region.
// "Adjacent digits along a line in the grid must differ by at least 5" --
// nine drawn strokes (`lines`), each a Whisper(5). Two colours are drawn
// (green #A3E048 for eight strokes, blue #34BBE6 for one) but the rules text
// defines only one line type and no legend distinguishes the colours, so all
// nine are the same constraint. A tenth `lines` entry carries no waypoints
// and renders nothing, so it is not a clue.

// Whisper strokes, one per drawn line in `lines` (payload array order).
// Waypoints are cell centres; the two multi-cell strokes are each one
// path in the order the payload draws them.
const whisperLines = [
  ['R9C6', 'R8C7'],
  ['R7C3', 'R7C4'],
  ['R7C1', 'R7C2'],
  ['R6C7', 'R5C8'],
  ['R6C5', 'R6C4'],
  ['R5C3', 'R4C4'],
  ['R3C5', 'R4C5', 'R3C6', 'R2C6', 'R2C7', 'R1C6', 'R2C5', 'R1C5'],
  ['R1C3', 'R2C4', 'R3C3', 'R4C2', 'R3C1'],
  ['R8C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Given('R8C5', 6),
  new AntiKnight(),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
