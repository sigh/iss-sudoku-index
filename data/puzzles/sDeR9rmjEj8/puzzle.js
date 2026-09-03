// Title: Read between the cages
// Author: shady moon
// Video: https://www.youtube.com/watch?v=sDeR9rmjEj8
// Source: https://sudokupad.app/xyrh6tfdyq

// Rules: Normal Sudoku rules apply. Digits must not repeat in cages. Digits on
// thermometers increase from the bulb end. Digits on lines must be between the
// digits in the circles on each end. These lines also act as thermometers i.e.
// digits on lines must increase from the "low" circle to the "high" circle.
//
// There are no given digits.
//
// Omitted rule: which circle of a between-line is its "low" end. Both circles of
// a line are drawn identically and the source records the line as nothing but an
// ordered list of its cells, so nothing on the board says which way any of the
// nine lines runs. Each line is encoded as running one way or the other, which
// keeps everything the rules force about it but drops the choice of end.

// Cage cells, read off the four drawn cage outlines. None carries a printed
// total.
const cages = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];

// Thermometer paths, bulb cell first, as drawn.
const thermos = [
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C1'],
];

// Between-line paths: the two circled end cells and the cells drawn between
// them. Listed from one circle to the other; which of the two is the "low"
// circle is the omitted rule above.
const betweenLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'],
];

return [
  new Shape('9x9'),

  // A cage total of 0 means "no total", leaving just the all-different that
  // "digits must not repeat in cages" asks for.
  ...cages.map(cells => new Cage(0, ...cells)),

  ...thermos.map(cells => new Thermo(...cells)),

  // Increasing from the low circle to the high circle makes the whole line,
  // circles included, strictly increasing along its length; the interior cells
  // being strictly between the two circles is what that says about them. With
  // the low end unrecorded, the line increases in one direction or the other.
  ...betweenLines.map(cells => new Or([
    new Thermo(...cells),
    new Thermo(...cells.slice().reverse()),
  ])),
];
