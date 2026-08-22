// Title: Nadir
// Author: Barrels
// Video: https://www.youtube.com/watch?v=dDozFKP2Bpo
// Source: https://app.crackingthecryptic.com/sudoku/JqQHr2HJjg
//
// Normal sudoku rules apply (default row/column/box all-different).
// Three thermometers (increasing from the bulb, `new Thermo`), transcribed
// from the drawn `#cfcfcf` lines and their bulb-end circle underlays.
// One unknown cell is "the nadir": along every straight-line direction
// (orthogonal and diagonal) running from it to a grid edge, digits strictly
// increase outward. The payload marks no cell as the nadir, so its position
// is solver-discovered: `Or` over every candidate cell, each branch requiring
// strict outward increase (`Thermo`, bulb = candidate cell) along each ray
// that exists from that cell.

const graph = cellGraph('9x9');

// Thermometers: bulb first, transcribed from the drawn grey lines and
// confirmed by the bulb-end circle marker at each.
const thermos = [
  ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C8', 'R3C7', 'R4C7', 'R4C6'],
];

// The 8 straight-line directions a nadir radiates along.
const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

// One candidate per cell: every ray from that cell to the grid edge (skipping
// directions where the cell is already on the edge) must strictly increase
// outward, i.e. is a Thermo bulbed at the candidate cell.
const nadirCandidates = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    const rays = DIRECTIONS
      .map(([dr, dc]) => graph.ray(cell, dr, dc))
      .filter(ray => ray.length > 1);
    nadirCandidates.push(new And(rays.map(ray => new Thermo(...ray))));
  }
}

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new Or(nadirCandidates),
];
