// Title: Bubbles!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=f_xkka-arrA
// Source: https://sudokupad.app/miv6k9rwi0

// A circled digit gives its frequency among all six small white circles.
const countingCircles = [
  'R1C9', 'R2C2', 'R4C6', 'R5C1', 'R6C8', 'R7C3',
];

// Box borders divide each blue circular line into equal-sum segments.
const blueLines = [
  [
    ['R6C2', 'R6C3'],
    ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
    ['R7C4', 'R8C4'],
  ],
  [
    ['R3C4', 'R3C5'],
    ['R4C4', 'R4C5'],
  ],
  [
    ['R3C7', 'R3C8'],
    ['R4C7', 'R4C8'],
  ],
  [
    ['R8C6', 'R9C6'],
    ['R8C7', 'R9C7'],
  ],
  [
    ['R3C3'],
    ['R3C4', 'R3C5'],
    ['R4C3', 'R5C3'],
    ['R4C5', 'R5C4', 'R5C5'],
  ],
  [
    ['R2C6', 'R3C6'],
    ['R2C7', 'R2C8', 'R3C8'],
    ['R4C6'],
    ['R4C7', 'R4C8'],
  ],
  [
    ['R5C6', 'R6C6'],
    ['R5C7', 'R6C7'],
  ],
  [
    ['R5C5', 'R5C6', 'R6C5'],
    ['R5C7', 'R6C7'],
    ['R7C5', 'R7C6'],
    ['R7C7'],
  ],
];

return [
  new Shape('9x9'),
  new CountingCircles(...countingCircles),
  ...blueLines.map((segments) => new EqualSum(...segments)),
];
