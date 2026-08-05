// Title: Simple
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=hheyKhHv3Oc
// Source: https://app.crackingthecryptic.com/sudoku/6fpfHHFqdt

// Normal Sudoku; kings-move neighbours differ; grey thermometers increase from bulb to tip.
// Thermometer paths are transcribed from the eight grey bulb-and-line drawings.
return [
  new Shape('9x9'),
  new Given('R4C3', 8),
  new Given('R7C6', 1),
  new AntiKing(),
  new Thermo('R1C9', 'R2C9', 'R3C9'),
  new Thermo('R1C8', 'R2C8', 'R3C8', 'R4C8'),
  new Thermo('R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'),
  new Thermo('R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'),
  new Thermo('R9C1', 'R8C1', 'R7C1'),
  new Thermo('R9C2', 'R8C2', 'R7C2', 'R6C2'),
  new Thermo('R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3'),
  new Thermo('R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4'),
];
