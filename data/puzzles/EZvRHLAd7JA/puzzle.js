// Title: Stairs 2
// Author: Alaric Taqi A
// Video: https://www.youtube.com/watch?v=EZvRHLAd7JA
// Source: https://app.crackingthecryptic.com/sudoku/qLggJDjpgm
//
// Normal sudoku rules apply (regions array matches the default 3x3 boxes).
// Thermometers increase from the bulb (Thermo). Cages sum to their total with
// no repeated digit (Cage, killer convention). The marked diagonal sums to
// the given total and digits may repeat (LittleKiller, which permits repeats
// natively). Green cells are a Sujiken triangle: no digit repeats along any
// diagonal, in either direction, restricted to the portion of that diagonal
// lying inside the green area.

const givens = [
  new Given('R3C1', 7),
  new Given('R6C4', 8),
  new Given('R7C2', 7),
  new Given('R8C1', 9),
  new Given('R8C3', 4),
  new Given('R9C2', 8),
  new Given('R9C7', 9),
];

const cages = [
  new Cage(17, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(8, 'R7C8', 'R7C9', 'R8C9'),
  new Cage(20, 'R4C5', 'R4C6', 'R5C6'),
];

const thermos = [
  new Thermo('R3C9', 'R3C8', 'R2C8', 'R1C8'),
  new Thermo('R6C5', 'R5C4'),
  // Drawn tip-first (bulb mark is on the last drawn cell, R1C1); encoded
  // here in the reverse of the drawn order, starting at the bulb.
  new Thermo('R1C1', 'R2C1', 'R3C2', 'R2C2', 'R3C3'),
];

// The diagonal ray + "24" label starts at R4C9 (the drawn arrow's bulb) and
// runs down-left to the opposite edge.
const graph = cellGraph();
const diagonalCells = graph.ray('R4C9', 1, -1);
const diagonalSum = LittleKiller.fromCells(
  24, diagonalCells, graph.gridGeometry());

// Green Sujiken triangle: every R{r}C{c} with c <= r (drawn as the 45-cell
// underlay shading). Compute both diagonal families from this cell set
// rather than hand-listing each diagonal.
const greenCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= r; c++) greenCells.push([r, c]);
}

const byMainDiag = new Map();   // key: r - c
const byAntiDiag = new Map();   // key: r + c
for (const [r, c] of greenCells) {
  const kMain = r - c;
  const kAnti = r + c;
  if (!byMainDiag.has(kMain)) byMainDiag.set(kMain, []);
  if (!byAntiDiag.has(kAnti)) byAntiDiag.set(kAnti, []);
  byMainDiag.get(kMain).push([r, c]);
  byAntiDiag.get(kAnti).push([r, c]);
}

const sujikenGroups = [];
for (const group of [...byMainDiag.values(), ...byAntiDiag.values()]) {
  if (group.length < 2) continue; // A length-1 diagonal imposes nothing.
  sujikenGroups.push(group.map(([r, c]) => makeCellId(r, c)));
}
const sujikenDiagonals = sujikenGroups.map(
  cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...thermos,
  diagonalSum,
  ...sujikenDiagonals,
];
