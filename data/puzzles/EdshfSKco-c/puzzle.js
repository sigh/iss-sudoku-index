// Title: A Little Nudge
// Author: RushBee
// Video: https://www.youtube.com/watch?v=EdshfSKco-c
// Source: https://app.crackingthecryptic.com/sudoku/hTHm4QmfBQ

// Normal sudoku rules apply. Digits on thermometers increase from the bulb
// (round) end. Digits in a grey square must be even.
//
// Two bulb cells (R7C3, R4C4) each carry two drawn arms, encoded as two
// separate Thermo constraints sharing that first cell. Separately, the
// thermometers bulbed at R6C3 and at R4C4 both run into the same tip cell
// R5C2 -- a shared endpoint, not a shared bulb.
const thermometers = [
  new Thermo('R3C3', 'R2C3', 'R2C4', 'R2C5', 'R1C6', 'R1C7'),
  new Thermo('R7C3', 'R8C3', 'R8C4', 'R8C5', 'R9C6', 'R9C7'),
  new Thermo('R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R7C7'),
  new Thermo('R6C3', 'R5C2'),
  new Thermo('R4C4', 'R4C3', 'R5C2'),
  new Thermo('R7C3', 'R7C4'),
  new Thermo('R3C1', 'R2C1', 'R1C1', 'R1C2'),
  new Thermo('R7C2', 'R8C2', 'R9C2', 'R9C1'),
  new Thermo('R9C9', 'R9C8', 'R8C7', 'R8C8'),
  new Thermo('R3C7', 'R3C8', 'R3C9'),
  new Thermo('R4C4', 'R3C4', 'R3C5'),
];

// Grey square: restrict R2C6's candidates to the even digits.
const greySquare = new Given('R2C6', 2, 4, 6, 8);

return [
  new Shape('9x9'),
  ...thermometers,
  greySquare,
];
