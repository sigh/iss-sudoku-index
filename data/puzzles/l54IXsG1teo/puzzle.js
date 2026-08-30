// Title: Tetris Sudoku
// Author: Alice
// Video: https://www.youtube.com/watch?v=l54IXsG1teo
// Source: https://cracking-the-cryptic.web.app/sudoku/fgQRNPM3r7

// Normal sudoku. In each 3x3 box, the four cells holding digits 1, 2, 3 and 4
// are orthogonally edge-connected -- any connected arrangement of four cells
// is a tetromino by definition, so this is exactly "1,2,3,4 form a
// tetromino" in that box. No cages, lines or other geometry are drawn.

const graph = cellGraph('9x9');
const boxes = graph.boxes();

// Every connected 4-cell subset of a box's 9 cells, derived from the box's
// own adjacency (graph.neighbours restricted to the box) rather than an
// assumed row-major layout.
const connectedQuads = cells => {
  const cellSet = new Set(cells);
  const localNeighbours = new Map(
    cells.map(cell => [cell, graph.neighbours(cell).filter(n => cellSet.has(n))]));

  const quads = [];
  const choose = (start, chosen) => {
    if (chosen.length === 4) { quads.push([...chosen]); return; }
    for (let i = start; i < cells.length; i++) {
      chosen.push(cells[i]);
      choose(i + 1, chosen);
      chosen.pop();
    }
  };
  choose(0, []);

  return quads.filter(quad => {
    const quadSet = new Set(quad);
    const seen = new Set([quad[0]]);
    const stack = [quad[0]];
    while (stack.length) {
      const cell = stack.pop();
      for (const n of localNeighbours.get(cell)) {
        if (quadSet.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
      }
    }
    return seen.size === 4;
  });
};

// For a box's all-different 9 cells, restricting some 4-cell subset to
// {1,2,3,4} forces it to hold exactly that set (4 cells, 4 values, all
// different), so no separate constraint on the other 5 cells is needed.
const boxTetrominoRules = boxes.map(box => new Or(
  connectedQuads(box).map(quad =>
    new And(quad.map(cell => new Given(cell, 1, 2, 3, 4))))));

const givens = [
  ['R1C3', 8], ['R1C4', 6], ['R1C5', 9], ['R1C8', 3],
  ['R2C1', 3], ['R2C3', 6], ['R2C6', 2], ['R2C7', 5],
  ['R3C1', 5], ['R3C2', 2], ['R3C8', 8],
  ['R4C4', 9], ['R4C9', 5],
  ['R5C5', 1],
  ['R6C1', 4], ['R6C6', 6], ['R6C9', 7],
  ['R7C2', 3], ['R7C8', 7],
  ['R8C3', 1], ['R8C4', 3], ['R8C7', 9], ['R8C9', 4],
  ['R9C5', 4], ['R9C6', 7], ['R9C7', 8],
]; // transcribed from the puzzle's printed givens

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...boxTetrominoRules,
];
