// Title: Thermo X Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=FjgksUl_Ap4
// Source: https://app.crackingthecryptic.com/webapp/9nJ7JDMM2h

// Normal sudoku rules apply. Seven thermometers each increase strictly from
// the bulb end. Both main diagonals contain each digit 1-9 exactly once.
//
// The drawing also contains an 8th grey polyline whose path is a strict
// subset of the bulb-R7C9 thermometer's path below (missing only the bulb
// cell) and carries no bulb circle of its own; only 7 bulb circles are drawn,
// one per thermometer below. It renders nothing beyond what the 7th
// thermometer already covers, so it is a duplicate authoring artifact and is
// omitted here.

return [
  new Shape('9x9'),

  new Diagonal(-1), // R1C1-R9C9 (top-left to bottom-right)
  new Diagonal(1),  // R1C9-R9C1 (top-right to bottom-left)

  // Thermometers, bulb cell first. Cell lists transcribed from the puzzle's
  // grey thermometer polylines.
  new Thermo('R3C1', 'R2C1', 'R1C2', 'R1C3', 'R2C3', 'R3C2'),
  new Thermo('R2C4', 'R1C4', 'R1C5', 'R1C6'),
  new Thermo('R3C8', 'R2C7', 'R1C7', 'R1C8', 'R2C9', 'R3C9'),
  new Thermo('R6C5', 'R5C4', 'R4C5', 'R5C6'),
  new Thermo('R7C2', 'R8C3', 'R9C3', 'R9C2', 'R8C1', 'R7C1'),
  new Thermo('R7C6', 'R8C6', 'R9C5', 'R8C4', 'R7C4'),
  new Thermo('R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C7', 'R7C8'),
];
