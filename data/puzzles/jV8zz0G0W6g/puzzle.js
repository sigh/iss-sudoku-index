// Title: Thermo Sudoku
// Author: Fred Gutierrez
// Video: https://www.youtube.com/watch?v=jV8zz0G0W6g
// Source: https://app.crackingthecryptic.com/webapp/FqjfLthdTD

// Normal sudoku rules apply, and digits along a thermometer increase from
// the bulb. Each Thermo call lists cells bulb-first, per the drawn
// wayPoints; cell R3C3 is shared by thermos 1 and 2, which is allowed
// since neither restricts the other beyond the ordinary
// increasing-from-bulb requirement.

const thermo1 = [
  'R4C1', 'R3C1', 'R2C1', 'R1C2', 'R2C3', 'R3C3', 'R4C3',
];
const thermo2 = ['R3C2', 'R3C3'];
const thermo3 = [
  'R6C4', 'R5C4', 'R4C4', 'R5C5', 'R4C6', 'R5C6', 'R6C6',
];
const thermo4 = [
  'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7',
];

return [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R1C8', 3),
  new Given('R2C7', 8),
  new Given('R2C9', 4),
  new Given('R3C8', 1),
  new Given('R4C9', 5),
  new Given('R6C1', 8),
  new Given('R7C2', 8),
  new Given('R8C1', 2),
  new Given('R8C3', 3),
  new Given('R9C2', 4),
  new Given('R9C5', 2),

  new Thermo(...thermo1),
  new Thermo(...thermo2),
  new Thermo(...thermo3),
  new Thermo(...thermo4),
];
