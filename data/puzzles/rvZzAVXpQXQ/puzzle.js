// Title: Powers of 2 Sudoku
// Author: Sajjad Heydari
// Video: https://www.youtube.com/watch?v=rvZzAVXpQXQ
// Source: https://app.crackingthecryptic.com/webapp/b8BtQTBqdd

// Normal sudoku rules apply. Identical digits cannot touch each other
// diagonally (king sudoku) -- AntiKing forbids a repeat on any king's-move
// step; the orthogonal case is already covered by row/column all-different,
// so only the diagonal case adds anything new, matching the stated rule.
// Sandwich clues outside the grid show the sum of the digits strictly
// between the 1 and the 9 in that row/column; only row 4 (32) and column 5
// (16) carry a drawn clue (both text overlays in the payload).
// In row/column X, the digits of 2^X appear in that row/column in the
// correct order, left-to-right for rows and top-to-bottom for columns,
// though not necessarily consecutively (worked example in the rules: row 7,
// 2^7 = 128, so 1 must appear before 2, which appears before 8). For X in
// {1,2,3}, 2^X is a single digit (2, 4, 8) and the rule is automatically
// true -- every digit appears once per row/column by normal sudoku -- so no
// constraint is added for those; only X in {4..9} constrains anything.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Required digit order for 2^X, X = 4..9 (2^4=16 .. 2^9=512), read as the
// decimal digits of 2^X in order.
const powerDigitOrder = [
  [4, [1, 6]],
  [5, [3, 2]],
  [6, [6, 4]],
  [7, [1, 2, 8]],
  [8, [2, 5, 6]],
  [9, [5, 1, 2]],
];

// A '.*d1.*d2.*...*' Regex over the whole row/column enforces that d1's cell
// precedes d2's, which precedes d3's, etc., with any digits (and any gaps)
// elsewhere -- exactly "in the correct order, not necessarily consecutively".
function orderPattern(digits) {
  return '.*' + digits.join('.*') + '.*';
}

const powerOfTwoOrders = powerDigitOrder.flatMap(([x, digits]) => [
  new Regex(orderPattern(digits), ...graph.row(x)),
  new Regex(orderPattern(digits), ...graph.column(x)),
]);

return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C9', 8),
  new Given('R2C2', 2),
  new Given('R3C2', 8),
  new Given('R4C5', 2),
  new Given('R5C3', 2), new Given('R5C5', 5), new Given('R5C7', 6),
  new Given('R6C5', 6), new Given('R6C7', 4),
  new Given('R7C1', 4),
  new Given('R9C1', 8), new Given('R9C6', 4),
  new AntiKing(),
  Sandwich.fromCells(32, graph.row(4), geometry),
  Sandwich.fromCells(16, graph.column(5), geometry),
  ...powerOfTwoOrders,
];
