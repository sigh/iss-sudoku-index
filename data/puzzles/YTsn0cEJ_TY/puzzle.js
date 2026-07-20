// Title: Get Your Crayons
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=YTsn0cEJ_TY
// Source: https://sudokupad.app/97wi902h8v

// The outside 33 clues sum their indicated diagonals. Kropki dots are not
// negative: an unmarked adjacent pair has no extra restriction.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const littleKillers = [
  LittleKiller.fromCells(33,
    graph.ray('R3C9', 1, -1),
    geometry),
  LittleKiller.fromCells(33,
    graph.ray('R9C6', -1, -1),
    geometry),
];

const whiteDots = [
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R3C6', 'R4C6'),
  new WhiteDot('R4C6', 'R4C7'),
  new WhiteDot('R6C5', 'R6C6'),
  new WhiteDot('R6C5', 'R7C5'),
  new WhiteDot('R7C5', 'R7C6'),
];

const blackDots = [
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R6C6', 'R7C6'),
  new BlackDot('R4C5', 'R5C5'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new AntiKing(),
  ...littleKillers,
  ...whiteDots,
  ...blackDots,
];
