// Title: Sudoku en rouge, jaune, bleu et noir
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=UrvJfgNLNDc
// Source: https://sudokupad.app/jkcqhkr4sh?setting-nogrid=1

// The answer has 71 playable cells; black cells are absent from this Var grid.
const layout = [
  "###....#",
  "###....#",
  ".......#",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
];
const rowNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
const columnNumbers = Array.from({ length: 8 }, (_, i) => i + 1);
const allIds = rowNumbers.flatMap(row =>
  columnNumbers.map(col => makeCellId(row, col)));
const playableIds = allIds.filter((_, i) =>
  layout[Math.floor(i / 8)][i % 8] === ".");
const blackIds = allIds.filter((_, i) =>
  layout[Math.floor(i / 8)][i % 8] === "#");
const grid = new Var("G", "Grid including pinned black cells",
  `${rowNumbers.length}x${columnNumbers.length}`);
const gridCells = grid.cells();
const byId = new Map(allIds.map((id, i) => [id, gridCells[i]]));
const cells = spec => spec.trim().split(/\s+/).map(id => byId.get(id));

const rows = Array.from({ length: 10 }, (_, row) =>
  playableIds.filter(id => parseCellId(id).row === row + 1).map(id => byId.get(id)));
const columns = Array.from({ length: 8 }, (_, col) =>
  playableIds.filter(id => parseCellId(id).col === col + 1).map(id => byId.get(id)));

const whiteRegions = [
  cells("R1C4 R1C5"),
  cells("R2C4 R2C5"),
  cells("R3C1 R4C1"),
  cells("R5C1 R6C1"),
  cells("R4C8 R5C8 R6C8 R7C8"),
  cells("R5C6 R5C7"),
  cells("R6C6 R6C7"),
  cells("R7C3 R8C3"),
  cells("R7C4 R8C4 R9C4"),
  cells("R7C7 R8C7"),
  cells("R9C1 R9C2 R9C3"),
  cells("R9C5 R9C6 R9C7 RaC5 RaC6 RaC7"),
];
const yellowRegions = [
  cells("R1C6 R1C7 R2C6 R2C7"),
  cells("R3C6 R3C7 R4C6 R4C7"),
  cells("RaC1 RaC2 RaC3 RaC4"),
];
const redRegions = [
  cells("R3C2 R3C3 R3C4 R3C5 R4C2 R4C3 R4C4 R4C5 R5C2 R5C3 R5C4 R5C5 R6C2 R6C3 R6C4 R6C5"),
  cells("R8C8 R9C8 RaC8"),
];
const blueRegions = [
  cells("R7C1 R7C2 R8C1 R8C2"),
  cells("R7C5 R7C6 R8C5 R8C6"),
];

// Three pale diagonals are drawn in the artwork. Endpoints read off the
// archived image: cell pitch 76px, grid origin (18.5, 19.5), which reproduces
// the two long diagonals' endpoints exactly. The third is a single diagonal
// step inside the lower yellow block.
const diagonals = [
  cells("R3C5 R4C4 R5C3 R6C2 R7C1"),
  cells("R6C6 R7C5 R8C4 R9C3"),
  cells("R4C6 R3C7"),
];
const monotoneEitherWay = line => new Or([
  new Thermo(...line),
  new Thermo(...line.toReversed()),
]);

const outlinedSquares = cells(
  "R1C4 R1C7 R2C5 R3C7 R4C1 R5C8 R6C5 RaC6 RaC8");
// All separately outlined regions of each colour have the same sum.
const equalRegionSums = [
  whiteRegions,
  yellowRegions,
  redRegions,
  blueRegions,
].map(regions => new EqualSum(...regions));

return [
  new Shape("1x1", "0-9"),
  new Given("R1C1", 0), // Fixed placeholder; the answer lives in VG.
  grid,
  // Black cells are inert padding retained only to align the source's 80-cell
  // serialized solution; they occur in no puzzle rule.
  ...blackIds.map(id => new Given(byId.get(id), 0)),
  ...rows.map(row => new AllDifferent(...row)),
  ...columns.map(column => new AllDifferent(...column)),
  ...equalRegionSums,
  ...diagonals.map(monotoneEitherWay),
  new AllDifferent(...outlinedSquares),
];
