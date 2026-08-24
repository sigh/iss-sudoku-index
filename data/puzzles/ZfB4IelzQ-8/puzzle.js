// Title: The Great Wave off Kanagawa
// Author: Tundra Lava
// Video: https://www.youtube.com/watch?v=ZfB4IelzQ-8
// Source: https://app.crackingthecryptic.com/sudoku/j3gbPrGt2h

// Normal sudoku rules (standard 3x3 boxes, from the payload's own regions).
// Digits along an arrow sum to the digit in its circle (Arrow). Two of the
// five arrows share one circle at R7C7 -- see the note below.
// Clues outside the grid give the sum of the diagonal they indicate, repeats
// allowed (LittleKiller; no all-different is placed on either diagonal).
// Grey lines are palindromes (Palindrome).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Arrows: constructor order is [circleCell, ...tailCells]. The payload draws
// 5 in-grid arrows but only 4 circle overlays (at R4C9, R1C6, R7C7, R7C3): no
// circle is drawn at R7C8. The fifth arrow's tail leaves its (ambiguous)
// start point on the side facing away from the R7C7 circle, matching the
// offset pattern every other arrow's start point shows relative to its own
// circle, so it is read as a second arrow sharing the R7C7 circle rather
// than an unmarked circle at R7C8.
const arrows = [
  new Arrow('R4C9', 'R3C9', 'R3C8'),
  new Arrow('R1C6', 'R1C7', 'R2C7', 'R3C7'),
  new Arrow('R7C7', 'R6C6'),
  new Arrow('R7C7', 'R7C8', 'R8C8'),
  new Arrow('R7C3', 'R6C2', 'R5C2', 'R4C2'),
];

// Outside diagonal-sum clues. Direction (which way each ray runs from its
// grid-edge start cell) is taken from the drawn arrow-shaped ray's own slope,
// not the source array order.
const littleKillers = [
  LittleKiller.fromCells(12, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C9', 1, -1), geometry),
];

// Palindrome lines (grey). A 2-cell line just forces its two cells equal.
const palindromes = [
  new Palindrome('R1C4', 'R1C3', 'R2C2'),
  new Palindrome('R3C3', 'R4C4'),
  new Palindrome('R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7'),
  new Palindrome('R6C5', 'R7C6'),
  new Palindrome('R9C7', 'R9C6', 'R8C5'),
  new Palindrome('R9C5', 'R9C4', 'R8C3', 'R7C2', 'R6C1'),
];

return [
  new Shape('9x9'),
  new Given('R2C1', 9),
  new Given('R2C4', 4),
  new Given('R5C1', 8),
  new Given('R5C4', 5),
  new Given('R8C1', 7),
  new Given('R8C4', 6),
  ...arrows,
  ...littleKillers,
  ...palindromes,
];
