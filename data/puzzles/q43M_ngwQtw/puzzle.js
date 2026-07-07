// Reborn hooligan ghost by Lithium-Ion
// https://sudokupad.app/1b5i3a2d2d
// https://www.youtube.com/watch?v=q43M_ngwQtw
//
// Normal sudoku. A circled digit equals the sum of all orthogonally adjacent cells.

const circles = [
  ['R9C3', 'R8C3', 'R9C2', 'R9C4'],
  ['R7C2', 'R6C2', 'R8C2', 'R7C1', 'R7C3'],
  ['R9C8', 'R8C8', 'R9C7', 'R9C9'],
  ['R7C9', 'R6C9', 'R8C9', 'R7C8'],
  ['R5C1', 'R4C1', 'R6C1', 'R5C2'],
  ['R2C1', 'R1C1', 'R3C1', 'R2C2'],
  ['R4C6', 'R3C6', 'R5C6', 'R4C5', 'R4C7'],
  ['R3C9', 'R2C9', 'R4C9', 'R3C8'],
  ['R1C7', 'R2C7', 'R1C6', 'R1C8'],
];

const circleCells = new Set(circles.map(([center]) => center));

const cells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    cells.push(`R${r}C${c}`);
  }
}

function orthogonalNeighbours(cell) {
  const match = /^R(\d)C(\d)$/.exec(cell);
  const r = Number(match[1]);
  const c = Number(match[2]);
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
    .filter(([rr, cc]) => rr >= 1 && rr <= 9 && cc >= 1 && cc <= 9)
    .map(([rr, cc]) => `R${rr}C${cc}`);
}

const notCircle = NFA.encodeSpec({
  startState: { i: 0, center: 0, sum: 0 },
  transition({ i, center, sum }, value) {
    if (i === 0) {
      return { i: 1, center: value, sum: 0 };
    }
    return { i: i + 1, center, sum: sum + value };
  },
  accept({ i, center, sum }) {
    return i > 1 && sum !== center;
  },
  maxDepth: 5,
}, 9);

return [
  new Shape('9x9'),
  ...circles.map(([center, ...orthogonal]) => new Arrow(center, ...orthogonal)),
  ...cells
    .filter(cell => !circleCells.has(cell))
    .map(cell => new NFA(notCircle, 'not-circle', cell, ...orthogonalNeighbours(cell))),
];
