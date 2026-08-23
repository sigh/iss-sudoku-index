// Title: Louis XV
// Author: filuta
// Video: https://www.youtube.com/watch?v=Jq2VZkolJhA
// Source: https://app.crackingthecryptic.com/sudoku/3dr6pFrqpP

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Only row 9 carries printed givens. X: adjacent cells sum to 10.
// V: adjacent cells sum to 5. "All possible Vs and Xs are given" is the
// exhaustiveness clause, encoded with StrictXV(): every orthogonally adjacent
// pair not covered by an explicit X or V below sums to neither 5 nor 10.
return [
  new Shape('9x9'),

  new Given('R9C4', 9), new Given('R9C5', 3), new Given('R9C6', 1),
  new Given('R9C7', 7), new Given('R9C8', 2), new Given('R9C9', 4),

  new V('R4C2', 'R5C2'), new V('R3C3', 'R3C4'), new V('R3C6', 'R3C7'),
  new V('R4C4', 'R5C4'), new V('R4C6', 'R5C6'), new V('R4C8', 'R5C8'),
  new V('R8C1', 'R8C2'), new V('R8C5', 'R9C5'), new V('R8C8', 'R9C8'),

  new X('R6C2', 'R6C3'), new X('R7C2', 'R7C3'),

  new StrictXV(),
];
