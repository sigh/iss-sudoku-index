// Title: 7030 Sudoku
// Author: EmmettCito
// Video: https://www.youtube.com/watch?v=Ta7BFoHY2Vc
// Source: https://app.crackingthecryptic.com/sudoku/JH2bJNGmqF

// Normal sudoku rules apply. Digits increase along thermometers from the
// bulb. Each Thermo below is listed bulb-first; some lines were drawn
// tip-first in the payload's waypoint order, so the cell order here is
// reversed to put the bulb end first. Every bulb cell used below is
// confirmed by a matching overlay circle drawn on the board.

return [
  new Shape('9x9'),

  new Thermo('R1C4', 'R2C4', 'R3C5'),
  new Thermo('R3C6', 'R2C6', 'R1C5'),
  new Thermo('R2C8', 'R3C8', 'R4C7', 'R5C7', 'R6C7'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C8'),
  new Thermo('R9C9', 'R8C9'),
  new Thermo('R8C4', 'R7C5', 'R7C6', 'R8C7', 'R9C7'),
  new Thermo('R8C5', 'R9C6'),
  new Thermo('R7C2', 'R8C3', 'R9C2', 'R8C1'),
  new Thermo('R6C4', 'R5C3', 'R5C2', 'R5C1'),
  new Thermo('R4C4', 'R3C3', 'R3C2'),
  new Thermo('R3C1', 'R4C1'),
];
