// Title: Post Office Panic
// Author: tesseralis
// Video: https://www.youtube.com/watch?v=Nc6MUzYeBN8
// Source: https://app.crackingthecryptic.com/sudoku/7Bm24jbQjm

// Normal sudoku on the 9x9 grid. Source cells R2C2-R10C10 are this script's
// R1C1-R9C9 throughout (subtract 1 from each source coordinate). No digit is
// given directly anywhere in the grid: every given in the payload is a
// letter A-I sitting outside the frame.
//
// "Each letter represents a different digit": one letter Var per A-I plus
// AllDifferent over them ties every occurrence of a letter to the same
// unknown digit and forces the 9 letters onto the 9 digits 1-9.
//
// "Cells separated by an X must contain digits summing to 10": one drawn X
// overlay, between source R5C6 and R5C7 (script R4C5/R4C6).
//
// "Clues outside the grid indicate the digit which has to be placed in the
// Nth cell in the corresponding direction, where N is the digit placed in
// the first cell in that direction" is exactly ISS's NumberedRoom, except
// every printed clue here is a letter, i.e. a Var, not a literal. Since
// NumberedRoom takes a literal value, each clue is built as an Or over the
// 9 candidate digits k: (letter Var == k) AND NumberedRoom(k, line). Lines
// are listed clue-side cell first per NumberedRoom.fromCells's directional
// convention. The off-grid letters immediately right of the grid (source
// C12, values A..I in row order) are a pre-printed row legend for the grey
// "record your discoveries" table (source C12-C13), not a clue -- they are
// omitted as decoration.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const letters = new Var('L', 'letter-to-digit assignment, A..I in order', 9);
const letterCell = ch => letters.cell(LETTERS.indexOf(ch) + 1);

// Outside clues, transcribed from the drawn letter givens that fall outside
// the R2C2-R10C10 frame. Columns/rows below are this script's 1-9 indices
// (source index minus 1).

// Top clues (source R1): read downward from script row 1.
const TOP_CLUES = { 1: 'D', 2: 'A', 3: 'A', 5: 'E', 7: 'B', 8: 'A', 9: 'D' };
// Bottom clues (source R11): read upward from script row 9.
const BOTTOM_CLUES = { 2: 'C', 3: 'G', 4: 'A', 5: 'E', 6: 'A', 9: 'I' };
// Left clues (source C1): read rightward from script column 1.
const LEFT_CLUES = {
  1: 'A', 2: 'A', 3: 'B', 4: 'C', 5: 'D', 6: 'E', 7: 'F', 8: 'G', 9: 'H',
};
// Right clues (source C11): read leftward from script column 9.
const RIGHT_CLUES = {
  2: 'A', 3: 'B', 4: 'C', 5: 'D', 6: 'E', 7: 'F', 8: 'G',
};

const numberedRoomClues = [
  ...Object.entries(TOP_CLUES).map(([col, letter]) => ({
    letter, line: graph.ray(makeCellId(1, +col), 1, 0),
  })),
  ...Object.entries(BOTTOM_CLUES).map(([col, letter]) => ({
    letter, line: graph.ray(makeCellId(9, +col), -1, 0),
  })),
  ...Object.entries(LEFT_CLUES).map(([row, letter]) => ({
    letter, line: graph.ray(makeCellId(+row, 1), 0, 1),
  })),
  ...Object.entries(RIGHT_CLUES).map(([row, letter]) => ({
    letter, line: graph.ray(makeCellId(+row, 9), 0, -1),
  })),
];

const numberedRoomConstraints = numberedRoomClues.map(({ letter, line }) =>
  new Or(DIGITS.map(k => new And([
    new Given(letterCell(letter), k),
    NumberedRoom.fromCells(k, line, geometry),
  ])))
);

return [
  new Shape('9x9'),
  letters,
  new AllDifferent(...LETTERS.map(letterCell)),
  ...numberedRoomConstraints,
  new X('R4C5', 'R4C6'),
];
