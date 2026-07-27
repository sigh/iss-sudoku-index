// Title: The Voice of the Masked Idol who has Got Talent
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=3Lb6RkjZDtc
// Source: https://sudokupad.app/hchxt4tcxs

// Rules encoded: normal sudoku; both main diagonals all-different; green
// German Whisper lines (adjacent difference >= 5); dark blue Factor lines
// (adjacent digits have an integer quotient, i.e. the larger is a multiple
// of the smaller); a digit placed in a circle equals the number of circles
// (across the whole set of circles) holding that same digit.
//
// The thin deepskyblue diagonal strokes (waypoints corner-to-corner) are a
// decorative overlay marking the two main diagonals; the puzzle's own hidden
// unique-flagged cages cover the same cells, and `Diagonal` below encodes the
// stated rule directly.

const factorLineSegments = [
  // Provenance: the 12 mediumblue (#0000cd, "dark blue") drawn line segments.
  ['R7C2', 'R7C1', 'R8C1'],
  ['R8C3', 'R9C3', 'R9C2'],
  ['R2C1', 'R3C1', 'R3C2'],
  ['R1C2', 'R1C3', 'R2C3'],
  ['R1C8', 'R1C7', 'R2C7'],
  ['R3C8', 'R3C9', 'R2C9'],
  ['R8C7', 'R9C7', 'R9C8'],
  ['R7C8', 'R7C9', 'R8C9'],
  ['R4C1', 'R5C1'],
  ['R5C9', 'R6C9'],
  ['R9C4', 'R9C5'],
  ['R1C5', 'R1C6'],
];

const whisperLines = [
  // Provenance: the 2 springgreen (#67f067, "green") drawn line segments.
  ['R7C3', 'R8C2', 'R9C1'],
  ['R3C7', 'R2C8', 'R1C9'],
];

// Provenance: the 10 white-filled circle underlays.
const circleCells = [
  'R7C1', 'R3C9', 'R1C3', 'R9C7', 'R5C2',
  'R5C8', 'R2C2', 'R1C6', 'R9C5', 'R5C4',
];

// Larger digit is an integer multiple of the smaller one.
const factorKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);

return [
  new Shape('9x9'),

  new Diagonal(-1),
  new Diagonal(1),

  ...whisperLines.map(cells => new Whisper(5, ...cells)),

  ...factorLineSegments.map(cells => new Pair(factorKey, 'Factor', ...cells)),

  new CountingCircles(...circleCells),
];
