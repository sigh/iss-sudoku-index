// Title: Staples
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=1MZntiY8Gk4
// Source: https://app.crackingthecryptic.com/sudoku/QDLp7pfG83

// Normal sudoku rules apply. Digits along a thermometer increase from the
// bulb end. Six thermometers are drawn; each Thermo lists its bulb cell
// first, matching the drawn circle's cell for that line (confirmed against
// the payload: every bulb's coordinate equals the first waypoint of its
// line).

return [
  new Shape('9x9'),

  new Thermo('R3C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2'),
  new Thermo('R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R7C8'),
  new Thermo('R4C4', 'R3C4', 'R3C5', 'R3C6', 'R4C6'),
  new Thermo('R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6'),
  new Thermo('R8C8', 'R9C8', 'R9C7', 'R9C6', 'R8C6'),
  new Thermo('R2C4', 'R1C4', 'R1C3', 'R1C2', 'R2C2'),
];
