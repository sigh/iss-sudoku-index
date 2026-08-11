// Title: Chaotic Archery
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=o2YV25jEO28
// Source: https://app.crackingthecryptic.com/sudoku/T9F27jJnqf

// Rules: rows, columns and 9 solver-determined orthogonally-connected 9-cell
// regions each hold 1-9 once (no drawn boxes -> ChaosConstruction + NoBoxes).
// 9 given digits sit under drawn circles ("bulbs"). 9 drawn arrows exist
// elsewhere; each arrow's cells sum to the digit in "one of the bulbs", and
// the arrow and that bulb must share a region. No arrow cell touches any
// bulb cell, and no drawing ties a given arrow to a given bulb, so which
// bulb an arrow corresponds to is left open by the source: encoded as an Or
// over all 9 bulbs per arrow. "Direction ... of no importance" needs no
// separate encoding since Sum/region-membership are already order-free.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Bulb cells + values, provenance: the 9 given digits, each under a white
// circle (`underlays`).
const bulbs = [
  ['R1C1', 4], ['R1C7', 7], ['R2C5', 9], ['R4C2', 9], ['R5C2', 8],
  ['R5C4', 5], ['R6C6', 9], ['R7C9', 9], ['R8C9', 8],
];

// Arrow cell lists (labels A-I), provenance: the 9 drawn arrow lines.
const arrows = [
  ['R1C5', 'R1C4'],               // A
  ['R3C9', 'R2C9', 'R1C9'],       // B
  ['R4C6', 'R4C7'],               // C
  ['R3C3', 'R4C3'],               // D
  ['R7C7', 'R6C8', 'R5C8'],       // E
  ['R9C9', 'R9C8', 'R8C8'],       // F
  ['R7C1', 'R7C2', 'R7C3'],       // G
  ['R8C1', 'R8C2', 'R8C3'],       // H
  ['R9C1', 'R9C2'],               // I
];

const bulbGivens = bulbs.map(([cell, value]) => new Given(cell, value));

// For each arrow, one branch per candidate bulb: the arrow's cells sum to
// that bulb's given digit, and every arrow cell plus the bulb cell carry the
// same CC (chaos-region) label -- SameValues with one cell per set forces
// those cells' values (region labels) equal.
const arrowConstraints = arrows.map(arrowCells => new Or(
  bulbs.map(([bulbCell, bulbValue]) => {
    const regionCells = [...arrowCells, bulbCell];
    return new And([
      new Sum(bulbValue, ...arrowCells),
      new SameValues(regionCells.length, ...cc.at(regionCells)),
    ]);
  }),
));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...bulbGivens,
  ...arrowConstraints,
];
