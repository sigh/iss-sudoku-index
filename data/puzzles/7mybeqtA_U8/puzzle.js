// Title: Splitski 2
// Author: WEBthe3rd
// Video: https://www.youtube.com/watch?v=7mybeqtA_U8
// Source: https://sudokupad.app/8oftyu592v

// Normal sudoku rules apply. Two families of "Kropki Split Lines": each drawn
// line is broken into fixed segments by small dots at some of its cell joins
// (a dot's position, not a solver-discovered partition -- see the cell tables
// below). Digits may repeat on a line but not within one segment, so each
// segment gets AllDifferent. Light-blue lines are split by black-filled dots:
// each pair of neighbouring segments has one segment's sum equal to twice
// the other's (order not fixed). Light-pink/red lines are split by
// white-filled dots: each pair of neighbouring segments has sums that are
// consecutive integers (order not fixed). Only immediately neighbouring
// segments are related, matching the single-dot-between-two-segments
// reading of the drawn marks.

// Light-blue lines, black dots, 1:2 ratio between neighbouring segments.
// Cell lists and segment breaks (each inner array is one segment) are taken
// from the drawn line paths and the dot positions along them.
const ratioLines = [
  [['R3C1'], ['R2C1', 'R1C1'], ['R1C2'], ['R1C3']],
  [['R6C3', 'R5C3'], ['R4C3', 'R3C3', 'R3C4'], ['R3C5', 'R3C6', 'R4C6'],
    ['R5C6', 'R6C6', 'R6C5'], ['R7C5', 'R7C4'], ['R7C3']],
  [['R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3'], ['R2C2', 'R3C2'], ['R4C2', 'R5C2']],
  [['R5C7', 'R5C8', 'R5C9'], ['R6C9', 'R7C9']],
  [['R8C5', 'R9C5', 'R9C6'], ['R9C7']],
];

// Light-pink/red lines, white dots, consecutive sums between neighbouring
// segments. Cell lists and segment breaks taken from the drawn line paths
// and the dot positions along them, same convention as above.
const consecutiveLines = [
  [['R1C3'], ['R1C4', 'R2C4'], ['R3C4', 'R4C4', 'R4C3'], ['R4C2', 'R4C1'], ['R3C1']],
  [['R6C3'], ['R6C4', 'R6C5'], ['R5C5'], ['R5C6', 'R5C7'], ['R4C7', 'R3C7']],
  [['R5C2', 'R6C2'], ['R7C2', 'R7C3']],
  [['R8C5'], ['R7C5'], ['R7C6', 'R7C7', 'R6C7']],
  [['R9C7', 'R9C8'], ['R9C9', 'R8C9']],
];

// Segment sums are never materialized as their own cells: comparing two
// cell-group totals is one linear equation over the grid's own 1-9 cells via
// `Sum`'s [cell, coeff] pairs, so no auxiliary Var or widened Shape is needed.
const withCoeff = (cells, coeff) => cells.map(cell => [cell, coeff]);

// sum(segA) and sum(segB) differ by exactly 1, either could be larger.
const consecutiveRelation = (segA, segB) => new Or([
  new Sum(1, ...segA, ...withCoeff(segB, -1)),
  new Sum(1, ...segB, ...withCoeff(segA, -1)),
]);

// sum(segA) and sum(segB) are in a 1:2 ratio, either could be the double.
const ratioRelation = (segA, segB) => new Or([
  new Sum(0, ...segA, ...withCoeff(segB, -2)),
  new Sum(0, ...segB, ...withCoeff(segA, -2)),
]);

const segmentConstraints = (lines, relation) => lines.flatMap(segments => [
  ...segments.filter(seg => seg.length > 1).map(seg => new AllDifferent(...seg)),
  ...segments.slice(1).map((seg, i) => relation(segments[i], seg)),
]);

return [
  new Shape('9x9'),
  ...segmentConstraints(ratioLines, ratioRelation),
  ...segmentConstraints(consecutiveLines, consecutiveRelation),
];
