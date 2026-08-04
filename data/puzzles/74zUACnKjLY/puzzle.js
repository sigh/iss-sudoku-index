// Title: Twenty-Three
// Author: Blobz
// Video: https://www.youtube.com/watch?v=74zUACnKjLY
// Source: https://app.crackingthecryptic.com/sudoku/j8bDLhfTT3

// Normal sudoku rules apply (standard 3x3 boxes, as drawn). Digits in cages
// do not repeat, and must sum to the small clue in the cage's top-left
// corner when one is given. Two 9-cell cages have no total; the no-repeat
// rule alone forces each to hold every digit 1-9 once, so they are encoded
// as AllDifferent rather than as a Cage with an empty sum.
// Adjacent digits along a green line must differ by at least 5 (Whisper).
// The second and third lines share cell R5C7 (a branch point drawn as one
// connected line with three arms); encoded as two Whisper groups so the
// three pairwise edges at R5C7 are all covered without implying a fixed
// traversal order through the branch.

return [
  new Shape('9x9'),

  new Given('R9C3', 2),
  new Given('R9C4', 3),

  // Cages with a stated total of 23.
  new Cage(23, 'R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R2C4'),
  new Cage(23, 'R2C1', 'R3C1', 'R3C2', 'R4C2'),
  new Cage(23, 'R7C1', 'R8C1', 'R8C2', 'R9C2'),
  new Cage(23, 'R8C6', 'R8C7', 'R8C8', 'R9C6', 'R9C7', 'R9C8'),
  new Cage(23, 'R5C8', 'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(23, 'R6C4', 'R6C5', 'R6C6', 'R7C4'),
  new Cage(23, 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(23, 'R1C4', 'R1C5', 'R1C6', 'R2C6'),

  // Two 9-cell cages drawn with no total (shaded green regions in the
  // source). No sum to enforce, only the no-repeat rule.
  new AllDifferent(
    'R3C3', 'R3C4', 'R4C4', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R7C2', 'R7C3'),
  new AllDifferent(
    'R3C6', 'R3C7', 'R4C7', 'R5C6', 'R5C7', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),

  // Green whisper lines, difference >= 5.
  new Whisper(5, 'R3C4', 'R4C4', 'R5C4', 'R5C3', 'R5C2', 'R6C2', 'R7C2'),
  new Whisper(5, 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6'),
  new Whisper(5, 'R5C6', 'R5C7'),
];
