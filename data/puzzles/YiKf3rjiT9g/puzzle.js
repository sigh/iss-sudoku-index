// Title: They check in, but they don't check out
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=YiKf3rjiT9g
// Source: https://sudokupad.app/ffb4d4oce5

// Normal sudoku rules (default row/column/box all-different from Shape).
// No given digits.
//
// Killer Cages: distinct digits summing to the corner total -> Cage.
// Cage cell lists are transcribed from the source payload's `killercage`
// array (corner total is that array's `value`).
//
// Clones: two same-colored 2x2 blocks hold the same digit in each matching
// relative position. Transcribed from the source payload's per-cell shading
// (#FFFFB0 yellow, #D0D0FF purple). Built as one SameValues(2, a, b) per
// matching cell pair (each side a size-1 set, so it pins that single cell
// pair equal), not one SameValues over a whole block, because the rule
// requires each position to match, not just the block's multiset of digits.
//
// Numbered Rooms: outside clue, N = digit in the first cell of the reading,
// clue value = digit in the Nth cell of that same reading -> NumberedRoom.
// Clue cell/direction pairs are transcribed from the source payload's `text`
// array, whose off-grid coordinates (R0/R10/C0/C10) fix each clue's row or
// column and reading direction.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  [15, 'R8C9', 'R9C8', 'R9C9'],
  [11, 'R1C1', 'R1C2', 'R2C1'],
  [14, 'R8C1', 'R9C1', 'R9C2'],
  [11, 'R1C8', 'R1C9', 'R2C9'],
  [11, 'R6C6', 'R6C7', 'R7C6'],
  [16, 'R3C4', 'R4C3', 'R4C4'],
  [14, 'R5C4', 'R6C4', 'R6C5'],
  [14, 'R4C5', 'R4C6', 'R5C6'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

const clonePairs = [
  // Yellow (#FFFFB0): top-left block clones bottom-right block.
  [['R2C2', 'R2C3', 'R3C2', 'R3C3'], ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  // Purple (#D0D0FF): top-right block clones bottom-left block.
  [['R2C7', 'R2C8', 'R3C7', 'R3C8'], ['R7C2', 'R7C3', 'R8C2', 'R8C3']],
];
const clones = clonePairs.flatMap(([blockA, blockB]) =>
  blockA.map((cellA, i) => new SameValues(2, cellA, blockB[i])));

const numberedRooms = [
  // [value, ray start, dRow, dCol]
  [4, 'R3C1', 0, 1],   // row 3, left -> right
  [3, 'R3C9', 0, -1],  // row 3, right -> left
  [3, 'R7C1', 0, 1],   // row 7, left -> right
  [4, 'R7C9', 0, -1],  // row 7, right -> left
  [4, 'R1C3', 1, 0],   // column 3, top -> bottom
  [5, 'R9C3', -1, 0],  // column 3, bottom -> top
  [5, 'R1C7', 1, 0],   // column 7, top -> bottom
  [4, 'R9C7', -1, 0],  // column 7, bottom -> top
].map(([value, start, dRow, dCol]) =>
  NumberedRoom.fromCells(value, graph.ray(start, dRow, dCol), geometry));

return [
  new Shape('9x9'),
  ...cages,
  ...clones,
  ...numberedRooms,
];
