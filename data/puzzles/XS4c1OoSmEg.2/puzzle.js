// Title: 1 Hotel and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=XS4c1OoSmEg
// Source: https://sudokupad.app/jqg2me00dc

const regions = [
  ['R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R5C2', 'R5C3', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C4'],
  ['R2C2', 'R2C3', 'R2C5', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C5', 'R4C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5', 'R5C6'],
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),

  // Top hotel-room clues. The first cell in the column supplies N.
  new NumberedRoom('C3,1', 4),
  new NumberedRoom('C4,1', 3),
  new NumberedRoom('C5,1', 2),
  new NumberedRoom('C6,1', 1),
];
