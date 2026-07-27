// Title: Thermo 'Tornado'
// Author: Sudokun
// Video: https://www.youtube.com/watch?v=BWmCfbOal0M
// Source: https://sudokupad.app/afp5pakhmr

// Standard sudoku (rows/cols/default 3x3 boxes) plus: both main diagonals
// non-repeating; seven thermometers (strictly increasing from the bulb);
// five gray-circle cells forced odd; four gray-square cells forced even.
// No givens. Thermo bulb/path cells and the gray circle/square cells are
// read from the drawn underlay/line colours (bulb circles share the thermo
// line colour; parity marks share a separate colour, distinguished by shape:
// rounded = circle = odd, square = even).

return [
  new Shape('9x9'),

  // Diagonal(1) is the anti-diagonal (bottom-left to top-right): R9C1..R1C9.
  // Diagonal(-1) is the main diagonal (top-left to bottom-right): R1C1..R9C9.
  new Diagonal(1),
  new Diagonal(-1),

  // Seven thermometers, spiralling inward. Each bulb cell (matched to the
  // #cccf-filled circle underlays) is listed first; Thermo enforces strictly
  // increasing values away from it.
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Thermo('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'),
  new Thermo('R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2'),
  new Thermo('R3C3', 'R3C4', 'R3C5', 'R3C6'),
  new Thermo('R4C7', 'R5C7', 'R6C7'),
  // This thermo's bulb-circle underlay sits on its second drawn waypoint
  // (R7C6), not the first (R7C5), so it increases from R7C6 down to R7C5.
  new Thermo('R7C6', 'R7C5'),

  // Gray-circle cells (rounded #0003 underlays): forced odd.
  new Given('R9C2', 1, 3, 5, 7, 9),
  new Given('R3C2', 1, 3, 5, 7, 9),
  new Given('R1C9', 1, 3, 5, 7, 9),
  new Given('R7C7', 1, 3, 5, 7, 9),
  new Given('R5C4', 1, 3, 5, 7, 9),

  // Gray-square cells (non-rounded #0003 underlays): forced even.
  new Given('R7C4', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),
  new Given('R3C7', 2, 4, 6, 8),
  new Given('R5C5', 2, 4, 6, 8),
];
