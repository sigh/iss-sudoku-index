// Title: Rats in a Maze #001
// Author: Dittman Rat
// Video: https://www.youtube.com/watch?v=xV4AQTHTEgc
// Source: https://sudokupad.app/wbjj6zns2r

// Rules encoded here, in full:
//  - Normal sudoku (rows, columns and boxes all-different: the ISS baseline).
//  - Thermometers are "strictly consecutive": each cell is exactly one more
//    than the previous cell, counting from the bulb.
//  - Tall walls separate any two orthogonally neighbouring cells whose digits
//    are not consecutive, so a rat steps only between orthogonally adjacent
//    cells whose digits differ by exactly 1.
//  - The nine given 3s are rats; every rat must have such a path to one of the
//    four corner cells (the exits).
// Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Drawn data, transcribed from the puzzle.
const RATS = [
  'R1C3', 'R2C4', 'R3C9', 'R4C6', 'R5C7', 'R6C2', 'R7C1', 'R8C8', 'R9C5',
];
// Thermometer lines, bulb first.
const THERMOS = [
  ['R4C9', 'R3C8', 'R2C7'],
  ['R3C7', 'R3C6', 'R2C5', 'R1C4'],
  ['R3C2', 'R3C3'],
  ['R9C1', 'R8C1'],
  ['R1C1', 'R1C2'],
  ['R1C9', 'R2C9'],
  ['R9C9', 'R9C8'],
  ['R9C6', 'R8C6'],
  ['R7C6', 'R7C5', 'R7C4'],
  ['R6C5', 'R5C4', 'R6C3', 'R5C2', 'R4C1'],
  ['R9C7', 'R8C7'],
];
const EXITS = ['R1C1', 'R1C9', 'R9C1', 'R9C9'];

// Escape structure. Three auxiliary overlays certify "this cell can reach an
// exit", nothing is drawn for them on the board:
//   VF  BLOCKED / ESCAPES
//   VH, VL  a distance to the nearest exit, split base 9 so that it reaches
//           the 81-cell maximum inside the 1-9 alphabet:
//           distance = 9 * (VH - 1) + (VL - 1), i.e. 0 to 80.
// Together the constraints below force VF to mark exactly the cells that have
// a path to an exit, and the distance of such a cell to be its true shortest
// path length, so the overlay is fixed by the digits.
const escape = graph.makeOverlay('VF');
const distHigh = graph.makeOverlay('VH');
const distLow = graph.makeOverlay('VL');
const BLOCKED = 1;
const ESCAPES = 2;

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const stepUpKey = Pair.fnToKey((a, b) => b === a + 1, shape);
// A blocked cell has no distance; park it on 0 so it carries no free state.
const noDistanceKey = Pair.fnToKey(
  (flag, part) => flag !== BLOCKED || part === 1, shape);

// distance(cell) - distance(neighbour) = 1, over the base-9 split.
const distanceStep = (cell, neighbour) => new Sum(
  1,
  [distHigh.at(cell), 9], [distLow.at(cell), 1],
  [distHigh.at(neighbour), -9], [distLow.at(neighbour), -1]);

// One machine per orthogonally adjacent pair, reading
//   [digit a, digit b, flag a, flag b, high a, high b, low a, low b].
// Phases 0-1 read the two digits: non-consecutive digits are a wall, which
// carries no requirement, so the machine drops into the DONE sink. Phases 2-3
// require the two sides of a doorway to agree on whether they escape (a rat
// that can reach either side can reach both). Phases 4-7 compare the two
// distances when both sides escape: the two ends of a doorway on the escape
// side are at most one step apart, which is what pins each distance down to
// the shortest one rather than any longer chain.
const DONE = 9;
const doorwaySpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0:
        return { phase: 1, digit: value };
      case 1:
        return Math.abs(state.digit - value) === 1
          ? { phase: 2 } : { phase: DONE };
      case 2:
        if (value !== BLOCKED && value !== ESCAPES) return undefined;
        return { phase: 3, flag: value };
      case 3:
        if (value !== state.flag) return undefined;
        return value === BLOCKED ? { phase: DONE } : { phase: 4 };
      case 4:
        return { phase: 5, high: value };
      case 5: {
        const highDiff = state.high - value;
        // |distance difference| <= 1 needs the high parts within 1 too.
        return Math.abs(highDiff) <= 1
          ? { phase: 6, highDiff } : undefined;
      }
      case 6:
        return { phase: 7, highDiff: state.highDiff, low: value };
      case 7: {
        const diff = 9 * state.highDiff + state.low - value;
        return Math.abs(diff) <= 1 ? { phase: 8 } : undefined;
      }
      default:
        return { phase: DONE };
    }
  },
  accept: (state) => state.phase === 8 || state.phase === DONE,
  maxDepth: 8,
}, shape);

const doorways = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(neighbour => neighbour !== null)
    .map(neighbour => new NFA(
      doorwaySpec, 'doorway',
      cell, neighbour,
      escape.at(cell), escape.at(neighbour),
      distHigh.at(cell), distHigh.at(neighbour),
      distLow.at(cell), distLow.at(neighbour))));

return [
  shape,
  escape.toVar('escapes'),
  distHigh.toVar('distance-high'),
  distLow.toVar('distance-low'),

  ...RATS.map(cell => new Given(cell, 3)),
  ...THERMOS.map(line => new Pair(stepUpKey, 'consecutive-up', ...line)),

  // Overlay domains, and the parking of an unused distance.
  escape.makeReplicate(new Given(escape.at('R1C1'), BLOCKED, ESCAPES)),
  ...graph.cells().flatMap(cell => [
    new Pair(noDistanceKey, 'no-distance', escape.at(cell), distHigh.at(cell)),
    new Pair(noDistanceKey, 'no-distance', escape.at(cell), distLow.at(cell)),
  ]),

  // The four exits: escaped already, at distance 0.
  ...EXITS.flatMap(cell => [
    new Given(escape.at(cell), ESCAPES),
    new Given(distHigh.at(cell), 1),
    new Given(distLow.at(cell), 1),
  ]),

  ...doorways,

  // Any other escaping cell steps through a doorway to a cell one closer.
  ...graph.cells().filter(cell => !EXITS.includes(cell)).map(cell => new Or([
    new Given(escape.at(cell), BLOCKED),
    ...graph.neighbours(cell).map(neighbour => new And([
      new Given(escape.at(cell), ESCAPES),
      new Given(escape.at(neighbour), ESCAPES),
      new Pair(consecutiveKey, 'open-doorway', cell, neighbour),
      distanceStep(cell, neighbour),
    ])),
  ])),

  // Every rat escapes.
  ...RATS.map(cell => new Given(escape.at(cell), ESCAPES)),
];
