// Title: Renban Windmill Sudoku
// Author: Laura Bradby
// Video: https://www.youtube.com/watch?v=9wgnrWyy4nM
// Source: https://app.crackingthecryptic.com/sudoku/LMNPbhgr93

// Rules encoded here:
//  - Normal sudoku rules.
//  - A purple line contains a consecutive set of distinct digits, not
//    necessarily in order.
//  - A 90 degree clockwise rotation maps each digit in the grid to another (or
//    the same) digit as follows: 1-2-3-4-1, 5-6-7-8-5, and 9-9.
// Nothing is omitted.

// The eight purple lines, as drawn.
const purpleLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
  ['R6C2', 'R7C1'],
  ['R6C9', 'R7C9'],
];

// The digit that each digit becomes after one clockwise quarter-turn.
const CLOCKWISE_MAP = {1: 2, 2: 3, 3: 4, 4: 1, 5: 6, 6: 7, 7: 8, 8: 5, 9: 9};
// Pair predicate: b's cell is one quarter-turn clockwise from a's cell, so b
// holds a's image under the map.
const mapsTo = Pair.fnToKey((a, b) => CLOCKWISE_MAP[a] === b, 9);

// Quarter-turn clockwise about the grid centre: RrCc -> RcC(10-r).
// The rules' worked example fixes this orientation: R1C2 -> R2C9.
const rotate90 = (cell) => {
  const {row, col} = parseCellId(cell);
  return makeCellId(col, 10 - row);
};

const orbitOf = (cell) => {
  const orbit = [cell];
  for (let next = rotate90(cell); next !== cell; next = rotate90(next)) {
    orbit.push(next);
  }
  return orbit;
};

// One orbit per set of cells related by the rotation: twenty 4-cycles, plus the
// centre R5C5, whose orbit is itself and which the map therefore pins to 9.
const allCells = cellGraph('9x9').cells();
const rotationOrbits = allCells
  .filter((cell, index) => orbitOf(cell).every((c) => allCells.indexOf(c) >= index))
  .map(orbitOf);

return [
  new Shape('9x9'),
  ...purpleLines.map((cells) => new Renban(...cells)),
  // Pair binds consecutive cells only, so each orbit repeats its first cell to
  // cover the closing quarter-turn.
  ...rotationOrbits.map(
    (orbit) => new Pair(mapsTo, 'clockwise rotation digit map', ...orbit, orbit[0])),
];
