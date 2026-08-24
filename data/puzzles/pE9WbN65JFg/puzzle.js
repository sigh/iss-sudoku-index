// Title: Renban Dance
// Author: Qodec
// Video: https://www.youtube.com/watch?v=pE9WbN65JFg
// Source: https://app.crackingthecryptic.com/sudoku/DrpgPndfDd

// Normal sudoku rules apply (default row/column/box all-different).
// Each grey line is a Renban: the digits it covers form a set of
// consecutive, non-repeating integers, in any order.
// The one grey-circle cell must hold an odd digit; there is no `Odd`
// class, so it is a multi-value Given restricting the candidates.
// Line and circle cells are transcribed from the payload's `lines` and
// `underlays` arrays.

const renbanLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4'],
  ['R2C4', 'R1C5'],
  ['R2C5', 'R1C6', 'R2C6'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C6', 'R5C7', 'R6C7'],
  ['R1C8', 'R2C8'],
  ['R4C8', 'R4C9'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R6C2', 'R7C1', 'R8C2'],
  ['R8C3', 'R9C3'],
  ['R7C3', 'R6C3', 'R5C3', 'R5C4'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R6C4', 'R6C5', 'R6C6', 'R7C7', 'R8C7', 'R9C7'],
  ['R5C5', 'R5C6'],
  ['R8C9', 'R9C9'],
  ['R7C9', 'R6C8', 'R5C9'],
];

return [
  new Shape('9x9'),

  new Given('R9C4', 2),
  new Given('R9C5', 7),

  new Given('R3C5', 1, 3, 5, 7, 9),

  ...renbanLines.map((cells) => new Renban(...cells)),
];
