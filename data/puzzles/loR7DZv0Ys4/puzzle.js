// Title: Knight Lite
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=loR7DZv0Ys4
// Source: https://app.crackingthecryptic.com/sudoku/NfHNgj2gQd

// Normal 6x6 sudoku (rows, columns, 2x3 boxes) plus a global anti-knight
// constraint (cells a chess knight's move apart cannot repeat a digit) and
// five 2-cell thermometers, each increasing from its bulb. Thermometer
// cells and bulb ends are read from the drawn line waypoints and the
// underlay circle at each bulb cell.
return [
  new Shape('6x6'),
  new AntiKnight(),
  new Thermo('R1C3', 'R2C4'),
  new Thermo('R2C5', 'R1C5'),
  new Thermo('R4C5', 'R3C4'),
  new Thermo('R2C1', 'R3C2'),
  new Thermo('R2C2', 'R3C1'),
];
