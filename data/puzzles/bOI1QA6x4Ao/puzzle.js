// Title: Trio of Triples
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=bOI1QA6x4Ao
// Source: https://app.crackingthecryptic.com/sudoku/G2RbJhQ6HL

// Standard Sudoku rules apply. The blue marked anti-diagonal has no repeated digits.
// The listed cages are distinct-digit sums; the grey bulb-ended paths are thermometers.
// Each listed green highlighted region has no repeated digits.
return [
  new Shape('9x9'),
  new Diagonal(1),

  // Cage cells and totals transcribed from the drawn cage outlines and labels.
  new Cage(6, 'R1C2', 'R1C1', 'R2C1'),
  new Cage(24, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(18, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(6, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(15, 'R4C9', 'R5C9', 'R6C9'),

  // Thermometer paths transcribed bulb-first from the four grey bulb-and-line clues.
  new Thermo('R5C4', 'R4C4', 'R3C4', 'R3C3'),
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new Thermo('R5C6', 'R4C7', 'R4C8', 'R4C9'),
  new Thermo('R7C3', 'R7C4', 'R6C4', 'R6C3', 'R6C2'),

  // Green highlighted-region cells transcribed from the four connected underlay shapes.
  new AllDifferent('R1C3', 'R2C3', 'R3C3', 'R4C3', 'R4C2', 'R4C1', 'R3C1', 'R3C2', 'R2C2'),
  new AllDifferent('R6C1', 'R6C2', 'R6C3', 'R7C3', 'R7C2', 'R7C1', 'R8C2', 'R8C3', 'R9C3'),
  new AllDifferent('R9C7', 'R8C7', 'R7C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R7C8', 'R8C8'),
  new AllDifferent('R1C7', 'R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C8', 'R3C8'),
];
