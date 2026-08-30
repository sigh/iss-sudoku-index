// Title: The Miracle Thermo Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=iHxI8pdH3FU
// Source: https://tinyurl.com/ybt66u3b

// Rules encoded here:
//  - Normal sudoku rules apply (default row/column/box all-different).
//  - Eight thermometers, each keeping a fixed shape shown in the puzzle's own
//    key below the grid (never rotated or reflected, only translated), must
//    be placed into the grid. They may not overlap each other, but may
//    overlap the three given digits. Digits increase along each placed
//    thermometer starting from its bulb.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The three givens (payload `number` entries at canvas R5C4/C6/C8 -- the
// canvas draws the solving grid one column right of this script's R#C#, since
// its internal box-divider lines land at canvas col4|5 and col7|8, one column
// past this grid's own col3|4 and col6|7).
const givens = [
  ['R5C3', 4],
  ['R5C5', 5],
  ['R5C7', 6],
];

// The eight thermometer shapes, each as an ordered list of [rowOffset,
// colOffset] from its bulb (element 0), transcribed from the payload's
// `thermo` layer -- the puzzle's own key, which draws each thermometer once
// below the solving grid in the fixed orientation the rules require. Point
// order along each drawn stroke starts at the bulb: Penpa's `thermo` tool
// always begins the stroke there, which is exactly what distinguishes it from
// the payload's (empty, here) bulb-less `nobulbthermo` layer. Thermometers
// 1-5 in the key are the same straight 7-cell shape; 6-8 are distinct bent
// shapes.
const shapes = [
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[0, 0], [-1, 0], [-1, 1], [-2, 1], [-3, 1]],
  [[0, 0], [-1, 0], [-1, -1], [-2, -1]],
];

// Every translation of `shape` that keeps every one of its cells on the 9x9
// grid, as a bulb-first list of cell ids (rotation/reflection are not drawn
// for any key thermometer, so only translation is generated).
const candidatePlacements = (shape) => {
  const rowOffsets = shape.map(([dr]) => dr);
  const colOffsets = shape.map(([, dc]) => dc);
  const minR = Math.min(...rowOffsets), maxR = Math.max(...rowOffsets);
  const minC = Math.min(...colOffsets), maxC = Math.max(...colOffsets);
  const placements = [];
  for (let r = 1 - minR; r <= 9 - maxR; r++) {
    for (let c = 1 - minC; c <= 9 - maxC; c++) {
      placements.push(shape.map(([dr, dc]) => makeCellId(r + dr, c + dc)));
    }
  }
  return placements;
};

const placementsByPiece = shapes.map(candidatePlacements);

// One var per grid cell, holding the id (1-8) of whichever thermometer
// occupies it. Two placements that both claim a cell would need two
// different ids there, which the var can't hold -- that is what keeps the
// eight thermometers from overlapping each other. A cell no chosen placement
// covers leaves this var unconstrained; nothing else reads it.
const label = graph.makeOverlay('VL');

return [
  new Shape('9x9'),
  label.toVar('ThermoId'),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  // Pick one placement per thermometer: it stamps the piece's id on every
  // cell it covers (see above) and requires the placed path to increase from
  // the bulb.
  ...placementsByPiece.map((placements, i) => new Or(
    placements.map(cells => new And([
      ...cells.map(cell => new Given(label.at(cell), i + 1)),
      new Thermo(...cells),
    ]))
  )),
];
