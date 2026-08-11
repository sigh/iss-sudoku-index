// Title: Regional Arrows
// Author: YARR
// Video: https://www.youtube.com/watch?v=N2kuqhmxhnU
// Source: https://app.crackingthecryptic.com/sudoku/FFgDG29LgR

// Rules: 1-9 once each in every row, column and marked region (no default
// boxes -- the nine marked regions replace them). Digits in a killer cage do
// not repeat and sum to the printed total. Digits along an arrow sum to the
// digit in its attached circle. A clue outside the grid gives the sum of the
// diagonal ray it points along, and that diagonal's digits may repeat.
//
// Regions transcribed from the puzzle's drawn region outlines (nine groups
// of nine cells each, replacing the default boxes).
// Cages transcribed from the drawn killer-cage outlines (four-cell cages).
// Each cage happens to sit entirely inside one marked region, so a cage's own
// all-different is redundant with that region's -- Cage is used regardless
// because the rules state the cage no-repeat clause outright.
// Arrow bulbs are the six drawn circles; each arrow's shaft cells are read
// by walking its drawn line from the bulb outward. The R4C5 circle forks
// into two arrows -- one arm right along R4C6-R4C8, one arm diagonally
// down-left to R5C4, then right to R5C5, then down to R6C5 -- so it yields
// two separate Arrow constraints sharing that bulb cell.
// The two outside clues are drawn as short off-grid arrow stubs ending on a
// grid-boundary corner, continuing diagonally into the grid per the rules'
// "indicated diagonal" sentence; LittleKiller.fromCells derives each clue's
// canonical corner from its actual ray of cells (its own on-grid corner does
// not always match the drawn badge's edge).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const shapeName = graph.gridGeometry().name;

const givens = [
  ['R2C6', 2], ['R3C9', 9], ['R7C2', 9], ['R8C6', 9], ['R9C7', 9],
];

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R1C4', 'R4C1'],
  ['R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C2', 'R3C3', 'R2C3', 'R7C2'],
  ['R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R7C1', 'R6C1', 'R9C4'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C5', 'R3C6', 'R1C5', 'R3C7', 'R4C6', 'R4C7'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R3C4', 'R7C6'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C5', 'R6C4', 'R6C3', 'R7C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R1C6', 'R4C9'],
  ['R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R3C8', 'R7C7', 'R8C7'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9', 'R9C6', 'R6C9'],
];

const cages = [
  { cells: ['R1C8', 'R1C9', 'R2C9', 'R2C8'], total: 20 },
  { cells: ['R3C6', 'R3C7', 'R4C7', 'R4C6'], total: 13 },
  { cells: ['R1C1', 'R1C2', 'R2C2', 'R2C1'], total: 17 },
  { cells: ['R8C1', 'R8C2', 'R9C2', 'R9C1'], total: 20 },
  { cells: ['R8C8', 'R8C9', 'R9C9', 'R9C8'], total: 26 },
];

// [bulb, ...shaft cells] per arrow arm.
const arrows = [
  ['R1C7', 'R1C6', 'R2C6'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R4C5', 'R5C4', 'R5C5', 'R6C5'],
  ['R7C4', 'R7C3', 'R6C3'],
  ['R9C2', 'R8C2', 'R8C1'],
  ['R8C5', 'R8C4', 'R8C3'],
];

// { start cell, (dRow, dCol) direction, printed total } per outside clue.
const outsideDiagonals = [
  { start: 'R1C5', dir: [1, 1], total: 16 },
  { start: 'R5C1', dir: [1, 1], total: 9 },
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw(shapeName, ...cells)),
  ...cages.map(({ cells, total }) => new Cage(total, ...cells)),
  ...arrows.map(([bulb, ...shaft]) => new Arrow(bulb, ...shaft)),
  ...outsideDiagonals.map(({ start, dir, total }) =>
    LittleKiller.fromCells(total, graph.ray(start, ...dir), geometry)),
];
