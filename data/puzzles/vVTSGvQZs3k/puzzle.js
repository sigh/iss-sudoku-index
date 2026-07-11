// Title: The Triple Crown
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=vVTSGvQZs3k
// Source: https://sudokupad.app/7m7iluxxil

// Normal sudoku rules apply. Digits cannot repeat on the thin blue diagonal
// running from R9C1 to R1C9. Cells that appear in the same relative position
// of their 3x3 box may not contain the same digit. Digits in a cage sum to
// the small clue in the cage's top left corner, and do not repeat within the
// cage. Digits on a pink line form a set of non-repeating, consecutive
// digits in any order. The 3x3 box borders divide each thick blue line into
// segments; each segment along an individual line must have the same sum.

const constraints = [
  new Shape('9x9'),

  // Thin blue diagonal, R9C1-R1C9, non-repeating digits.
  new Diagonal(1),

  // Disjoint groups: same relative position within each box is all-different.
  new DisjointSets(),

  // Killer cages.
  new Cage(15, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(12, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(15, 'R8C9', 'R9C8', 'R9C9'),

  // Pink Renban lines.
  new Renban('R2C2', 'R2C3', 'R3C2'),
  new Renban('R2C7', 'R3C7', 'R3C8'),
  new Renban('R8C1', 'R8C2', 'R9C2'),
  new Renban('R7C9', 'R8C8', 'R9C7'),
  new Renban('R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'),
  new Renban('R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),

  // Thick blue equal-segment-sum lines.
  new RegionSumLine('R3C5', 'R4C5', 'R5C4', 'R5C3'),
  new RegionSumLine('R5C7', 'R5C6', 'R6C5', 'R7C5'),
  new RegionSumLine('R4C7', 'R5C8', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C5', 'R7C4'),
];

return constraints;
