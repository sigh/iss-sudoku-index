// Title: CRICKING THE CR#PTIC
// Author: pb45
// Video: https://www.youtube.com/watch?v=kyWsxpjAXsY
// Source: https://sudokupad.app/nxmw997fai

// Normal sudoku rules apply. Three of the nine 3x3 boxes are Magic Squares:
// each box's 3 rows, 3 columns, and 2 three-cell diagonals sum to the same
// total. The rules do not name the three boxes, so every 3-of-9 selection is
// offered as an alternative (Or of And) and the solver discovers which holds
// from the other constraints. Cages sum to their totals with all-different
// digits. Digits joined by a V sum to 5, by an X sum to 10. A number outside
// the grid gives the sum of the indicated diagonal, which runs edge-to-edge
// rather than corner-to-corner (LittleKiller.fromCells derives the matching
// canonical diagonal).

const graph = cellGraph('9x9');
const boxes = graph.boxes(); // 9 boxes, cells row-major within each box

// A single box's magic-square condition: its 3 rows, 3 columns, and 2
// three-cell diagonals must all sum to the same total.
function boxMagic(box) {
  const rows = [box.slice(0, 3), box.slice(3, 6), box.slice(6, 9)];
  const cols = [0, 1, 2].map(c => [box[c], box[c + 3], box[c + 6]]);
  const diag1 = [box[0], box[4], box[8]];
  const diag2 = [box[2], box[4], box[6]];
  return new EqualSum(...rows, ...cols, diag1, diag2);
}

function* triples(n) {
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        yield [i, j, k];
}

// Exactly which 3 of the 9 boxes are magic is unstated; try every choice.
const magicBoxes = new Or(Array.from(
  triples(9),
  ([i, j, k]) => new And([boxMagic(boxes[i]), boxMagic(boxes[j]), boxMagic(boxes[k])])
));

const cages = [
  new Cage(7, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(8, 'R3C4', 'R4C4'),
  new Cage(6, 'R7C1', 'R8C1'),
  new Cage(14, 'R7C7', 'R7C8', 'R7C9'),
];

const vxPairs = [
  new V('R6C3', 'R7C3'),
  new X('R7C3', 'R8C3'),
  new V('R8C6', 'R8C7'),
  new V('R5C6', 'R5C7'),
  new V('R6C8', 'R6C9'),
  new X('R5C8', 'R6C8'),
];

// Each ray starts at the drawn badge's nearest grid cell and walks away from
// it (up-right) to the far edge, matching the six cells listed above.
const outsideDiagonals = [
  LittleKiller.fromCells(38, graph.ray('R9C4', -1, 1), graph.gridGeometry()),
  LittleKiller.fromCells(28, graph.ray('R6C1', -1, 1), graph.gridGeometry()),
];

return [
  new Shape('9x9'),
  ...cages,
  magicBoxes,
  ...vxPairs,
  ...outsideDiagonals,
];
