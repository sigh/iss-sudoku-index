// Title: Jul 22, 2022: Greater Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=S38_J6HNu58
// Source: https://tinyurl.com/ywxscu8r

// Normal sudoku rules apply. A number in a white circle indicates the larger
// of the two digits it touches. Every circle sits between two orthogonally
// adjacent cells, so those two cells already share a row or column and are
// forced distinct by normal sudoku rules -- no separate "larger" tie-break
// is needed.

// Given digit, transcribed from the drawn `grid` value.
const given = ['R5C5', 1];

// White circles: [value, cellA, cellB], transcribed from the drawn `circle`
// array (each circle sits on the shared edge of the two cells it touches).
const circles = [
  [3, 'R4C5', 'R4C4'],
  [5, 'R5C6', 'R4C6'],
  [7, 'R6C6', 'R6C5'],
  [9, 'R5C4', 'R6C4'],
  [4, 'R1C5', 'R2C5'],
  [2, 'R1C1', 'R1C2'],
  [3, 'R2C2', 'R1C2'],
  [4, 'R2C3', 'R2C2'],
  [5, 'R3C3', 'R2C3'],
  [6, 'R8C5', 'R9C5'],
  [8, 'R5C9', 'R5C8'],
  [5, 'R4C2', 'R5C2'],
  [6, 'R4C2', 'R4C3'],
  [3, 'R6C8', 'R6C7'],
  [4, 'R6C8', 'R5C8'],
  [3, 'R7C7', 'R8C7'],
  [5, 'R8C7', 'R8C8'],
  [6, 'R9C8', 'R8C8'],
  [7, 'R9C9', 'R9C8'],
  [6, 'R8C2', 'R7C2'],
  [7, 'R8C1', 'R8C2'],
  [2, 'R2C8', 'R3C8'],
  [6, 'R2C8', 'R2C9'],
  [5, 'R1C6', 'R1C7'],
  [4, 'R9C3', 'R9C4'],
  [3, 'R5C2', 'R5C1'],
  [8, 'R2C7', 'R1C7'],
  [9, 'R8C3', 'R9C3'],
];

// One Pair per circle: the printed value equals max(cellA, cellB). Keyed per
// distinct printed value, since Pair.fnToKey's key is the relation's truth
// table, so same-value circles share one key.
function largerKey(value) {
  return Pair.fnToKey((a, b) => Math.max(a, b) === value, 9);
}

return [
  new Shape('9x9'),
  new Given(...given),
  ...circles.map(([value, a, b]) =>
    new Pair(largerKey(value), `White circle ${value}`, a, b)),
];
