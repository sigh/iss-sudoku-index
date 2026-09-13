// Title: High Bars
// Author: Jobo
// Video: https://www.youtube.com/watch?v=B4ltpadYaMI
// Source: https://sudokupad.app/eoucbc58v9

// Normal sudoku rules apply (standard rows/cols/boxes; boxes match the
// payload's drawn regions, so the default Shape('9x9') needs no overrides).
//
// "Digits on a line can never be lower than the length of the line": each
// line below only restricts the candidates of its own cells to
// [line length, 9] -- it is not a relation between the cells, so it is
// encoded as one multi-value Given (a candidate restriction) per cell.
//
// "Digits separated by a white dot must be consecutive. Not all dots are
// given.": only the two drawn dots are constrained; the "not all given"
// clause means no StrictKropki-style negative applies to the rest of the
// grid.

// Each line is a straight run of cells along a fixed row+col diagonal, as
// drawn on the board. Cells not listed on any line carry no minimum.
const barLines = [
  ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'], // length 8
  ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],         // length 7
  ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'],                 // length 6
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],                         // length 5
  ['R1C9', 'R2C8', 'R3C7', 'R4C6'],                                 // length 4
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],                                 // length 4
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],                                 // length 4
  ['R7C9', 'R8C8', 'R9C7'],                                         // length 3
  ['R5C5', 'R6C4', 'R7C3', 'R8C2'],                                 // length 4
  ['R2C2', 'R3C1'],                                                 // length 2
];

const barMinimums = barLines.flatMap(cells => {
  const minValue = cells.length;
  const allowedValues = [];
  for (let v = minValue; v <= 9; v++) allowedValues.push(v);
  return cells.map(cell => new Given(cell, ...allowedValues));
});

// White (Kropki) dots: consecutive digits on the two drawn edges only
// (drawn as white-filled, black-bordered edge marks).
const whiteDots = [
  new WhiteDot('R9C8', 'R9C9'),
  new WhiteDot('R1C1', 'R1C2'),
];

return [
  new Shape('9x9'),
  ...barMinimums,
  ...whiteDots,
];
