// Title: Read Between The Lines
// Author: .proxz14
// Video: https://www.youtube.com/watch?v=Addce0b1UdA
// Source: https://sudokupad.app/nuf60rmjzp

// Normal Sudoku rules apply (default 9x9 boxes match the drawn regions).
// Between Lines: digits along a between line must be strictly between the
// digits on the circled ends of the line.
//
// The drawing renders one continuous spiral in a rainbow of pastel colours
// plus two closed rings and a border loop; the colour only makes a visual
// gradient and carries no clue meaning. The real clue boundaries are the 30
// cells carrying a circle overlay. Walking every drawn stroke and splitting
// it at each circled cell recovers 35 between-line arcs -- each array below
// is one arc, first and last cell circled, the cells between are the
// "along the line" digits. Splitting this way is what the rules text
// requires ("the circled ends of the line"): an uncircled junction where two
// drawn strokes meet is mid-arc, not a boundary between two separate lines.
const betweenLines = [
  // Two corner arcs cutting from the border toward centre.
  ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6'],
  // Four mid-edge arcs.
  ['R7C5', 'R8C5', 'R9C5'],
  ['R3C5', 'R2C5', 'R1C5'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C9', 'R5C8', 'R5C7'],
  // Centre zig-zag (one drawn stroke, two interior circles -> three arcs)
  // plus the separate short centre arc above it.
  ['R5C3', 'R5C4', 'R6C4'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C6', 'R5C6', 'R5C7'],
  ['R4C4', 'R4C5', 'R4C6'],
  // Closed diamond ring around the centre box (four circles -> four arcs).
  ['R7C5', 'R7C6', 'R6C7', 'R5C7'],
  ['R5C7', 'R4C7', 'R3C6', 'R3C5'],
  ['R3C5', 'R3C4', 'R4C3', 'R5C3'],
  ['R5C3', 'R6C3', 'R7C4', 'R7C5'],
  // Closed octagon ring (eight circles -> eight arcs).
  ['R4C2', 'R5C2', 'R6C2'],
  ['R6C2', 'R7C2', 'R8C3', 'R8C4'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R8C6', 'R8C7', 'R7C8', 'R6C8'],
  ['R6C8', 'R5C8', 'R4C8'],
  ['R4C8', 'R3C8', 'R2C7', 'R2C6'],
  ['R2C6', 'R2C5', 'R2C4'],
  ['R2C4', 'R2C3', 'R3C2', 'R4C2'],
  // Outer border loop, just inside the border (twelve circles -> twelve
  // arcs), cutting every corner short.
  ['R9C3', 'R9C4', 'R9C5'],
  ['R9C5', 'R9C6', 'R9C7'],
  ['R9C7', 'R9C8', 'R8C9', 'R7C9'],
  ['R7C9', 'R6C9', 'R5C9'],
  ['R5C9', 'R4C9', 'R3C9'],
  ['R3C9', 'R2C9', 'R1C8', 'R1C7'],
  ['R1C7', 'R1C6', 'R1C5'],
  ['R1C5', 'R1C4', 'R1C3'],
  ['R1C3', 'R2C2', 'R3C1'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  // Extra arc drawn only at the top-left corner, going around the true
  // corner cell R1C1 instead of cutting across it like the other three
  // corners. Shares both circled ends (R3C1, R1C3) with the border loop's
  // own corner-cutting arc above, with different interior cells -- a
  // second, independent between constraint on the same pair of ends.
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
];

const givens = [
  ['R3C1', 2],
  ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
