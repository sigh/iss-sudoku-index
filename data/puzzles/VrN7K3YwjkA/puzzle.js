// Title: Bound Together
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=VrN7K3YwjkA
// Source: https://sudokupad.app/39lodiqwrj

// Normal sudoku rules apply.
// Between Lines: every line's interior digits must lie strictly between the
// digits in its two circled endpoints. Each line is passed endpoint-first
// and endpoint-last, matching the drawn circle at each end (source `lines`
// waypoints, cross-checked against the `overlays` circle positions).
const betweenLines = [
  ['R4C4', 'R3C4', 'R2C4', 'R2C5', 'R3C5', 'R4C5'],
  ['R4C6', 'R4C7', 'R4C8', 'R5C8', 'R5C7', 'R5C6'],
  ['R6C6', 'R7C6', 'R8C6', 'R8C5', 'R7C5', 'R6C5'],
  ['R6C4', 'R6C3', 'R6C2', 'R5C2', 'R5C3', 'R5C4'],
  ['R9C6', 'R9C7', 'R8C8', 'R7C9'],
  ['R1C4', 'R1C3', 'R2C2', 'R3C1'],
  ['R1C6', 'R1C7', 'R2C8', 'R1C8'],
  ['R9C4', 'R9C3', 'R8C2', 'R9C2'],
];

const givens = [
  ['R1C1', 1],
  ['R1C9', 2],
  ['R9C1', 8],
  ['R9C9', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
