// Title: Horseshoe Toss
// Author: Teal
// Video: https://www.youtube.com/watch?v=zEGZ8-VJUF8
// Source: https://app.crackingthecryptic.com/k1i7tx72h1

// Standard Sudoku applies. Purple drawn paths are Renban lines. Each attached
// arrowhead points along a diagonal ray whose digits cannot occur on its line.
// The drawn > symbols point from their first cell to their smaller second cell.
// Renban paths and attached arrowhead rays transcribed from the purple artwork.
const lines = [
  ['R2C3', 'R1C2', 'R1C1', 'R2C1', 'R3C2'],
  ['R4C5', 'R5C4', 'R6C5', 'R5C6'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R7C8', 'R8C7', 'R9C8', 'R8C9'],
  ['R5C9', 'R4C9', 'R5C8', 'R6C7'],
  ['R6C3', 'R7C2', 'R7C3', 'R8C2'],
  ['R1C4', 'R2C5'],
  ['R5C2', 'R4C3', 'R3C4'],
];
const arrowRays = [
  [0, ['R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9']],
  [0, ['R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [1, ['R3C6', 'R2C7', 'R1C8']], [1, ['R4C7', 'R3C8', 'R2C9']],
  [2, ['R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2']],
  [3, ['R6C9']], [4, ['R7C6', 'R8C5', 'R9C4']],
  [5, ['R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8']],
  [6, ['R3C6', 'R4C7', 'R5C8', 'R6C9']],
  [7, ['R6C1']], [7, ['R2C5', 'R1C6']],
];
// Each target is separately compared with its line. AllDifferent imposes the
// arrowhead exclusion; its line-line part duplicates Renban's non-repetition.

return [
  new Shape('9x9'),
  ...lines.map(cells => new Renban(...cells)),
  ...arrowRays.flatMap(([line, targets]) =>
    targets.map(target => new AllDifferent(target, ...lines[line]))),
  new GreaterThan('R1C1', 'R1C2'),
  new GreaterThan('R7C6', 'R7C7'),
  new GreaterThan('R9C4', 'R8C4'),
];
