// Title: Hubble Deep Field Sudoku
// Author: Azireo
// Video: https://www.youtube.com/watch?v=Izwz5o6UzEc
// Source: https://app.crackingthecryptic.com/sudoku/Fp2Tn37qnG

// Normal sudoku rules apply (default row/col/box all-different; regions in
// the payload are the plain nine 3x3 boxes, so no NoBoxes/region override is
// used). Digits along thermos must increase from the bulb: Thermo(bulb, ...).
// Digits along arrows sum to the number in the circle: Arrow(circle, ...arm).
// Two circles (R7C3, R2C3) each anchor two separate arms; each Arrow below is
// its own constraint against the same circle cell, per the two drawn arrows
// leaving each of those bulbs. Cell paths transcribed from the drawn thermo
// lines and arrows.

return [
  new Shape('9x9'),

  // Thermometers: bulb cell first, values strictly increase along the path.
  new Thermo('R2C8', 'R2C9', 'R3C9', 'R3C8', 'R3C7', 'R2C7'),
  new Thermo('R3C5', 'R3C4', 'R4C4', 'R4C5'),
  new Thermo('R2C2', 'R1C1', 'R2C1', 'R1C2'),
  new Thermo('R8C2', 'R8C3', 'R9C3', 'R9C2'),
  new Thermo('R7C7', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C8'),

  // Arrows: circle cell first, remaining cells sum to it.
  new Arrow('R9C5', 'R8C5', 'R9C6'),
  new Arrow('R7C3', 'R7C4', 'R6C4', 'R6C3', 'R6C2'),
  new Arrow('R7C3', 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new Arrow('R4C8', 'R4C7', 'R5C7'),
  new Arrow('R1C7', 'R1C8', 'R1C9'),
  new Arrow('R2C3', 'R1C3', 'R1C4', 'R1C5'),
  new Arrow('R2C3', 'R3C3', 'R3C2', 'R3C1'),
];
