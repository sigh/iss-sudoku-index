// Title: Onion
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=aI03nXLTyGg
// Source: https://sudokupad.app/i9wx9vdy41

// Rules encoded: normal Sudoku; every circled digit is the count of that digit
// among all circled cells; and each grey line with two circled endpoints has
// interior digits strictly between its endpoint digits. The closed grey square
// at R9C8-R8C8-R8C9-R9C9-R9C8 is omitted: the art gives no two distinct
// circled endpoints to which the stated between-line rule can apply.

// Circled cells, transcribed from the white-fill, black-border circle underlays.
const circleCells = [
  'R1C2', 'R1C3', 'R1C4', 'R1C6', 'R1C7', 'R1C8',
  'R2C1', 'R2C5', 'R2C9',
  'R3C1', 'R3C5', 'R3C6', 'R3C9',
  'R4C1', 'R4C5', 'R4C7', 'R4C9',
  'R5C2', 'R5C8',
  'R6C1', 'R6C3', 'R6C5', 'R6C9',
  'R7C1', 'R7C4', 'R7C5', 'R7C9',
  'R8C1', 'R8C5', 'R8C9',
  'R9C2', 'R9C3', 'R9C4', 'R9C6', 'R9C7', 'R9C8',
];

// Grey open strokes from the drawn line geometry, each joining circled endpoints.
const betweenLines = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R2C5', 'R2C6', 'R3C6'],
  ['R2C9', 'R3C8', 'R4C9'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R9C2', 'R8C3', 'R9C4'],
];

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  ...betweenLines.map((cells) => new Between(...cells)),
];
