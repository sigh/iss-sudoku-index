// Title: Highly Counter Intuitive
// Author: Jaze
// Video: https://www.youtube.com/watch?v=4voJRYOoMu8
// Source: https://app.crackingthecryptic.com/n486ffPb4H

// Place 1-9 once in each marked 3x3 box; rows and columns may repeat.
// Equal digits may not be a knight's move apart. Arrow arms sum to their circles.
// Green lines are whispers; white dots are consecutive, black dots have a 2:1 ratio,
// and X marks sum to 10.
const grid = new Var('G', 'Puzzle grid', '9x9');
const cell = (row, col) => grid.cell(row, col);
const rows = Array.from({length: 9}, (_, r) =>
  Array.from({length: 9}, (_, c) => cell(r + 1, c + 1)));
const at = (id) => cell(+id.match(/R(\d+)/)[1], +id.match(/C(\d+)/)[1]);
const dots = (pairs, relation, label) => pairs.map(([a, b]) =>
  new Pair(relation, label, at(a), at(b)));
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
      knightPairs.push([cell(r, c), cell(r + dr, c + dc)]);
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const ratio = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const ten = Pair.fnToKey((a, b) => a + b === 10, 9);

// ISS main-grid cells always enforce row and column uniqueness, so the real board
// is a 9x9 Var group. The single main-grid cell is fixed solely to remove scaffold freedom.
return [
  new Shape('1x1', 9), new Given('R1C1', 1), grid,
  ...Array.from({length: 3}, (_, br) => Array.from({length: 3}, (_, bc) =>
    new AllDifferent(...rows.slice(3 * br, 3 * br + 3).flatMap(row => row.slice(3 * bc, 3 * bc + 3))))),
  ...knightPairs.map((cells) => new AllDifferent(...cells)),
  new Arrow(at('R2C3'), at('R2C4'), at('R2C5'), at('R2C6'), at('R2C7'), at('R2C8')),
  new Arrow(at('R3C7'), at('R4C8'), at('R5C9'), at('R6C9')),
  new Arrow(at('R4C6'), at('R4C7')),
  new Arrow(at('R4C3'), at('R4C4'), at('R4C5'), at('R5C6')),
  new Arrow(at('R5C3'), at('R5C4')),
  new Arrow(at('R6C4'), at('R6C3'), at('R6C2'), at('R6C1')),
  new Whisper(5, at('R1C5'), at('R1C6'), at('R1C7'), at('R1C8'), at('R1C9'), at('R2C9')),
  new Whisper(5, at('R9C3'), at('R8C4'), at('R9C5'), at('R8C6'), at('R9C7')),
  ...dots(whites, consecutive, 'white dot'),
  ...dots(blacks, ratio, 'black dot'),
  ...dots([['R1C3', 'R1C4'], ['R3C9', 'R4C9'], ['R3C1', 'R4C1']], ten, 'X'),
];
