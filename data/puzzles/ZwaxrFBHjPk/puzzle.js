// Title: King's Siege
// Author: Sniglett
// Video: https://www.youtube.com/watch?v=ZwaxrFBHjPk
// Source: https://sudokupad.app/zfubywuj8d

// Normal sudoku rules apply (default row/column/box all-different).
// Anti-king: a digit cannot repeat a king's move (orthogonally or
// diagonally adjacent) away from itself.
// Fortress: four 3x3 blocks, each named by its centre cell below. A block's
// eight perimeter cells are each constrained against whichever of their
// orthogonal neighbours lie outside the block -- corner-of-block cells have
// two such outside neighbours, edge-of-block cells have one. Red-fortress
// perimeter digits must be greater than those outside neighbours; blue
// perimeter digits must be lesser.
// Arrow: digits along the arrow sum to the digit in its attached circle.

// Build the GreaterThan constraints (one per perimeter cell) for the 3x3
// fortress block centred on (centerRow, centerCol).
const fortress = (centerRow, centerCol, relation) => {
  const inBlock = (row, col) =>
    Math.abs(row - centerRow) <= 1 && Math.abs(col - centerCol) <= 1;

  const perimeterOffsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  return perimeterOffsets.map(([dRow, dCol]) => {
    const row = centerRow + dRow;
    const col = centerCol + dCol;
    const outsideNeighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .filter(([r, c]) => !inBlock(r, c))
      .map(([r, c]) => makeCellId(r, c));
    const perimeterCell = makeCellId(row, col);
    // GreaterThan pairs each cell with every later-listed grid-adjacent
    // cell as (earlier > later), so list the greater side first.
    const cells = relation === 'greater'
      ? [perimeterCell, ...outsideNeighbors]
      : [...outsideNeighbors, perimeterCell];
    return new GreaterThan(...cells);
  });
};

return [
  new Shape('9x9'),
  new AntiKing(),

  // Red fortresses (perimeter > outside neighbours).
  ...fortress(3, 3, 'greater'),
  ...fortress(7, 7, 'greater'),

  // Blue fortresses (perimeter < outside neighbours).
  ...fortress(7, 3, 'lesser'),
  ...fortress(3, 7, 'lesser'),

  // Arrows: sum of the line cells equals the circled cell.
  new Arrow('R7C3', 'R7C4', 'R7C5', 'R6C6'),
  new Arrow('R4C4', 'R5C5', 'R4C6', 'R3C7'),
];
