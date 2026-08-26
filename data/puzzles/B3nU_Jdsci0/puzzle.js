// Title: Looking for a Friend
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=B3nU_Jdsci0
// Source: https://tinyurl.com/2y7fl4n3

// Standard 9x9 sudoku (rows, columns, boxes) with no printed givens. Seven
// thermometers (strictly increasing from bulb to tip), four white dots
// (consecutive) and four black dots (1:2 ratio) between adjacent cells. Not
// all possible dots are drawn, so no negative Kropki inference applies.
// Fog-of-war reveal state is solving UI only and has no bearing on the
// finished grid, so it is not encoded.

return [
  new Shape('9x9'),

  // Thermometers: bulb cell listed first, values strictly increase to the tip.
  new Thermo('R4C6', 'R5C6', 'R6C6', 'R7C5', 'R7C4', 'R6C3', 'R5C4'),
  new Thermo('R5C8', 'R6C8', 'R7C8', 'R8C9', 'R8C8'),
  new Thermo('R6C5', 'R7C6', 'R8C6', 'R7C7'),
  new Thermo('R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Thermo('R5C1', 'R5C2', 'R4C3', 'R3C3', 'R4C4'),
  new Thermo('R1C3', 'R2C4', 'R2C5', 'R3C6'),
  new Thermo('R7C1', 'R7C2', 'R8C3', 'R8C2'),

  // White dots: consecutive digits. One sits on thermometer 1's path.
  new WhiteDot('R4C6', 'R5C6'),
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R8C1', 'R8C2'),
  new WhiteDot('R3C6', 'R3C7'),

  // Black dots: 1:2 ratio. One sits on thermometer 1's path.
  new BlackDot('R5C6', 'R6C6'),
  new BlackDot('R9C4', 'R9C5'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R1C8', 'R1C9'),
];
