// Title: The French Connec7ion
// Author: Zombie Hunter
// Video: https://www.youtube.com/watch?v=lh6wjgVHENc
// Source: https://app.crackingthecryptic.com/sudoku/rPbrd838pr

// Normal sudoku rules apply (default row/column/box all-different). One
// given: R9C8=8. Four cages: digits in a cage sum to the small clue in its
// top-left cell and do not repeat. Fifteen arrows: the digit in the circled
// bulb cell equals the sum of the digits on the rest of the arrow's line;
// several arrows share a bulb cell. Arrow(...) takes the circle cell first,
// per its constructor.

return [
  new Shape('9x9'),

  new Given('R9C8', 8),

  new Cage(15, 'R1C1', 'R1C2'),
  new Cage(15, 'R1C8', 'R1C9'),
  new Cage(12, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(10, 'R4C3', 'R5C3', 'R6C3'),

  new Arrow('R1C5', 'R1C4', 'R1C3'),
  new Arrow('R1C5', 'R1C6', 'R1C7'),
  new Arrow('R2C1', 'R3C1', 'R2C2', 'R3C2'),
  new Arrow('R2C9', 'R3C9', 'R2C8', 'R3C8'),
  new Arrow('R5C2', 'R5C1', 'R6C2'),
  new Arrow('R5C8', 'R5C9', 'R6C8'),
  new Arrow('R8C9', 'R7C9', 'R8C8', 'R7C8'),
  new Arrow('R8C1', 'R7C1', 'R8C2', 'R7C2'),
  new Arrow('R9C5', 'R9C4', 'R9C3'),
  new Arrow('R9C5', 'R9C6', 'R9C7'),
  new Arrow('R6C6', 'R6C5', 'R5C6'),
  new Arrow('R4C4', 'R4C5', 'R5C4'),
  new Arrow('R5C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R6C4', 'R7C3'),
];
