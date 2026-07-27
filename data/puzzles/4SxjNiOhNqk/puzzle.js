// Title: Sator Square
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=4SxjNiOhNqk
// Source: https://sudokupad.app/th3wjsiv41

// Normal sudoku rules apply (standard rows, columns, and 3x3 boxes -- the
// puzzle's own region list matches the default boxes).
//
// Magic Squares: the two red-outlined 3x3 blocks are magic squares -- every
// row, column, and both main diagonals of the block sum to the same total,
// and digits in the block cannot repeat. Neither block is a sudoku box
// (each spans three different boxes), so neither fact is implied by the
// baseline rules and both are encoded explicitly below.
//
// Dutch Whisper Lines: adjacent cells joined by an orange line must differ
// by at least 4.
//
// Fog (drawn over most of the grid) is solving UI only -- it reveals cells
// as they are placed and has no effect on the finished grid, so it is not
// encoded.

const given = new Given('R9C2', 4);

// Magic square cells, transcribed from the two red-outlined 3x3 cages in
// the drawn puzzle, row-major within each 3x3 block.
const magicSquareCells = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];

// For a row-major 3x3 block, build its 3 rows, 3 columns, and 2 main
// diagonals as EqualSum segments, and pair that with the block's
// all-different-9 requirement.
function magicSquareConstraints(cells) {
  const rows = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
  const cols = [0, 1, 2].map(c => [cells[c], cells[c + 3], cells[c + 6]]);
  const diagonals = [
    [cells[0], cells[4], cells[8]],
    [cells[2], cells[4], cells[6]],
  ];
  return [
    new AllDifferent(...cells),
    new EqualSum(...rows, ...cols, ...diagonals),
  ];
}

const magicSquares = magicSquareCells.flatMap(magicSquareConstraints);

// Dutch whisper line paths, transcribed from the drawn orange lines'
// waypoints into their covered cell runs.
const whisperLinePaths = [
  ['R4C3', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R7C6'],
  ['R6C7', 'R5C7', 'R4C8', 'R3C9', 'R2C9', 'R2C8', 'R1C8', 'R1C7', 'R2C6', 'R3C5', 'R3C4'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R8C7', 'R8C8', 'R7C8'],
  ['R6C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R2C4', 'R1C4', 'R1C5', 'R1C6'],
  ['R4C2', 'R5C1', 'R5C2'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R9C6', 'R9C5', 'R9C4'],
];

const whispers = whisperLinePaths.map(cells => new Whisper(4, ...cells));

return [
  new Shape('9x9'),
  given,
  ...magicSquares,
  ...whispers,
];
