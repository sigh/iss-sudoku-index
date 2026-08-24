// Title: Weather Vanes
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=ARcnCR71Isw
// Source: https://app.crackingthecryptic.com/sudoku/mbrRhLQnBh
//
// Normal sudoku rules apply (standard 3x3 boxes; the payload's own `regions`
// array lists the ordinary nine boxes, so no explicit Regions constraint is
// needed). In cages, digits sum to the small value in the top-left corner of
// the cage, and cannot repeat within a cage -> Cage (sum + all-different).
// Digits on a line must be strictly smaller than one of the two
// corresponding circled digits and strictly larger than the other -> Between,
// whose first/last cell are the two circled ends and whose middle cells are
// constrained strictly between them, matching the rule's "one bigger, one
// smaller, either order" reading exactly. The grid draws four plus-shaped
// crosses (a 5-cell arm crossing a 3-cell arm); each arm is its own line with
// a circle at each end, so each cross becomes two independent Between
// constraints sharing their centre cell.

return [
  new Cage(10, 'R1C1', 'R1C2', 'R2C1', 'R3C1'),
  new Cage(14, 'R2C5', 'R3C5', 'R3C6', 'R3C7'),
  new Cage(20, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(17, 'R3C3', 'R4C3', 'R5C2', 'R5C3'),
  new Cage(28, 'R5C7', 'R5C8', 'R6C7', 'R7C7'),
  new Cage(23, 'R7C3', 'R7C4', 'R7C5', 'R8C5'),
  new Cage(12, 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(10, 'R7C9', 'R8C9', 'R9C8', 'R9C9'),

  // Vane A, centre R3C2.
  new Between('R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Between('R3C1', 'R3C2', 'R3C3'),

  // Vane B, centre R2C7.
  new Between('R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Between('R1C7', 'R2C7', 'R3C7'),

  // Vane C, centre R7C8.
  new Between('R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'),
  new Between('R7C7', 'R7C8', 'R7C9'),

  // Vane D, centre R8C3.
  new Between('R7C3', 'R8C3', 'R9C3'),
  new Between('R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5'),
];
