// Title: Thermo Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/gJNMrP2P4Q

// Standard 6x6 sudoku: 1-6 in each row, column, and 2x3 region (default
// Shape('6x6') boxes match the payload's regions). Along each thermometer,
// digits strictly increase from the bulb (Thermo enforces this).
//
// Each thermometer's bulb cell carries a filled grey circle overlay in the
// payload; that overlay -- not the wayPoints listing order -- grounds the
// bulb-to-tip direction used below.

return [
  new Shape('6x6'),

  new Thermo('R1C1', 'R2C1'),
  new Thermo('R6C6', 'R5C6'),
  new Thermo('R2C3', 'R1C4', 'R1C5'),
  new Thermo('R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Thermo('R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2'),
  new Thermo('R6C2', 'R6C3', 'R5C4'),
];
