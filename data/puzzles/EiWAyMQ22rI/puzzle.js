// Title: The Smiling Bishop
// Author: Ryzen
// Video: https://www.youtube.com/watch?v=EiWAyMQ22rI
// Source: https://app.crackingthecryptic.com/sudoku/RtmGJTB3dJ

// Rules encoded here (nothing is omitted):
//  - Normal sudoku, which is ISS's default.
//  - Green lines: Whisper(5) -- adjacent digits on the line differ by at
//    least 5.
//  - Black dots: BlackDot -- 1:2 ratio. The rules add "Not all possible dots
//    are given" only for these, so no strict/negative variant is used: an
//    unmarked orthogonal pair may still happen to be in ratio.
//  - X/V dots: X sums to 10, V sums to 5, adjacent cells only, drawn as
//    marked. The rules give X/V no "not all given" disclaimer (unlike black
//    dots, right above), but the exhaustive reading (a global negative on
//    every other orthogonal pair) is unsatisfiable together with the long
//    green line alone, regardless of any solution, so it is not a live
//    candidate; the marks are read as ordinary, non-exhaustive clues.
//  - Grey circle: the cell holds an odd digit, encoded as a candidate-set
//    Given (ISS has no dedicated Odd class).

// Green lines, transcribed from the three yellowgreen entries of the "lines"
// array (thickness 7, colour #A3E048).
const greenLines = [
  ['R7C6', 'R8C5', 'R7C4'],
  ['R7C5', 'R6C5', 'R5C5'],
  [
    'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C8', 'R7C8',
    'R6C7', 'R5C7', 'R5C8', 'R4C8', 'R3C8', 'R3C7', 'R2C6', 'R1C6', 'R1C5',
    'R1C4', 'R2C4', 'R3C3', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R6C3', 'R7C2',
    'R8C2',
  ],
];

// Black dots, transcribed from the two edge-centred black-filled overlays.
const blackDots = [
  ['R4C4', 'R4C5'],
  ['R4C5', 'R4C6'],
];

// X/V dots, transcribed from the three edge-centred white-filled text
// overlays ("X" or "V").
const xPairs = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
];
const vPairs = [
  ['R2C8', 'R2C9'],
];

return [
  new Shape('9x9'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new Given('R1C5', 1, 3, 5, 7, 9),
];
