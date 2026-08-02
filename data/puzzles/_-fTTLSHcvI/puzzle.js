// Title: Drawers and Pearls
// Author: Mile Lemaic
// Video: https://www.youtube.com/watch?v=_-fTTLSHcvI
// Source: https://app.crackingthecryptic.com/m2nrLqqt6m

// Standard 9x9 Sudoku; both marked blue diagonals contain no repeats.
// Each grey line begins at its circular bulb and is a thermometer.
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  // Grey thermometers transcribed from the drawn bulb-to-tip paths.
  new Thermo('R5C5', 'R4C5', 'R3C4', 'R2C3', 'R1C3'),
  new Thermo('R1C5', 'R2C6', 'R2C7', 'R2C8'),
  new Thermo('R9C9', 'R9C8', 'R9C7', 'R8C6', 'R7C6'),
  new Thermo('R9C1', 'R9C2', 'R8C3', 'R7C4', 'R6C3'),
];
