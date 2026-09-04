// Title: Irregular Frame Sudoku
// Author: Florian Zellmer
// Video: https://www.youtube.com/watch?v=dW5mYUi0XkQ
// Source: https://cracking-the-cryptic.web.app/sudoku/PgT3LMDHG4

// Normal sudoku rules apply. Each number outside the grid is the sum of
// either the first two or the first three cells nearest to it in its row or
// column -- the rules panel reads "Numbers outside the grid indicate the sum
// of the first two OR three neighboring cells." That is a per-clue choice
// between the two readings, encoded below as Or(Sum of nearest 2, Sum of
// nearest 3).

const graph = cellGraph('9x9');

// Outside clue values transcribed from the payload's overlay array (36 text
// overlays, one on every side of every row and column), matched against the
// video's rules-panel frame.
const clues = [
  // side, row/column index (1-9), printed total
  ['top', 1, 11], ['top', 2, 13], ['top', 3, 13], ['top', 4, 10], ['top', 5, 8],
  ['top', 6, 19], ['top', 7, 13], ['top', 8, 19], ['top', 9, 10],
  ['bottom', 1, 16], ['bottom', 2, 15], ['bottom', 3, 10], ['bottom', 4, 5],
  ['bottom', 5, 18], ['bottom', 6, 17], ['bottom', 7, 6], ['bottom', 8, 10],
  ['bottom', 9, 11],
  ['left', 1, 7], ['left', 2, 17], ['left', 3, 14], ['left', 4, 19], ['left', 5, 8],
  ['left', 6, 9], ['left', 7, 8], ['left', 8, 6], ['left', 9, 17],
  ['right', 1, 10], ['right', 2, 18], ['right', 3, 6], ['right', 4, 6], ['right', 5, 8],
  ['right', 6, 23], ['right', 7, 9], ['right', 8, 13], ['right', 9, 8],
];

// The 3 cells nearest the clue, in order moving away from the edge.
function nearestThree(side, index) {
  switch (side) {
    case 'top': return graph.ray(makeCellId(1, index), 1, 0).slice(0, 3);
    case 'bottom': return graph.ray(makeCellId(9, index), -1, 0).slice(0, 3);
    case 'left': return graph.ray(makeCellId(index, 1), 0, 1).slice(0, 3);
    case 'right': return graph.ray(makeCellId(index, 9), 0, -1).slice(0, 3);
  }
}

return [
  new Shape('9x9'),
  ...clues.map(([side, index, target]) => {
    const [c1, c2, c3] = nearestThree(side, index);
    return new Or([
      new Sum(target, c1, c2),
      new Sum(target, c1, c2, c3),
    ]);
  }),
];
