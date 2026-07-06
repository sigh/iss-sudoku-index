// It's getting hot in here! by Kiwi Curt
// https://sudokupad.app/9ajocm7gjs
// https://www.youtube.com/watch?v=iDZ_suiHKps
//
// Normal sudoku. Digits on thermometers strictly increase from bulb to tip
// (all thermos are straight lines). White dot: the two joined digits are
// consecutive. Black dot: one joined digit is double the other (1:2 ratio).

return [
  new Shape('9x9'),

  // Thermometers, ordered bulb -> tip.
  new Thermo('R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8'),
  new Thermo('R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'),
  new Thermo('R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5'),
  new Thermo('R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4'),
  new Thermo('R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5'),
  new Thermo('R5C2', 'R4C2', 'R3C2', 'R2C2'),
  new Thermo('R4C3', 'R3C3', 'R2C3'),
  new Thermo('R3C4', 'R2C4'),
  new Thermo('R7C6', 'R7C5', 'R7C4', 'R7C3'),
  new Thermo('R7C2', 'R8C2', 'R9C2'),

  // White dot: consecutive digits.
  new WhiteDot('R7C3', 'R6C3'),

  // Black dots: one digit is double the other.
  new BlackDot('R5C6', 'R6C6'),
  new BlackDot('R4C1', 'R4C2'),
  new BlackDot('R6C4', 'R6C5'),
  new BlackDot('R4C8', 'R4C7'),
];
