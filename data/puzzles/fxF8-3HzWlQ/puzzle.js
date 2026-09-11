// Title: City Planning
// Author: Jane Street
// Video: https://www.youtube.com/watch?v=fxF8-3HzWlQ
// Source: https://sudokupad.app/T4JQMn2TN3

// Rules encoded here, in full:
//   Place eight of each of four city features -- red umbrellas, green trees,
//   blue fountains and purple boulders -- onto an 8x8 grid of city blocks, so
//   that each feature appears exactly once in each row and once in each column
//   of blocks. Features cannot be along a diagonal with themselves, nor on a
//   building. Nothing else is placed: a block either holds one feature or is
//   left empty.
// Nothing is omitted.
//
// The board is not a sudoku -- most blocks hold no feature at all, so a row is
// not a permutation of eight distinct symbols. Hence the Raw grid type, which
// carries no implicit row/column/box rules; every rule below is stated.
// A cell's value names what stands on that block: 1-4 are the features, in the
// colour key the puzzle is published with, and 5 means the block is bare.

const RED_UMBRELLA = 1;
const GREEN_TREE = 2;
const BLUE_FOUNTAIN = 3;
const PURPLE_BOULDER = 4;
const EMPTY = 5;

const shape = new Shape('8x8', '1-5', 'Raw');
const graph = cellGraph(shape);

// One of each feature per row and per column. Eight blocks in a line, four of
// them features, so the other four are bare -- which makes the multiset exact.
const LINE_CONTENTS = [
  RED_UMBRELLA, GREEN_TREE, BLUE_FOUNTAIN, PURPLE_BOULDER,
  EMPTY, EMPTY, EMPTY, EMPTY,
].join('_');
const lines = [...graph.rows(), ...graph.columns()].map(
  cells => new ContainExact(LINE_CONTENTS, ...cells));

// The sixteen blocks drawn as solid grey (#CFCFCF) squares are the buildings;
// no feature may stand on one.
const buildings = [
  'R1C1', 'R1C2', 'R1C8',
  'R2C8',
  'R3C6',
  'R4C6',
  'R5C2', 'R5C3', 'R5C6',
  'R6C6', 'R6C8',
  'R7C1', 'R7C8',
  'R8C1', 'R8C4', 'R8C5',
].map(cell => new Given(cell, EMPTY));

// The three features already standing on the board, drawn as coloured discs.
const placedFeatures = [
  new Given('R3C1', RED_UMBRELLA),
  new Given('R4C7', GREEN_TREE),
  new Given('R7C5', BLUE_FOUNTAIN),
];

// "Features cannot be along a diagonal with themselves": no two blocks of one
// diagonal hold the same feature, however far apart along it they are. A bare
// block is not a feature, so 5 is free to repeat.
const sameFeatureTwice = PairX.fnToKey((a, b) => a === EMPTY || a !== b, shape);
const topRow = graph.row(1);
const leftEdge = graph.column(topRow[0]).slice(1);
const rightEdge = graph.column(topRow[topRow.length - 1]).slice(1);
const diagonals = [
  ...[...topRow, ...leftEdge].map(cell => graph.ray(cell, 1, 1)),
  ...[...topRow, ...rightEdge].map(cell => graph.ray(cell, 1, -1)),
].filter(cells => cells.length > 1).map(
  cells => new PairX(sameFeatureTwice, 'same feature', ...cells));

return [
  shape,
  ...lines,
  ...buildings,
  ...placedFeatures,
  ...diagonals,
];
