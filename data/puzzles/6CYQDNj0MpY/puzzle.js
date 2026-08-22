// Title: W Pentominoes
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=6CYQDNj0MpY
// Source: https://app.crackingthecryptic.com/sudoku/7BtmQgjnd6

// Normal sudoku rules apply (standard row/column/box all-different, from the
// default Shape). In cages, digits sum to the small clue in the cage's
// top-left cell and cannot repeat within the cage. Four of the cages are
// drawn as five-cell W-pentomino staircases (the puzzle's title), but the
// rules text states no rule beyond cage sum/no-repeat, so the pentomino
// shape carries no additional constraint and is not separately encoded.

return [
  new Shape('9x9'),

  new Cage(15, 'R2C1', 'R3C1', 'R3C2', 'R4C2', 'R4C3'),
  new Cage(16, 'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R3C4'),
  new Cage(9, 'R1C5', 'R1C6'),
  new Cage(8, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(13, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(12, 'R5C1', 'R6C1'),
  new Cage(12, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(10, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(11, 'R9C4', 'R9C5'),
  new Cage(34, 'R7C6', 'R8C6', 'R8C7', 'R9C7', 'R9C8'),
  new Cage(35, 'R6C7', 'R6C8', 'R7C8', 'R7C9', 'R8C9'),
  new Cage(10, 'R4C9', 'R5C9'),
];
