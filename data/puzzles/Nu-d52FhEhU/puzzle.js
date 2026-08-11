// Title: Roundabout
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=Nu-d52FhEhU
// Source: https://app.crackingthecryptic.com/sudoku/8QpQhjJJ2H

// Normal sudoku rules apply. Both main diagonals (marked cyan/deepskyblue,
// R1C1..R9C9 and R1C9..R9C1) forbid repeated digits; Diagonal(-1) is ISS's
// '\' diagonal, Diagonal(1) is '/'. Four thermometers require strictly
// increasing digits from the bulb (the grey-circle end of each line, per the
// drawn underlay); Thermo enforces exactly that, bulb-first.

// Thermometer cell lists, bulb-first; transcribed from the drawn lines
// (waypoints interpolated where sparse) and their grey circle bulb markers.
const thermos = [
  ['R8C1', 'R7C2', 'R6C3', 'R5C3', 'R4C3', 'R3C2', 'R2C1'],
  ['R2C3', 'R3C4', 'R3C5', 'R3C6', 'R2C7'],
  ['R9C2', 'R8C3', 'R7C4', 'R7C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R7C8', 'R6C7', 'R5C7', 'R4C7', 'R3C8'],
];

return [
  new Shape('9x9'),
  new Given('R5C9', 1),
  new Given('R9C5', 8),
  ...thermos.map(cells => new Thermo(...cells)),
  new Diagonal(-1),
  new Diagonal(1),
];
