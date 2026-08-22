// Title: Hidden under the Rainbow
// Author: Joey Thamir
// Video: https://www.youtube.com/watch?v=Drw9MHw-y2U
// Source: https://app.crackingthecryptic.com/sudoku/j4t8fTBL3F
//
// Rules: "Each colour represents a number from 1-9. Each box has its number
// placed on the grid. If that number's colour is in that box, then only the
// colour is shown. The grey circle represents a 9th colour."
//
// Encoded:
//  - Standard sudoku (rows, columns, boxes), the seven plain-digit givens.
//  - Each colour stands for one fixed digit: SameValues per colour class, plus
//    one AllDifferent over a representative of each class so the nine colours
//    take the nine digits.
//  - "Each box has its number placed on the grid": boxes 1, 3, 4, 5, 7, 8 and 9
//    carry that digit as a plain given. Boxes 2 and 6 show theirs as a colour
//    instead, so box 2 holds a 2 and box 6 a 6 on one of its coloured cells.
//
// Nothing is omitted. The contrapositive of "if that number's colour is in that
// box, then only the colour is shown" -- that colour-N does not appear in box N
// for the seven boxes whose digit is printed -- needs no constraint: a colour-N
// cell in box N would be a second N alongside the printed given.

// Drawn data: 31 single-cell coloured underlays. Grey appears twice, told apart
// by the drawn shape (one filled square vs four filled circles); the rules note
// that the grey circle is a ninth colour, distinct from the grey square.
const colourGroups = {
  black:      ['R1C7', 'R3C6', 'R4C4', 'R6C1', 'R9C9'],
  red:        ['R2C1', 'R4C8', 'R5C3', 'R7C4', 'R6C6'],
  gold:       ['R1C1', 'R3C9', 'R4C7', 'R9C3'],
  greyCircle: ['R3C4', 'R6C2', 'R7C6', 'R4C9'],
  blue:       ['R1C5', 'R2C2', 'R7C7'],
  green:      ['R3C3', 'R8C9', 'R7C1'],
  brown:      ['R3C7', 'R7C3', 'R8C8'],
  purple:     ['R5C7', 'R9C5', 'R6C3'],
  greySquare: ['R3C2'],
};

const allColourCells = Object.values(colourGroups).flat();

const sameColour = Object.values(colourGroups)
  .filter((cells) => cells.length >= 2)
  .map((cells) => new SameValues(cells.length, ...cells));

const distinctColours = new AllDifferent(
  ...Object.values(colourGroups).map((cells) => cells[0]));

// The coloured cells of a box, derived from the drawn markers above.
// boxRow/boxCol are 1-based band and stack indices.
const colourCellsInBox = (boxRow, boxCol) => allColourCells.filter((id) => {
  const { row, col } = parseCellId(id);
  return Math.ceil(row / 3) === boxRow && Math.ceil(col / 3) === boxCol;
});

// Boxes 2 and 6 are the two with no printed digit, so each shows its own digit
// as a colour: the digit sits on one of that box's coloured cells, which one
// being unknown. ContainAtLeast requires the digit somewhere in that set.
const hiddenBoxDigits = [
  new ContainAtLeast('2', ...colourCellsInBox(1, 2)),
  new ContainAtLeast('6', ...colourCellsInBox(2, 3)),
];

return [
  new Shape('9x9'),
  // Printed digits: box N shows the digit N.
  new Given('R1C2', 1),
  new Given('R1C8', 3),
  new Given('R4C1', 4),
  new Given('R6C4', 5),
  new Given('R7C8', 9),
  new Given('R8C5', 8),
  new Given('R9C2', 7),
  ...sameColour,
  distinctColours,
  ...hiddenBoxDigits,
];
