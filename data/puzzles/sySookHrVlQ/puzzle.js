// Title: Quantum-safe Sudoku
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=sySookHrVlQ
// Source: https://app.crackingthecryptic.com/sudoku/pntP7GhPHF

// Rules: normal sudoku. A black dot joins digits in a 1:2 ratio, a white dot
// joins consecutive digits; not all dots are given (no negative constraint).
// The 28 single-cell cages are "Schrodinger cells": each contains one of two
// values, and after every regular (uncaged) cell is filled, every Schrodinger
// cell must remain unresolved -- both of its values must allow a valid sudoku
// solution.
//
// Encoded: the regular cells' digits, the dots, and "every Schrodinger cell
// remains unresolved": for each Schrodinger cell at least two digits each
// complete a valid grid over the regular cells.
// Omitted: the exact count in "contain one of 2 values" -- that no THIRD digit
// in a Schrodinger cell completes a valid grid. That clause quantifies over
// every completion at once and has no encoding as a constraint on one grid.
//
// Model: the main grid holds one valid completion of the regular cells. Each
// Schrodinger cell also gets a witness layer of 28 cells, one per Schrodinger
// cell, which together with the grid's regular cells forms another valid
// completion, differing from the grid at the cell it witnesses. A Schrodinger
// cell's two values are its grid digit and its own layer's digit.

const shape = new Shape('9x9');

// The 28 single-cell cages, from the drawn cage outlines.
const SCHRODINGER = [
  'R1C3', 'R1C5', 'R1C7', 'R1C9',
  'R2C1', 'R2C2', 'R2C5', 'R2C9',
  'R3C3', 'R3C7',
  'R4C1', 'R4C2', 'R4C5', 'R4C7', 'R4C9',
  'R5C5', 'R5C6', 'R5C7', 'R5C9',
  'R6C3', 'R6C6', 'R6C8', 'R6C9',
  'R7C3', 'R7C9',
  'R9C1', 'R9C2', 'R9C8',
];
// The 8 edge dots, from the drawn overlays (white fill / black fill).
const WHITE_DOTS = [
  ['R1C1', 'R2C1'], ['R2C2', 'R2C3'], ['R3C6', 'R4C6'],
  ['R5C3', 'R5C4'], ['R7C1', 'R7C2'], ['R9C3', 'R9C4'],
];
const BLACK_DOTS = [['R5C6', 'R6C6'], ['R9C1', 'R9C2']];

const graph = cellGraph(shape);
const isSchrodinger = new Set(SCHRODINGER);
const slot = new Map(SCHRODINGER.map((cell, i) => [cell, i + 1]));

// The grid is one valid completion: sudoku plus the dots.
const gridDots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, shape);
const lessKey = Pair.fnToKey((a, b) => a < b, shape);

// One witness layer per Schrodinger cell, named after the cell it witnesses
// with rows and columns as letters A-I: R2C1 -> 'BA', cells VBA1..VBA28.
const letter = (n) => String.fromCharCode(64 + n);
const layers = SCHRODINGER.map((cell) => {
  const { row, col } = parseCellId(cell);
  return new Var(letter(row) + letter(col), `witness for ${cell}`,
    SCHRODINGER.length);
});

// In a layer, a regular cell is read from the grid and a Schrodinger cell
// from the layer's own slot for it.
const inLayer = (layer, cell) =>
  isSchrodinger.has(cell) ? layer.cell(slot.get(cell)) : cell;

// Houses containing a Schrodinger cell; the others are already all-different
// in the grid and are unchanged in every layer.
const mixedHouses = graph.rowsColumnsBoxes()
  .filter((house) => house.some((cell) => isSchrodinger.has(cell)));
const layerWhiteDots = WHITE_DOTS.filter((d) => d.some((c) => isSchrodinger.has(c)));
const layerBlackDots = BLACK_DOTS.filter((d) => d.some((c) => isSchrodinger.has(c)));

const witnesses = layers.flatMap((layer, i) => [
  ...mixedHouses.map((house) =>
    new AllDifferent(...house.map((cell) => inLayer(layer, cell)))),
  ...layerWhiteDots.map(([a, b]) =>
    new Pair(consecutiveKey, 'white dot', inLayer(layer, a), inLayer(layer, b))),
  ...layerBlackDots.map(([a, b]) =>
    new Pair(ratioKey, 'black dot', inLayer(layer, a), inLayer(layer, b))),
  // The witnessed cell differs from the grid.
  new AllDifferent(SCHRODINGER[i], layer.cell(i + 1)),
]);

// Which of a Schrodinger cell's completions sits in the grid is an artifact of
// this model, not a rule: pin the grid to hold the smaller of R1C3's two values.
const pin = new Pair(lessKey, 'grid holds the smaller value at R1C3',
  SCHRODINGER[0], layers[0].cell(1));

return [shape, ...gridDots, ...layers, ...witnesses, pin];
