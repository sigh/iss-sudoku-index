// Title: Whispering Entropy
// Author: ZogenDenji
// Video: https://www.youtube.com/watch?v=3dv4CIY5Mk8
// Source: https://sudokupad.app/dju3jzrtly

// Normal sudoku rules on a 9x9 grid with standard 3x3 boxes. No givens.
//
// Every green line is simultaneously a German Whisper (adjacent digits
// differ by at least 5) and an Entropic line (every sequential group of 3
// digits along the line has one low 1-3, one mid 4-6, and one high 7-9
// digit; a 2-cell line just needs its two digits from different groups).
// Encoded as one Whisper(5, ...) and one Entropic(...) per line, each over
// the same ordered cell list.
//
// Kropki dots: white = consecutive, black = 1:2 ratio. Dots are not marked
// negative, so absence of a dot implies nothing and is left unconstrained.
//
// Dynamic fog is solving UI only and is not encoded here.

const lines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R3C2'],
  ['R3C9', 'R3C8', 'R3C7', 'R3C6'],
  ['R1C8', 'R1C9'],
  ['R2C8', 'R2C9'],
  ['R1C6', 'R2C6', 'R2C7'],
  ['R2C3', 'R2C4', 'R3C4'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R7C1', 'R6C1', 'R5C1'],
  ['R6C3', 'R7C3'],
  ['R6C2', 'R7C2'],
  ['R4C2', 'R4C3', 'R4C4'],
  ['R5C8', 'R5C9', 'R4C9'],
  ['R8C8', 'R9C7', 'R9C8'],
];

const whiteDots = [
  ['R3C5', 'R3C6'],
  ['R5C2', 'R6C2'],
  ['R9C2', 'R9C3'],
  ['R5C9', 'R6C9'],
  ['R8C2', 'R9C2'],
];

const blackDots = [
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...lines.flatMap(cells => [
    new Whisper(5, ...cells),
    new Entropic(...cells),
  ]),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
