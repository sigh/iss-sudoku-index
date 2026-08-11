// Title: Aug 9, 2022: Irregular Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=G5q9Vlwk7As
// Source: https://tinyurl.com/56ua4438

// Normal sudoku rules do NOT apply. Rows and columns still hold each digit
// 1-9 once, but the usual 3x3 boxes are replaced by 9 irregular 9-cell
// regions (drawn as bold-outlined jigsaw pieces) that must also hold each
// digit 1-9 once. NoBoxes() drops the default boxes; one Jigsaw() per region
// adds the drawn geometry back as the all-different groups. Region cell
// lists are transcribed from the drawn jigsaw region boundaries.
const jigsawRegions = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R7C5', 'R7C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C4'],
  ['R4C6', 'R4C7', 'R4C8', 'R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C7', 'R6C8'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C7', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
];

// Givens transcribed from the `grid[row][col].value` fields in the source
// payload.
const givens = [
  new Given('R1C1', 7), new Given('R1C3', 4), new Given('R1C5', 6),
  new Given('R1C7', 8), new Given('R1C9', 1),
  new Given('R2C1', 8), new Given('R2C3', 5), new Given('R2C5', 7),
  new Given('R2C9', 2),
  new Given('R3C9', 3),
  new Given('R4C2', 1),
  new Given('R5C2', 2), new Given('R5C3', 3), new Given('R5C4', 4),
  new Given('R5C6', 5), new Given('R5C7', 6), new Given('R5C8', 7),
  new Given('R6C8', 8),
  new Given('R7C1', 3),
  new Given('R8C1', 4), new Given('R8C5', 8), new Given('R8C7', 1),
  new Given('R8C9', 5),
  new Given('R9C1', 5), new Given('R9C3', 7), new Given('R9C5', 9),
  new Given('R9C7', 2), new Given('R9C9', 6),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawRegions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens,
];
