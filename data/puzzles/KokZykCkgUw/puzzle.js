// Title: Classic Thermo Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=KokZykCkgUw
// Source: https://app.crackingthecryptic.com/sudoku/p97LLN46bn

// Normal sudoku rules apply (standard 3x3 box regions, confirmed from the
// payload's own `regions` array). Along thermometers, digits must increase
// from the bulb end -- encoded with Thermo(bulb, ..., tip), which is
// strictly increasing from its first argument.

return [
  // Thermometers, cell lists bulb-first; each bulb cell is the one carrying
  // the drawn underlay circle on that line.
  new Thermo('R1C7', 'R2C6', 'R3C5', 'R2C4', 'R1C3', 'R1C2'),
  new Thermo('R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R3C3'),
  new Thermo('R6C3', 'R5C3'),
  new Thermo('R6C7', 'R5C6', 'R5C5', 'R5C4'),
  new Thermo('R9C3', 'R8C4', 'R7C5', 'R8C6', 'R9C7', 'R9C8'),
  new Thermo('R5C9', 'R6C9', 'R7C8', 'R8C7'),
];
