// Title: Highly Counter Intuitive
// Author: Jaze
// Video: https://www.youtube.com/watch?v=4voJRYOoMu8
// Source: https://app.crackingthecryptic.com/n486ffPb4H

// Place 1-9 once in each marked 3x3 box; rows and columns may repeat.
// Equal digits may not be a knight's move apart. Arrow arms sum to their circles.
// Green lines are whispers; white dots are consecutive, black dots have a 2:1 ratio,
// and X marks sum to 10.
const shape = new Shape('9x9', '1-9', 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();
const whites = [
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'], ['R3C6', 'R3C7'], ['R2C6', 'R2C7'],
  ['R3C7', 'R3C8'], ['R3C8', 'R3C9'], ['R4C7', 'R4C8'],
  ['R5C7', 'R5C8'], ['R5C8', 'R6C8'], ['R6C7', 'R6C8'],
  ['R3C2', 'R4C2'], ['R8C1', 'R8C2'], ['R8C2', 'R8C3'],
  ['R9C2', 'R9C3'], ['R9C6', 'R9C7'], ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'],
];
const blacks = [
  ['R9C8', 'R9C9'], ['R7C8', 'R7C9'], ['R7C7', 'R7C8'],
  ['R7C6', 'R7C7'], ['R7C5', 'R7C6'], ['R7C4', 'R7C5'],
  ['R7C3', 'R7C4'], ['R7C2', 'R7C3'], ['R7C1', 'R7C2'],
  ['R4C5', 'R4C6'], ['R3C2', 'R3C3'], ['R3C1', 'R3C2'],
  ['R1C1', 'R1C2'],
];
const knightPairs = [];
for (let r = 1; r <= 9; r++) for (let c = 1; c <= 9; c++)
  for (const [dr, dc] of [[1, 2], [2, 1], [2, -1], [1, -2]])
    if (r + dr <= 9 && c + dc >= 1 && c + dc <= 9)
      knightPairs.push([makeCellId(r, c), makeCellId(r + dr, c + dc)]);

// Rows and columns may repeat, so the grid is Raw: no implicit constraints
// beyond the marked 3x3 boxes below.
return [
  shape,
  ...Array.from({length: 3}, (_, br) => Array.from({length: 3}, (_, bc) =>
    new AllDifferent(...rows.slice(3 * br, 3 * br + 3).flatMap(row => row.slice(3 * bc, 3 * bc + 3))))),
  ...knightPairs.map((cells) => new AllDifferent(...cells)),
  new Arrow('R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'),
  new Arrow('R3C7', 'R4C8', 'R5C9', 'R6C9'),
  new Arrow('R4C6', 'R4C7'),
  new Arrow('R4C3', 'R4C4', 'R4C5', 'R5C6'),
  new Arrow('R5C3', 'R5C4'),
  new Arrow('R6C4', 'R6C3', 'R6C2', 'R6C1'),
  new Whisper(5, 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Whisper(5, 'R9C3', 'R8C4', 'R9C5', 'R8C6', 'R9C7'),
  ...whites.map(([a, b]) => new WhiteDot(a, b)),
  ...blacks.map(([a, b]) => new BlackDot(a, b)),
  ...[['R1C3', 'R1C4'], ['R3C9', 'R4C9'], ['R3C1', 'R4C1']].map(([a, b]) => new X(a, b)),
];
