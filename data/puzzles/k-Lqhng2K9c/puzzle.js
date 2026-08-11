// Title: Code 62 (Hi-Five)
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=k-Lqhng2K9c
// Source: https://app.crackingthecryptic.com/sudoku/m4MQ4pTN8b

// Normal sudoku on a standard 9x9 grid with default 3x3 boxes (no givens).
// Rules, each mapped to a constraint group below:
//  - Purple 2-cell lines: the pair is a set of consecutive digits, any order
//    -> Renban (2 cells; already distinct since consecutive digits differ).
//  - Grey thermometers: strictly increasing away from the bulb -> Thermo,
//    bulb cell first.
//  - Arrows: circled cell equals the sum of the other arrow cells -> Arrow,
//    circle cell first, matching the drawn bulb (underlay circle sits on the
//    arrow's first path cell).
//  - Outside diagonal-sum clues: sum of the digits along the indicated
//    diagonal, read inward from the badge -> LittleKiller.fromCells, using
//    each diagonal's own cell ray so the cell list is derived rather than
//    hand-typed twice.
//  - X clue: the two cells sharing the drawn edge sum to 10 -> X (adjacency
//    enforced natively by the class).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  ['R2C2', 'R2C3', 'R3C3'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R8C8', 'R8C9', 'R9C9'],
].map(cells => new Thermo(...cells));

const purpleDominoes = [
  ['R1C1', 'R2C1'], ['R1C4', 'R2C4'], ['R1C7', 'R2C7'],
  ['R4C1', 'R5C1'], ['R4C4', 'R5C4'], ['R4C7', 'R5C7'],
  ['R7C1', 'R8C1'], ['R7C4', 'R8C4'], ['R7C7', 'R8C7'],
].map(cells => new Renban(...cells));

const arrows = [
  ['R3C6', 'R2C6', 'R2C5'],
  ['R3C9', 'R2C9', 'R2C8'],
  ['R6C3', 'R5C3', 'R5C2'],
  ['R6C9', 'R5C9', 'R5C8'],
  ['R9C3', 'R8C3', 'R8C2'],
  ['R9C6', 'R8C6', 'R8C5'],
].map(cells => new Arrow(...cells));

// Each diagonal's start cell + direction, read from the outside badge's
// position and pointing direction (extrapolating the badge one step further
// along the diagonal lands just outside the grid, at the badge); the ray is
// walked to the grid edge, matching the drawn extent.
const outsideDiagonals = [
  [19, 'R3C1', 1, 1],
  [26, 'R1C4', 1, -1],
  [8, 'R9C7', -1, 1],
  [62, 'R8C9', -1, -1],
].map(([total, start, dr, dc]) =>
  LittleKiller.fromCells(total, graph.ray(start, dr, dc), geometry));

return [
  new Shape('9x9'),
  ...thermos,
  ...purpleDominoes,
  ...arrows,
  ...outsideDiagonals,
  new X('R9C6', 'R9C7'),
];
