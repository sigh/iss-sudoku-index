// Title: Multi-Coloured Insect
// Author: SF Steve
// Video: https://www.youtube.com/watch?v=KuoHnOzDsnQ
// Source: https://app.crackingthecryptic.com/sudoku/gTpgbhLD96

// Normal sudoku rules apply (standard 3x3 box regions, no given digits).
// Digits read the same both ways along each grey palindrome line -> Palindrome.
// An X between two neighbouring cells means they sum to 10; a V means they
// sum to 5 -> Sum(10, ...) / Sum(5, ...) per marked pair. "Not all Xs and Vs
// are given" (rules text) means unmarked neighbouring pairs carry no
// information, so no negative constraint is added for them.
// The 2x2 cage sums to 17 with no repeated digit (standard killer-cage
// semantics) -> Cage(17, ...).
//
// Two X dots (R2C9/R3C9 and R9C2/R9C3) land on an edge that is also part of
// a palindrome line's path; this is incidental overlap between two
// independent clues (the dot and the line), not a split of the line into
// separate clues, so both constraints are encoded on the same cells.

return [
  new Shape('9x9'),

  // Killer cage, sum 17, no repeats. Cells from payload cages[0].
  new Cage(17, 'R2C2', 'R2C3', 'R3C3', 'R3C2'),

  // Palindrome lines (grey). Cell paths from payload lines[].
  new Palindrome('R2C9', 'R3C9', 'R3C8', 'R4C7', 'R5C7', 'R6C7'),
  new Palindrome('R8C8', 'R7C7', 'R6C6', 'R5C5'),
  new Palindrome('R2C8', 'R1C7', 'R1C6'),
  new Palindrome('R1C5', 'R1C4', 'R2C3'),
  new Palindrome('R3C2', 'R4C1', 'R5C1'),
  new Palindrome('R6C1', 'R7C1', 'R8C2'),
  new Palindrome('R9C2', 'R9C3', 'R8C3', 'R7C4', 'R7C5', 'R7C6'),

  // X dots (sum 10). Edge pairs from payload overlays[] (text="X").
  new Sum(10, 'R2C9', 'R3C9'),
  new Sum(10, 'R5C9', 'R6C9'),
  new Sum(10, 'R4C8', 'R5C8'),
  new Sum(10, 'R5C6', 'R5C7'),
  new Sum(10, 'R4C6', 'R5C6'),
  new Sum(10, 'R6C5', 'R7C5'),
  new Sum(10, 'R6C4', 'R6C5'),
  new Sum(10, 'R8C4', 'R8C5'),
  new Sum(10, 'R9C2', 'R9C3'),
  new Sum(10, 'R7C2', 'R8C2'),
  new Sum(10, 'R2C5', 'R3C5'),

  // V dots (sum 5). Edge pairs from payload overlays[] (text="V").
  new Sum(5, 'R3C8', 'R4C8'),
  new Sum(5, 'R4C7', 'R4C8'),
  new Sum(5, 'R4C5', 'R4C6'),
  new Sum(5, 'R2C5', 'R2C6'),
  new Sum(5, 'R1C5', 'R1C6'),
  new Sum(5, 'R5C4', 'R6C4'),
  new Sum(5, 'R5C2', 'R6C2'),
  new Sum(5, 'R5C1', 'R6C1'),
  new Sum(5, 'R8C3', 'R8C4'),
  new Sum(5, 'R7C4', 'R8C4'),
];
