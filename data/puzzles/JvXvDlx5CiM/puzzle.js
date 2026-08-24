// Title: L+
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=JvXvDlx5CiM
// Source: https://app.crackingthecryptic.com/sudoku/jbhNgft4jG

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). One given digit. Two killer cages carry a
// printed sum (distinct + sum -> Cage); two more are drawn with no total,
// so only their all-different membership is encoded (AllDifferent), per
// "digits cannot repeat within cages". Digits along an arrow sum to the
// digit in the arrow's bulb cell (the first cell of each Arrow below); the
// arm permits repeated digits.

return [
  new Shape('9x9'),

  new Given('R1C3', 2),

  // Cages, from the payload's cage array (top-left small-clue totals where
  // printed). The no-total pair (R4C1,R4C2) and cross (centred R5C5) still
  // forbid repeats within themselves per the rules text.
  new Cage(11, 'R2C1', 'R3C1'),
  new AllDifferent('R4C1', 'R4C2'),
  new AllDifferent(
    'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5',
    'R5C3', 'R5C4', 'R5C6', 'R5C7'),
  new Cage(11, 'R6C8', 'R6C9'),
  new Cage(9, 'R7C9', 'R8C9'),

  // Arrows: bulb cell first, then the arm, read from the drawn waypoints
  // (bulb = the endpoint carrying the circle mark).
  new Arrow('R1C5', 'R2C5', 'R3C5'),
  new Arrow('R5C7', 'R5C8', 'R5C9'),
  new Arrow('R5C3', 'R5C2', 'R5C1'),
  new Arrow('R6C4', 'R7C3', 'R8C2', 'R9C1'),
  new Arrow('R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R4C4', 'R4C3', 'R3C2'),
  new Arrow('R6C6', 'R6C7', 'R7C8', 'R7C7'),
  new Arrow('R7C5', 'R8C5', 'R9C5'),
  new Arrow('R9C3', 'R8C4'),
  new Arrow('R1C7', 'R2C6'),
];
