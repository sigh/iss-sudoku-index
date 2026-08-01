// Title: Odd Nebula
// Author: Nurator
// Video: https://www.youtube.com/watch?v=9qorOlkTmrI
// Source: https://sudokupad.app/86fQt7nfBQ

// Normal Sudoku; distinct killer cages; Xs sum to 10; all odd digits form one
// orthogonally connected galaxy, and 180-degree rotational partners have the
// same parity. Fog and the no-guessing instruction are UI-only.
const ODD = [1, 3, 5, 7, 9];
const sameParity = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);

// The drawn cages, listed with their printed top-left totals.
const cages = [
  [7, 'R4C5', 'R4C6', 'R5C5'],
  [19, 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  [19, 'R5C2', 'R6C2', 'R6C3', 'R6C4'],
  [13, 'R1C5', 'R2C4', 'R2C5'],
  [23, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [22, 'R7C5', 'R8C5', 'R8C6'],
];

// The six X overlays on adjacent cell edges.
const xs = [
  ['R5C3', 'R5C4'], ['R6C1', 'R6C2'], ['R7C2', 'R8C2'],
  ['R9C1', 'R9C2'], ['R7C6', 'R7C7'], ['R7C7', 'R8C7'],
];

// Generate each 180-degree partner pair once; the central cell maps to itself.
const rotationalParity = Array.from({length: 81}, (_, index) => {
  const row = Math.floor(index / 9) + 1;
  const col = index % 9 + 1;
  const partner = [10 - row, 10 - col];
  return row < partner[0] || (row === partner[0] && col < partner[1])
    ? [new Pair(sameParity, 'rotational parity', makeCellId(row, col), makeCellId(...partner))]
    : [];
});

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...xs.map(cells => new X(...cells)),
  ...rotationalParity,
  new ConnectedValues('', ODD),
];
