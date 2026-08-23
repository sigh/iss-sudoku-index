// Title: Search Nine
// Author: Clover!
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://app.crackingthecryptic.com/sudoku/n3MFRmd3Fb

// Rules encoded:
// - Normal sudoku rules (default Shape('9x9'): row/column/box all-different).
// - An arrow cell's digit gives the distance, in the direction the arrow
//   points, to the cell holding a 9 in that row or column: "An arrow
//   indicates that 9 appears in that number of cells in that direction (for
//   instance, a 1 in an arrow cell indicates that 9 appears in the adjacent
//   cell in that direction)." There are 17 arrows, each drawn as a short
//   directional stroke inside a single cell (the cell/direction table below
//   is read from the drawn waypoints).

const nine = new Var('N', 'nine', 1);

// [locator cell, dr, dc] -- direction the drawn arrow points.
const arrows = [
  ['R1C3', 1, 0], ['R2C3', 1, 0], ['R1C7', 1, 0], ['R2C7', 1, 0],
  ['R3C5', 0, 1], ['R4C4', 0, 1],
  ['R5C3', 0, -1], ['R5C7', 0, -1], ['R6C6', 0, -1],
  ['R7C4', -1, 0], ['R8C4', -1, 0], ['R8C6', -1, 0], ['R9C6', -1, 0],
  ['R9C2', -1, 0], ['R9C3', -1, 0], ['R9C7', -1, 0], ['R9C8', -1, 0],
];

// For each arrow cell, the ray of cells strictly in the arrow's direction
// (excluding the arrow cell itself), stopping at the grid edge -- a search
// past the edge is impossible, so this also caps the arrow cell's own digit
// at the ray length (e.g. an up-arrow on row 7 can only reach digits 1-6).
// ValueIndexing(valueCell, controlCell, ...indexedCells) is a 1-indexed
// dereference: it forces controlCell to the index i with
// indexedCells[i-1] == valueCell. Pinning valueCell to 9 turns that into
// "controlCell's digit = distance to the 9".
const searchArrows = arrows.map(([cellId, dr, dc]) => {
  const { row, col } = parseCellId(cellId);
  const ray = [];
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
    ray.push(makeCellId(r, c));
    r += dr; c += dc;
  }
  return new ValueIndexing(nine.cell(1), cellId, ...ray);
});

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R1C9', 5),
  new Given('R2C1', 3),
  new Given('R2C9', 7),
  new Given('R3C1', 5),
  new Given('R3C9', 9),
  new Given('R4C2', 5),
  new Given('R7C6', 6),
  new Given('R8C5', 5),
  new Given('R9C4', 4),
  nine,
  new Given(nine.cell(1), 9),
  ...searchArrows,
];
