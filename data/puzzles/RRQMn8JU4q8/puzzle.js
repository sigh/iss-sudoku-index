// Title: The Squaretaker
// Author: haleypro
// Video: https://www.youtube.com/watch?v=RRQMn8JU4q8
// Source: https://sudokupad.app/x07h2149k1

// Standard 9x9 sudoku. Black lines are renbans, blue lines are thermos (bulb
// at the first, thicker-marked cell), grey lines are region sum lines, and
// yellow circles mark odd cells. A hidden thermo -- orthogonal-only, exact
// path and bulb end unknown, forbidden from crossing the renban loop -- runs
// between the cells marked alpha and delta in the source art; ISS has no
// primitive for digit order along a solver-discovered path (only shape/
// connectivity are expressible), so that rule is omitted here.

return [
  new Shape('9x9'),

  new Given('R3C2', 1),
  new Given('R6C2', 7),
  new Given('R8C7', 1),
  new Given('R8C9', 4),
  new Given('R9C5', 6),

  // Odd cells (yellow circles): candidate-restricted to the odd digits.
  new Given('R1C2', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R4C5', 1, 3, 5, 7, 9),
  new Given('R4C9', 1, 3, 5, 7, 9),
  new Given('R9C4', 1, 3, 5, 7, 9),
  new Given('R9C9', 1, 3, 5, 7, 9),

  // Renban (black), closed 8-cell loop; Renban is set-based so the closing
  // edge needs no repeated cell.
  new Renban(
    'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5'),

  // Region sum line (grey). The drawn stroke's waypoints revisit R7C3 at the
  // end; both literal readings of that revisit are arithmetically
  // impossible (taking it as a real 5th group of the linear line forces
  // R8C2 = 0; taking it as a pure closed loop that drops R8C2 forces
  // R7C3 = R7C4, which share row 7), so the trailing duplicate is dropped
  // and the line is encoded as the 7 distinct cells once each.
  new RegionSumLine('R8C2', 'R7C3', 'R7C4', 'R6C5', 'R5C5', 'R5C4', 'R6C3'),

  // Thermos (blue), bulb cell first.
  new Thermo('R7C2', 'R8C1'),
  new Thermo('R8C3', 'R9C2'),
];
