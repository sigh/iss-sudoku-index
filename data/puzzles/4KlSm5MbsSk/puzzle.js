// Title: Thermal Nights
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=4KlSm5MbsSk
// Source: https://app.crackingthecryptic.com/sudoku/92rNt22mHj

// Normal sudoku rules (default rows/cols/boxes). Eight thermometers: digits
// strictly increase from the bulb end. Anti-knight: no repeat a knight's
// move apart.

// Thermometer bulb-to-tip cell runs, transcribed from the drawn `lines`
// array (each thermometer's filled gray circle marks the bulb / first
// cell). A ninth line entry renders no coordinates and is not a drawn clue.
const thermos = [
  ['R1C4', 'R1C3', 'R2C2', 'R3C2'],
  ['R3C1', 'R4C1', 'R5C2', 'R5C3'],
  ['R2C7', 'R3C6', 'R3C5', 'R3C4'],
  ['R4C9', 'R3C8', 'R2C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R6C4', 'R5C4'],
  ['R7C7', 'R6C6', 'R5C6'],
  ['R8C7', 'R9C8'],
  ['R9C4', 'R8C3', 'R8C2', 'R7C1'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new AntiKnight(),
];
