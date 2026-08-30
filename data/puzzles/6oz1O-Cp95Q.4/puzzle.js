// Title: May 21, 2022: Sudokurve
// Author: clover!
// Video: https://www.youtube.com/watch?v=6oz1O-Cp95Q
// Source: https://tinyurl.com/yyokubfp

// Rules: Fill the grid with the digits 1 through 9 exactly once in each 3x3
// region. Also, each digit appears exactly once in each 9-cell "row" and
// "column" indicated by the green lines outside the regions.
//
// The board holds only 54 cells: six detached 3x3 regions on a 12x12 frame
// -- A (R1-3C1-3), W (R4-6C4-6), X (R4-6C7-9), Y (R7-9C4-6), Z (R7-9C7-9),
// C (R10-12C10-12). W/X/Y/Z tile one contiguous 6x6 block; A and C are each
// diagonally offset from that block by one region's width, joined to it only
// by drawn connector strokes.
//
// Twelve curves of nine cells each are drawn (four families of three), and
// every playable cell lies on exactly two of them: region A and region W's
// cells each carry one H curve and one V curve; region Y's cells carry one H
// and one H2; region X's carry one V and one V2; region Z and region C's
// cells each carry one H2 and one V2, per the curve tables below.
//
// 54 cells is not an ISS grid shape, so the puzzle is re-coordinatised onto a
// 6x9 Raw grid: one row per region (in the order A, W, X, Y, Z, C below), and
// the nine columns are the region's own cells in row-major (top-left to
// bottom-right) order. Raw carries no implicit row/column/box rules, so every
// rule is stated explicitly: one AllDifferent per region (the 6x9 rows) and
// one AllDifferent per curve (12 more, built from the tables below).

// Source geometry, transcribed from the six drawn 3x3 regions (row-major
// order fixes each region's column index in the 6x9 grid).
const REGIONS = {
  A: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  W: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  X: ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  Y: ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  Z: ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  C: ['R10C10', 'R10C11', 'R10C12', 'R11C10', 'R11C11', 'R11C12',
      'R12C10', 'R12C11', 'R12C12'],
};
const REGION_ORDER = ['A', 'W', 'X', 'Y', 'Z', 'C'];

// The twelve curves, in frame coordinates, traced along the connector
// strokes drawn between the islands.
const CURVES = [
  // H: region A's rows, into region W's columns, straight down into Y.
  ['R1C1', 'R1C2', 'R1C3', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R2C1', 'R2C2', 'R2C3', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  // V: region A's columns, into region W's rows, straight across into X.
  ['R1C1', 'R2C1', 'R3C1', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R1C2', 'R2C2', 'R3C2', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  // H2: region Y's rows, into region Z's rows, into region C's columns.
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R10C12', 'R11C12', 'R12C12'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R10C11', 'R11C11', 'R12C11'],
  ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R10C10', 'R11C10', 'R12C10'],
  // V2: region X's columns, into region Z's columns, into region C's rows.
  ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7', 'R12C10', 'R12C11', 'R12C12'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R11C10', 'R11C11', 'R11C12'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R10C10', 'R10C11', 'R10C12'],
];

// Givens, transcribed from the frame.
const GIVENS = {
  R1C1: 1, R1C2: 2, R1C3: 3, R2C1: 7, R3C1: 8,
  R4C4: 5, R4C8: 6, R4C9: 7, R5C4: 4, R6C7: 5,
  R7C6: 4, R8C9: 1, R9C4: 3, R9C5: 2, R9C9: 8,
  R10C12: 3, R11C12: 8, R12C10: 1, R12C11: 4, R12C12: 9,
};

// The re-coordinatisation: a cell's region gives its 6x9 row; its row-major
// position within that region gives its column.
const regionOf = (cell) => REGION_ORDER.find(r => REGIONS[r].includes(cell));
const issCell = (cell) => {
  const region = regionOf(cell);
  return makeCellId(1 + REGION_ORDER.indexOf(region),
                     1 + REGIONS[region].indexOf(cell));
};

const regionGroups = REGION_ORDER.map(
  r => new AllDifferent(...REGIONS[r].map(issCell)));
const curveGroups = CURVES.map(
  curve => new AllDifferent(...curve.map(issCell)));

return [
  new Shape('6x9', 9, 'Raw'),
  ...Object.entries(GIVENS).map(([cell, v]) => new Given(issCell(cell), v)),
  ...regionGroups,
  ...curveGroups,
];
