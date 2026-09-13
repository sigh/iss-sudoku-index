// Title: Ascents Traversed Evenly
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=UNqWl3TNa7c
// Source: https://sudokupad.app/fghtxbkux0

// Normal sudoku rules apply (default 3x3 boxes). Digits along each line sum
// to the same total as the digits in the two circles at its ends. Digits in
// cells with grey squares are even.
//
// The rules-drawn polylines are chains of circles joined by uncircled
// connecting cells, with a circle at every bend. A circle marks the end of
// one double-arrow clue and the start of the next (the same way an arrow
// bulb splits a shaft into arms): reading a whole multi-circle chain as one
// sum would force every connecting cell to equal 0, which is impossible, so
// each chain is encoded as the run of two-circle DoubleArrow clues between
// consecutive circles. DoubleArrow(...cells) takes the two circled ends
// first/last and any connecting cells between them, and requires the sum of
// the connecting cells to equal the sum of the two end cells.

const doubleArrows = [
  ['R4C1', 'R3C2', 'R2C3'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R4C5', 'R3C6', 'R2C7'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R2C9', 'R3C8', 'R4C7'],
  ['R6C1', 'R5C2', 'R4C3'],
  ['R6C7', 'R5C8', 'R4C9'],
  ['R6C9', 'R7C8', 'R8C7'],
  ['R8C7', 'R7C6', 'R6C5'],
  ['R6C5', 'R7C4', 'R8C3'],
  ['R8C3', 'R8C2', 'R8C1'],
  ['R8C1', 'R7C2', 'R6C3'],
  ['R8C7', 'R8C6', 'R7C5', 'R6C5'],
];

return [
  new Shape('9x9'),
  // Grey-square cells: digit must be even.
  new Given('R2C1', 2, 4, 6, 8),
  new Given('R8C9', 2, 4, 6, 8),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
];
