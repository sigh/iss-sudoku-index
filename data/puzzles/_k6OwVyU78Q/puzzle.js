// Title: 1080 Degrees
// Author: Raumplaner & Qodec
// Video: https://www.youtube.com/watch?v=_k6OwVyU78Q
// Source: https://sudokupad.app/6i5it6u94z

// Every listed digit must occur in the four cells surrounding its circle.
const quadruples = [
  new Quad('R2C3', 1, 2, 3),
  new Quad('R2C4', 4, 5),
  new Quad('R2C5', 6, 7),
  new Quad('R2C6', 2, 8),
  new Quad('R3C7', 1, 5, 6),
  new Quad('R4C7', 3, 7),
  new Quad('R5C7', 4, 9),
  new Quad('R6C7', 5, 8),
  new Quad('R7C6', 1, 3, 9),
  new Quad('R7C5', 4, 8),
  new Quad('R7C4', 1, 2),
  new Quad('R7C3', 5, 8),
  new Quad('R6C2', 2, 3, 4),
  new Quad('R5C2', 1, 6),
  new Quad('R4C2', 3, 5),
  new Quad('R3C2', 4, 7),
];

return [
  new Shape('9x9'),
  ...quadruples,
];
