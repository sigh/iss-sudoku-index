// Title: Old Fashioned TV Antenna
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=XeBqQ5-TLYs
// Source: https://app.crackingthecryptic.com/sudoku/NGbgngNgnd

// Standard 9x9 sudoku: 1-9 in every row, column and 3x3 box (the default
// box tiling for a plain 9x9 Shape matches the drawn regions). Two killer
// cages: digits sum to the value in the cage's
// top-left cell and cannot repeat within the cage. Eight arrows share one
// circle at the centre cell R5C5 (drawn as a single circular underlay,
// with all eight arrow shafts departing from it): each arrow's 3-cell
// shaft sums to the digit in R5C5. Four outside clues give the sum of the
// digits along a short diagonal from the labelled edge cell to the
// opposite corner it reaches before leaving the grid (4 cells each);
// repeats are allowed there per the rules, and every one of these
// diagonals crosses a different row, column and box at each step, so
// nothing else forces uniqueness on it either.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// Cage cells transcribed from the drawn cages (cell order as drawn; first
// cell is the cage's top-left, carrying the printed total).
const cages = [
  [13, 'R8C9', 'R9C9', 'R9C8'],
  [18, 'R1C2', 'R1C1', 'R2C1'],
];

// Arrow shafts transcribed from the drawn arrow paths (waypoints snapped
// to cell centres): bulb cell R5C5 first, then the 3 arm cells.
const arrows = [
  ['R5C5', 'R4C5', 'R3C4', 'R2C3'],
  ['R5C5', 'R4C5', 'R3C6', 'R2C7'],
  ['R5C5', 'R5C6', 'R4C7', 'R3C8'],
  ['R5C5', 'R5C6', 'R6C7', 'R7C8'],
  ['R5C5', 'R6C5', 'R7C6', 'R8C7'],
  ['R5C5', 'R6C5', 'R7C4', 'R8C3'],
  ['R5C5', 'R5C4', 'R6C3', 'R7C2'],
  ['R5C5', 'R5C4', 'R4C3', 'R3C2'],
];

// Little-Killer diagonals: entry cell (as resolved from each off-grid
// arrow's drawn direction, paired with its nearest outside-clue text by
// on-canvas distance) plus (dRow, dCol) and the printed sum.
const littleKillers = [
  ['R1C4', 1, -1, 11],
  ['R4C9', -1, -1, 30],
  ['R9C6', -1, 1, 25],
  ['R6C1', 1, 1, 27],
];

return [
  shape,
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map((cells) => new Arrow(...cells)),
  ...littleKillers.map(([cell, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dRow, dCol), geometry)),
];
