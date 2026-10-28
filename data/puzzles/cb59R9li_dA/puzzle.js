// Title: Febrile STEMI
// Author: Ambivalent
// Video: https://www.youtube.com/watch?v=cb59R9li_dA
// Source: https://sudokupad.app/8mu5avwekm

// Normal sudoku, thermometer and entropic-line rules; no omissions.
// Orange paths transcribed from the four drawn orange lines.
const entropicLines = [["R7C6", "R7C5", "R7C4", "R7C3", "R6C3", "R6C2", "R5C2"], ["R2C1", "R1C1", "R1C2", "R2C2"], ["R6C7", "R5C7", "R4C6", "R5C6", "R6C6", "R6C5"], ["R3C5", "R2C5", "R1C5", "R2C6", "R3C6"]];
// Grey paths transcribed bulb-first using the eight circular endpoints.
const thermometers = [["R6C9", "R5C9", "R4C9", "R3C9", "R2C9", "R2C8", "R2C7"], ["R4C1", "R5C1", "R6C1", "R7C1", "R8C1", "R8C2", "R8C3"], ["R9C4", "R9C5", "R9C6", "R8C6"], ["R8C7", "R9C7"], ["R3C3", "R2C4", "R1C4"], ["R1C6", "R1C7"], ["R6C4", "R5C4"], ["R8C8", "R7C8"]];

return [
  new Shape("9x9"),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...thermometers.map(cells => new Thermo(...cells)),
];
