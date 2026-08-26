// Title: Rockin' Around the Symmetree
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=9ZYH6yryXwY
// Source: https://tinyurl.com/5989kbrr

// Normal sudoku rules apply. Digits along thermometers must strictly increase
// from bulb to tip; each Thermo lists cells bulb-first per the payload's own
// waypoint order.

return [
  new Shape('9x9'),

  new Given('R1C5', 2),
  new Given('R2C6', 3),
  new Given('R3C3', 3),
  new Given('R7C7', 2),
  new Given('R8C4', 2),
  new Given('R9C5', 3),

  new Thermo('R6C6', 'R5C7', 'R6C8', 'R7C9', 'R8C8', 'R9C7', 'R8C6', 'R7C5'),
  new Thermo('R4C4', 'R5C3', 'R4C2', 'R3C1', 'R2C2', 'R1C3', 'R2C4', 'R3C5'),
  new Thermo('R6C7', 'R7C8', 'R8C7', 'R7C6'),
  new Thermo('R4C3', 'R3C2', 'R2C3', 'R3C4'),
];
