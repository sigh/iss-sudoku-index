// Title: Benebelte Nachbarschaft
// Author: Myxo
// Video: https://www.youtube.com/watch?v=XIYKBHGPtrU
// Source: https://app.crackingthecryptic.com/sudoku/L9M2DLtfrh
//
// Normal Sudoku rules apply. White dots (WhiteDot) mark consecutive pairs and
// black dots (BlackDot) mark 2:1-ratio pairs; not all such pairs are marked,
// so absence of a dot carries no information (no StrictKropki).
// Each coloured line is a Renban set: non-repeating consecutive digits, any
// order, encoded with one Renban per line since the rule scope is per-line,
// not a shared set across lines.
// The grid is covered by fog in the source UI; fog reveal is solving-time
// display state, not a final-grid rule, and is not encoded. The payload's two
// non-numeric "FOGLIGHT" cage entries likewise mark starting-lit UI cells,
// not a sudoku cage or all-different group, and are omitted.

const whiteDots = [
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
  ['R1C7', 'R2C7'],
  ['R7C8', 'R7C9'],
];

const blackDots = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R3C2'],
  ['R3C2', 'R4C2'],
  ['R5C8', 'R5C9'],
  ['R7C4', 'R7C5'],
];

const renbanLines = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R4C4', 'R5C4', 'R5C5', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R5C2'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R3C7', 'R2C7', 'R2C8', 'R2C9'],
  ['R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R7C6'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R3C8', 'R3C9'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
];
