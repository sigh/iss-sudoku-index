// Title: Three of a Kind
// Author: apiyo
// Video: https://www.youtube.com/watch?v=Donhjrl-V1g
// Source: https://app.crackingthecryptic.com/webapp/M4Hjb83P9G

// Normal sudoku (default row/col/box all-different). Anti-knight globally.
// Three grey palindrome lines. Six outside Little-Killer-style diagonal-sum
// clues (repeats allowed along a diagonal except where two of its cells share
// a 3x3 box, which the default box all-different already covers).
//
// Little Killer cell lists below are transcribed from each drawn arrow's own
// waypoints (ray direction through the boundary vertex it touches), not from
// payload array order.

const geometry = cellGeometry(9);

const littleKillers = [
  [39, ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6']],
  [35, ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9']],
  [19, ['R1C7', 'R2C8', 'R3C9']],
  [20, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [22, ['R6C9', 'R7C8', 'R8C7', 'R9C6']],
  [14, ['R8C9', 'R9C8']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

const palindromes = [
  ['R3C2', 'R2C3', 'R1C4'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R5C2', 'R6C3', 'R7C4', 'R8C5'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...palindromes,
  ...littleKillers,
];
