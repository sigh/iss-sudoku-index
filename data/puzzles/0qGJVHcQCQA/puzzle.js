// Title: X-clusivity
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=0qGJVHcQCQA
// Source: https://app.crackingthecryptic.com/sudoku/JGG2RDFhJq

// Rules:
//   1. Normal sudoku rules apply.
//   2. Each line consists of one or more non-overlapping groups of consecutive
//      cells, each of which sums to 10.
//   3. No two of these groups may have the same fill (including permutations),
//      even if they are on different lines.
//
// Rules 1 and 2 are encoded below. Rule 3 is OMITTED: which consecutive-group
// partition a line takes is chosen by the solver and is not exposed by any
// constraint, so there is nothing to compare the group fills of -- and the
// comparison itself is between variable-length digit multisets drawn from
// separate lines, which no per-line constraint can see. The puzzle prints no
// given digits, so what remains below is a weak model of the puzzle.
//
// Line cell paths transcribed from the six drawn grey strokes, in the order
// the waypoints run; each path is one line of the rules.

const lines = [
  ['R1C7', 'R2C7', 'R3C7', 'R4C7'],
  ['R4C5', 'R3C6', 'R2C5', 'R1C4', 'R2C3'],
  ['R6C9', 'R7C9', 'R8C9', 'R8C8', 'R8C7'],
  ['R8C5', 'R7C6', 'R7C5', 'R7C4'],
  ['R9C1', 'R9C2', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R5C5', 'R5C6',
   'R5C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R3C2', 'R2C2', 'R1C1', 'R2C1', 'R3C1'],
];

return [
  new Shape('9x9'),

  // SumLine divides the whole line into consecutive segments each summing to
  // the given total, which is rule 2's partition.
  ...lines.map((cells) => new SumLine(10, ...cells)),
];
