// Title: Arrows and Palindromes
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=1C9zTv9nSNg
// Source: https://app.crackingthecryptic.com/sudoku/NFtDJgN9jG

// Rules:
// - Normal Sudoku (rows, columns, standard 3x3 boxes; no given digits).
// - The digits on an arrow's path add to the digit in that arrow's circled
//   cell. Digits may repeat on an arrow if the other rules allow it.
// - Digits on a grey line form a palindrome.
// Every drawn feature is encoded; nothing is omitted.

return [
  new Shape('9x9'),

  // Three grey zigzag lines, read off the drawn strokes.
  new Palindrome('R2C1', 'R1C2', 'R2C3', 'R1C4', 'R2C5', 'R1C6'),
  new Palindrome('R5C1', 'R4C2', 'R5C3', 'R4C4', 'R5C5', 'R4C6'),
  new Palindrome('R8C1', 'R7C2', 'R8C3', 'R7C4', 'R8C5', 'R7C6'),

  // Seven arrows drawn as a circled bulb plus a shaft ending in an arrowhead.
  new Arrow('R2C1', 'R3C2', 'R4C1', 'R5C1'),
  new Arrow('R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Arrow('R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Arrow('R6C3', 'R6C4', 'R6C5'),
  new Arrow('R9C2', 'R8C2', 'R9C1'),
  new Arrow('R8C4', 'R9C4', 'R8C5'),
  new Arrow('R9C6', 'R9C7', 'R9C8', 'R9C9'),

  // Three further circled bulbs sit in column 8 at R2C8, R5C8 and R8C8, each
  // with a short stroke running down into column 8 of the row below. That
  // stroke does not stop at the cell centre: it ends exactly on the shaft of
  // the row-3 / row-6 / row-9 arrow above, forming a T-junction there. So each
  // is the tail of a branch arrow that merges into the long arrow and shares
  // its arrowhead in column 9. Tracing from the bulb towards an arrowhead --
  // the only direction an arrow path may be read, and the only branch of the
  // junction that reaches a head, since turning the other way runs back to the
  // circled bulb in column 6 -- gives the path C8 then C9 in the merged row.
  new Arrow('R2C8', 'R3C8', 'R3C9'),
  new Arrow('R5C8', 'R6C8', 'R6C9'),
  new Arrow('R8C8', 'R9C8', 'R9C9'),
];
