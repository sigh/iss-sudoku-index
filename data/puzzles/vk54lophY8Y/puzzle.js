// Title: Balancing in the Rain
// Author: The Autistic Kantian
// Video: https://www.youtube.com/watch?v=vk54lophY8Y
// Source: https://sudokupad.app/ozb5p2foeb

// Normal sudoku, no givens. Grey circles are odd digits. Black dots are a
// 1:2 ratio pair (Kropki black dot). Each equal-sum line is split at every
// 3x3 box border it crosses (a re-entered box gets a fresh segment); every
// resulting segment on that line has the same sum, independently per line.
//
// The payload draws two separate line entries (both stroke colour #FF0400)
// sharing an endpoint at R4C6, continuing in the same direction across it
// (R3C7->R4C6 and R4C6->R5C5 are both a (+1,-1) step, no kink at the join):
// read as one continuous drawn line below, not two.

const oddCells = ['R4C6', 'R6C4', 'R8C5', 'R2C5', 'R5C9', 'R9C1'];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

const blackDots = [
  ['R4C5', 'R5C5'],
  ['R1C4', 'R2C4'],
  ['R3C6', 'R3C7'],
  ['R9C6', 'R8C6'],
  ['R6C5', 'R7C5'],
  ['R5C4', 'R5C3'],
].map(cells => new BlackDot(...cells));

const regionSumLines = [
  ['R6C5', 'R5C5', 'R4C5', 'R3C4'],
  ['R5C4', 'R5C5', 'R5C6', 'R4C7'],
  ['R2C7', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C3'],
  ['R3C3', 'R4C2'],
  ['R8C6', 'R7C7', 'R6C8'],
  ['R6C9', 'R6C8', 'R6C7', 'R7C6', 'R8C6', 'R9C6'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R3C4', 'R2C4', 'R1C4'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
].map(cells => new RegionSumLine(...cells));

return [
  new Shape('9x9'),
  ...oddGivens,
  ...blackDots,
  ...regionSumLines,
];
