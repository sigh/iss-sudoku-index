// Title: Power Up!
// Author: TheAsylm
// Video: https://www.youtube.com/watch?v=lbTvr5Ocd3k
// Source: https://sudokupad.app/hMpJGmdHJ6

// Normal Sudoku and the drawn 3x3 regions are encoded. The Japanese Sums rule is omitted: the local
// exterior coloured-clue artwork does not yield a reading that accepts the
// source answer without choosing an interpretation from that answer.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...graph.boxes().map(cells => new Jigsaw('9x9', ...cells)),
];
