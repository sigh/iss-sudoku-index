// Title: Creatures in the Fog
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=cm5d1Rdzryw
// Source: https://sudokupad.app/3f7o01c1ws

// Normal sudoku, plus 8 given digits.
//
// Nine creatures haunt the grid, one per row, one per column and one per box
// (verified below from the drawn dot colours -- they occupy 9 distinct rows,
// columns and boxes). Each creature cell's own digit must equal its row,
// column, or box number (reading order); the 9 creatures' digits are also
// pairwise different (a rule on top of ordinary sudoku, since creatures don't
// share a row/column/box with each other).
//
// Four creature kinds, by dot colour:
//  - Zombie (green): every orthogonal neighbour shares the zombie's own
//    (variable) parity.
//  - Poltergeist (grey): every orthogonal neighbour is either all greater
//    than, or all less than, the poltergeist's own value (never mixed).
//    Neighbours always share the poltergeist's row or column, so ordinary
//    sudoku already forbids equality.
//  - Headless Horseman (orange): no cell a knight's move away may hold the
//    horseman's own digit.
//  - Vampire (red): the sum of its orthogonal neighbours equals its own
//    digit.
//
// Fog is a UI/flavour mechanic (digits reveal fog as they're placed; "no
// guessing required" just asserts the puzzle is logically unique) -- no
// logical constraint. The three single-cell "foglight" cages in the source
// payload (at R8C8, R6C9, R4C2) carry a non-numeric value and no total, so
// they add no constraint either; they merely mark cosmetic fog-effect cells.

const graph = cellGraph('9x9');

// Givens -- decoded from the source payload's given cells.
const givens = [
  new Given('R1C1', 9),
  new Given('R2C9', 1),
  new Given('R3C1', 2),
  new Given('R4C7', 3),
  new Given('R5C8', 7),
  new Given('R7C6', 4),
  new Given('R9C4', 3),
  new Given('R9C7', 2),
];

// Creature cells by dot colour, from the source payload's underlay circles:
//   #078828 (forestgreen) = Zombie
//   #dfdfdf (gainsboro/grey) = Poltergeist
//   #fd9712 (darkorange) = Headless Horseman
//   #a0042b (brown/red) = Vampire
const zombies = ['R8C8', 'R4C2', 'R3C7'];
const poltergeists = ['R6C9', 'R7C1', 'R2C5'];
const horsemen = ['R5C4', 'R1C3'];
const vampires = ['R9C6'];
const creatures = [...zombies, ...poltergeists, ...horsemen, ...vampires];

// Box index in standard reading order (1-9), matching the grid's default
// (undisturbed) box tiling.
function boxIndexOf(cell) {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
}

// A creature's digit indexes its own row, column, or box number. Row/col/box
// coincide for some cells (e.g. R1C3 has row 1 == box 1), so dedupe before
// building the candidate list.
const creatureCandidates = creatures.map((cell) => {
  const { row, col } = parseCellId(cell);
  const box = boxIndexOf(cell);
  return new Given(cell, ...new Set([row, col, box]));
});

// The 9 creatures' own digits are pairwise unique -- a genuine extra
// constraint, since the creatures were verified to occupy 9 distinct rows,
// columns *and* boxes, so ordinary sudoku alone never forces this.
const creatureAllDifferent = new AllDifferent(...creatures);

// Zombies: every orthogonal neighbour has the same parity as the zombie's
// own (variable) digit -- i.e. zombie and neighbour always share parity.
const zombieParity = zombies.flatMap((cell) =>
  graph.neighbours(cell).map(
    (n) => new Pair(Pair.fnToKey((a, b) => a % 2 === b % 2, 9), '', cell, n)
  )
);

// Poltergeists: all orthogonal neighbours greater than the poltergeist's
// value, or all of them less (never mixed).
const poltergeistOrder = poltergeists.map((cell) => {
  const neighbours = graph.neighbours(cell);
  return new Or([
    new And(neighbours.map((n) => new GreaterThan(n, cell))),
    new And(neighbours.map((n) => new GreaterThan(cell, n))),
  ]);
});

// Headless Horsemen: no knight-move cell may hold the horseman's own digit.
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];
function knightMoveCells(cell) {
  return KNIGHT_OFFSETS
    .map(([dr, dc]) => graph.step(cell, dr, dc))
    .filter((c) => c !== null);
}
const horsemenDifferent = horsemen.flatMap((cell) =>
  knightMoveCells(cell).map((n) => new AllDifferent(cell, n))
);

// Vampire: the sum of its orthogonal neighbours equals its own digit.
const vampireSums = vampires.map(
  (cell) => new Arrow(cell, ...graph.neighbours(cell))
);

return [
  new Shape('9x9'),
  ...givens,
  ...creatureCandidates,
  creatureAllDifferent,
  ...zombieParity,
  ...poltergeistOrder,
  ...horsemenDifferent,
  ...vampireSums,
];
