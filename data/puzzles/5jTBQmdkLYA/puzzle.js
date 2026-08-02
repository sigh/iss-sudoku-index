// Title: Amongst Our Weaponry
// Author: MrDon
// Video: https://www.youtube.com/watch?v=5jTBQmdkLYA
// Source: https://app.crackingthecryptic.com/sudoku/2GqrMGFb3L

// Normal 9x9 Sudoku, anti-king, arrows, white/black dots, and thermometers.
// Arrow and thermometer paths follow the drawn bulb/circle and line geometry.
return [
  new Shape('9x9'),
  new AntiKing(),

  new Arrow('R3C3', 'R2C3', 'R1C2', 'R1C1'),
  new Arrow('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'),
  new Arrow('R7C7', 'R8C8', 'R8C9', 'R9C9'),
  new Arrow('R7C7', 'R7C6', 'R7C5', 'R7C4', 'R6C3'),

  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R4C5', 'R4C6'),
  new WhiteDot('R7C3', 'R8C3'),
  new BlackDot('R4C3', 'R5C3'),

  new Thermo('R7C3', 'R6C4', 'R5C3', 'R4C3'),
  new Thermo('R3C7', 'R4C6', 'R5C7', 'R6C7'),
  new Thermo('R6C5', 'R5C4', 'R4C5', 'R5C6'),
];
