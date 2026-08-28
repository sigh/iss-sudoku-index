// Title: Jellyfish Sudoku
// Author: Sammi Shi
// Video: https://www.youtube.com/watch?v=T_wEm1hPUWo
// Source: https://cracking-the-cryptic.web.app/sudoku/h9Th7b647r

// Normal sudoku rules apply (standard rows/columns/boxes, from the video
// description). Digits increase along each thermometer from the bulb to
// the end. Two of the seven drawn bulbs sit mid-line, splitting one drawn
// line into two arms that share a bulb; each arm below is encoded as its
// own Thermo, bulb-first.

return [
  new Shape('9x9'),

  new Thermo('R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C6'),
  new Thermo('R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2'),
  new Thermo('R4C2', 'R5C2', 'R6C3', 'R7C4', 'R8C4'),
  new Thermo('R8C2', 'R8C3'),
  new Thermo('R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C7'),
  new Thermo('R8C8', 'R8C9'),
  new Thermo('R1C7', 'R1C8'),
  new Thermo('R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R6C8'),
  new Thermo('R2C3', 'R2C4', 'R2C5', 'R3C6', 'R3C7', 'R4C8'),
];
