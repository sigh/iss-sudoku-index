// Title: Spa Bath
// Author: Sotek & BremSter
// Video: https://www.youtube.com/watch?v=k2H7SArAkKE
// Source: https://tinyurl.com/4denm3zd

// Standard sudoku (rows, columns, boxes all-different) plus one given digit
// and six arrow circles. Each circle has one or more arms; each arm's digits
// sum to the circle's digit independently (verified against payload `arrow`
// entries, whose `lines` array lists each arm as circle-first cell path).
return [
  new Shape('9x9'),

  new Given('R9C1', 8),

  // Circle R2C2: three arms
  new Arrow('R2C2', 'R3C3', 'R3C4', 'R3C5'),
  new Arrow('R2C2', 'R3C3', 'R4C3', 'R5C3'),
  new Arrow('R2C2', 'R1C3', 'R1C4', 'R1C5'),

  // Circle R8C8: three arms
  new Arrow('R8C8', 'R7C7', 'R6C7', 'R5C7'),
  new Arrow('R8C8', 'R7C7', 'R7C6', 'R7C5'),
  new Arrow('R8C8', 'R9C7', 'R9C6', 'R9C5'),

  // Circle R6C9: one arm
  new Arrow('R6C9', 'R5C8', 'R4C9', 'R3C8'),

  // Circle R4C2: one arm
  new Arrow('R4C2', 'R5C1', 'R6C2', 'R7C1'),

  // Circle R7C4: three arms
  new Arrow('R7C4', 'R8C3', 'R8C2', 'R8C1'),
  new Arrow('R7C4', 'R7C3', 'R6C3'),
  new Arrow('R7C4', 'R6C4', 'R5C4'),

  // Circle R3C6: three arms
  new Arrow('R3C6', 'R2C7', 'R2C8', 'R2C9'),
  new Arrow('R3C6', 'R3C7', 'R4C7'),
  new Arrow('R3C6', 'R4C6', 'R5C6'),
];
