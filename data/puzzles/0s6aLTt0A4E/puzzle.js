// Title: Tightly Packed
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=0s6aLTt0A4E
// Source: https://app.crackingthecryptic.com/sudoku/j8DQN3mPG3

// Normal sudoku rules apply (Shape('9x9') gives rows/cols/boxes AllDifferent).
// Along thermometers, digits increase from the bulb end -> Thermo, bulb cell
// listed first, per the DESCRIPTION "Values must be in increasing order
// starting at the bulb."
// Each purple line must contain a set of non-repeating consecutive digits,
// in any order -> Renban, whose DESCRIPTION matches the rule text verbatim
// ("Digits on the line must be consecutive and non-repeating, in any order.").
//
// Six purple lines each touch a thermometer at one or both endpoints (a
// hexagon/pentagon/V shape split across the two differently-coloured
// strokes); a seventh purple line (R5C5-R4C6) is standalone with no
// thermometer. One thermometer/purple pair (bulb R8C2) occupies the exact
// same 2 cells, so together they force the higher cell to be exactly one
// more than the bulb. All six bulb cells are confirmed against six drawn
// grey circle underlays, each a 0.7x0.7 #CFCFCF circle, at R3C1, R2C3,
// R8C2, R9C3, R7C9, R1C7.

return [
  new Shape('9x9'),

  // Thermometers (bulb first, increasing).
  new Thermo('R3C1', 'R4C1', 'R4C2', 'R4C3'),
  new Thermo('R1C7', 'R1C6', 'R2C6', 'R3C6'),
  new Thermo('R9C3', 'R9C4', 'R8C4', 'R7C4'),
  new Thermo('R7C9', 'R6C8', 'R6C7'),
  new Thermo('R2C3', 'R3C4'),
  new Thermo('R8C2', 'R8C1'),

  // Purple renban lines.
  new Renban('R3C1', 'R3C2', 'R3C3', 'R4C3'),
  new Renban('R3C6', 'R3C7', 'R2C7', 'R1C7'),
  new Renban('R7C4', 'R7C3', 'R8C3', 'R9C3'),
  new Renban('R6C7', 'R7C7', 'R7C8', 'R7C9'),
  new Renban('R2C3', 'R1C4'),
  new Renban('R8C1', 'R8C2'),
  new Renban('R5C5', 'R4C6'),
];
