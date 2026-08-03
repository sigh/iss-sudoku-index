// Title: Stumped
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=OU4MGJ50Mb8
// Source: https://app.crackingthecryptic.com/sudoku/7bBDd6q2J8

// Normal sudoku, no givens. Six thermometers increase from bulb to end.
// An outside clue on the diagonal from R1C9 to R9C1 gives that diagonal's
// digit sum. The blue line's digits sum to an unknown, shared N within each
// box it passes through; the centre box's two separate stretches of the
// line each sum to N on their own.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  ['R2C3', 'R3C3', 'R4C3', 'R5C3'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R5C7', 'R6C7', 'R7C7', 'R8C7'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
];

// Blue line, drawn as two overlapping stroke entries in the source (one
// long path plus a short R3C6-R3C7 connector) because the path passes
// close by itself near R3C7 on its way back to R3C6. The connector adds no
// cell not already in the long path, so the cell set and box-segmentation
// below are the same with or without it; only the long path is needed.
// Path order: R2C8 (a one-cell spur off R3C7), then around through every
// other box back to R3C6.
const blueLine = [
  'R2C8', 'R3C7', 'R4C7', 'R5C6', 'R6C5', 'R7C4',
  'R8C3', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6',
];

return [
  ...thermos.map(cells => new Thermo(...cells)),
  LittleKiller.fromCells(40, graph.ray('R1C9', 1, -1), geometry),
  new RegionSumLine(...blueLine),
];
