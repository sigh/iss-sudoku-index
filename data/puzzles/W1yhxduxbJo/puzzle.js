// Title: Quiet Box
// Author: Tacosian
// Video: https://www.youtube.com/watch?v=W1yhxduxbJo
// Source: https://sudokupad.app/1p9vh22zea

// Standard Sudoku. Green lines are whispers; thermos increase from bulb to tip.
// White dots are consecutive, black dots have a 1:2 ratio, and dots are not exhaustive.

const whiteDots = [
  ['R7C7','R6C7'],['R7C6','R7C7'],['R7C6','R7C5'],['R7C4','R7C5'],
  ['R7C3','R7C4'],['R6C3','R7C3'],['R5C3','R6C3'],['R5C3','R4C3'],
  ['R4C3','R3C3'],['R3C3','R3C4'],['R3C4','R3C5'],['R3C5','R3C6'],
  ['R3C7','R3C6'],['R3C7','R4C7'],['R4C7','R5C7'],['R5C7','R6C7'],
  ['R5C1','R5C2'],['R9C2','R8C2'],
];
return [
  new Shape('9x9'),
  new Whisper(5, 'R1C4','R2C5','R1C6'), new Whisper(5, 'R4C9','R5C8','R6C9'), new Whisper(5, 'R9C3','R8C2','R7C1'),
  new Thermo('R4C4','R4C3'), new Thermo('R4C6','R4C7'), new Thermo('R6C6','R6C7'), new Thermo('R6C4','R6C3'), new Thermo('R8C1','R9C1'), new Thermo('R7C9','R7C8'), new Thermo('R1C3','R2C3'),
  ...whiteDots.map(cells => new WhiteDot(...cells)), new BlackDot('R2C7','R2C8'),
];
