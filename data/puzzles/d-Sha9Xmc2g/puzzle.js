// Title: Refractions
// Author: Nell Gwyn
// Video: https://www.youtube.com/watch?v=d-Sha9Xmc2g
// Source: https://sudokupad.app/qdr9xurd28

// Normal sudoku rules apply. No given digits.
// Gray lines are palindromes; pink lines are renban lines.
// Arrow shafts sum to their circle digit. Black dots mark 1:2 ratios; dots are
// not negative, so undotted adjacent pairs have no Kropki restriction.

return [
  new Shape('9x9'),

  // Gray palindrome lines, from the drawn paths.
  new Palindrome('R3C1', 'R2C2', 'R3C3', 'R2C4', 'R3C5', 'R2C6'),
  new Palindrome('R1C7', 'R2C8', 'R3C7', 'R4C8', 'R5C7', 'R6C8'),
  new Palindrome('R9C3', 'R8C2', 'R7C3', 'R6C2', 'R5C3', 'R4C2'),
  new Palindrome('R7C9', 'R8C8', 'R7C7', 'R8C6', 'R7C5', 'R8C4'),

  // Pink renban lines, from the drawn paths.
  new Renban('R4C1', 'R5C1', 'R6C1'),
  new Renban('R1C4', 'R1C5', 'R1C6'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
  new Renban('R9C4', 'R8C5', 'R9C6'),
  new Renban('R5C6', 'R5C5'),
  new Renban('R6C5', 'R6C4'),

  // Arrows: circle followed by the shaft cells, from the drawn paths.
  new Arrow('R1C2', 'R2C3', 'R3C2', 'R2C1'),
  new Arrow('R2C9', 'R3C8', 'R2C7', 'R1C8'),
  new Arrow('R8C1', 'R7C2', 'R8C3', 'R9C2'),
  new Arrow('R9C8', 'R8C7', 'R7C8', 'R8C9'),

  // Black Kropki dots (1:2 ratio), from the drawn dot positions.
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R9C5', 'R8C5'),
  new BlackDot('R6C2', 'R6C1'),
  new BlackDot('R5C9', 'R5C8'),
];
