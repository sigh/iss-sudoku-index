// Title: A sudoku that spells cicada
// Author: meloettaHD
// Video: https://www.youtube.com/watch?v=gv1bSMbRQQ0
// Source: https://sudokupad.app/0z0pkkno12

// Standard sudoku (rows, columns, boxes) plus four cages, three index
// lines, one clone pair of regions, one Dutch whisper line, antiking and
// antiknight. Nothing is omitted.

// Cages: digits do not repeat and sum to the total. Cage coordinates are
// read from the source's cage cell lists.
const cages = [
  [12, 'R1C1', 'R2C1'],
  [4, 'R8C1', 'R9C1'],
  [3, 'R6C2', 'R6C3'],
  [7, 'R1C8', 'R2C8'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// Index Line rule: on a line of length N, read from its square-bulb end,
// the digit in the Kth cell gives the position along the line where digit
// K appears. Every value on the line must therefore be a valid position,
// i.e. in 1..N, and (for K in 1..N) the cell at that position holds K -- a
// self-inverse permutation of 1..N. That is enforced below as: restrict
// each line cell's candidates to 1..N (only needed when N < 9, the grid's
// own digit range), then for every pair of positions (i, j) on the line,
// the value at i equals j exactly when the value at j equals i.
function indexLine(cells) {
  const n = cells.length;
  const domainRestriction = n < 9
    ? cells.map(cell => new Given(cell, ...Array.from({length: n}, (_, k) => k + 1)))
    : [];
  const inversePairs = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 9);
      inversePairs.push(new Pair(key, 'Index Line', cells[i - 1], cells[j - 1]));
    }
  }
  return [...domainRestriction, new AllDifferent(...cells), ...inversePairs];
}

// Index Line cells, bulb (start) cell first. Read from the light-blue line
// waypoints and the matching square-bulb underlay marking position 1. The
// third line's waypoints jump diagonally across two cells (R6C9 to R4C7),
// so R5C8 -- exactly on that diagonal -- is inserted as the cell the line
// actually passes through.
const indexLines = [
  ['R7C7', 'R7C6', 'R6C5', 'R7C4'],
  ['R1C5', 'R2C5', 'R1C4'],
  ['R5C9', 'R6C9', 'R5C8', 'R4C7', 'R4C8'],
];

// Clones: corresponding positions in the two gray regions hold equal
// digits. Read from the grey underlay cells and the +3 row / +1 column
// translation that maps one region onto the other.
const clonePairs = [
  ['R2C7', 'R5C8'],
  ['R3C7', 'R6C8'],
  ['R4C7', 'R7C8'],
  ['R4C6', 'R7C7'],
].map(cells => new SameValues(2, ...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...indexLines.flatMap(indexLine),
  ...clonePairs,
  new AntiKing(),
  new Whisper(4, 'R6C2', 'R7C2', 'R8C2', 'R8C1'),
  new AntiKnight(),
];
