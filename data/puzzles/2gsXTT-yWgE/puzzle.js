// Title: Kuromasudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=2gsXTT-yWgE
// Source: https://app.crackingthecryptic.com/webapp/9qMJNmR7Gj

// Rules:
// Normal sudoku rules apply.
// Some cells must be coloured grey. Grey cells may not be orthogonally
// adjacent, and the non-grey cells must form an orthogonally-connected set.
// All cells, grey and non-grey, contain a digit.
// A number in the top left corner of a cell is the sum of the digits seen from
// that cell looking north, south, east and west; the clue cell itself counts
// once. Grey cells block the visibility (and are not themselves seen).
// A cell with a clue may not be coloured grey.
// Within the field of vision of a clue digits may repeat, if sudoku allows it.
//
// Everything above is encoded; nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The grey/non-grey choice, one value per grid cell.
const shade = graph.makeOverlay('VS');
const UNSHADED = 1;
const SHADED = 2;

// The clue values, read from the small white numbers drawn in the top-left
// corner of their cell.
const clues = [
  ['R1C1', 11], ['R1C2', 7], ['R1C5', 14], ['R1C8', 13],
  ['R2C4', 19], ['R2C8', 21],
  ['R3C2', 8], ['R3C4', 9], ['R3C7', 12],
  ['R4C5', 10], ['R4C7', 16], ['R4C8', 15],
  ['R6C1', 11], ['R6C7', 12],
  ['R8C1', 22], ['R8C5', 9], ['R8C8', 13],
  ['R9C9', 36],
];

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// One machine per clue. Segment 0 is the clue cell's digit; each later segment
// is one ray, read outward as alternating [grey/non-grey, digit] cells. The
// state is the running total of what has been seen so far, plus a per-ray flag
// that latches once a grey cell has been passed: from then on the ray's digits
// are out of sight and are not added. `sum: null` marks "the clue cell's own
// digit has not been read yet". Totals above the clue can never come back down,
// so they are dropped rather than counted on.
const visionNfa = (clueCell, total) => {
  const rays = DIRECTIONS
    .map(([dRow, dCol]) => graph.ray(clueCell, dRow, dCol).slice(1))
    .filter(ray => ray.length > 0)
    .map(ray => ray.flatMap(cell => [shade.at(cell), cell]));
  const cellCount = 1 + rays.reduce((n, ray) => n + ray.length, 0);
  const spec = NFA.encodeSpec({
    startState: { sum: null, blind: false, shadeNext: false },
    transition: ({ sum, blind, shadeNext }, value) => {
      // Tested first: a break precedes every ray, so no consuming branch may
      // see one. It starts a fresh ray, in sight again and reading a shade.
      if (value === SEGMENT_BREAK) return { sum, blind: false, shadeNext: true };
      if (sum === null) return { sum: value, blind: false, shadeNext: false };
      if (shadeNext) {
        return { sum, blind: blind || value === SHADED, shadeNext: false };
      }
      if (blind) return { sum, blind, shadeNext: true };
      if (sum + value > total) return undefined;
      return { sum: sum + value, blind, shadeNext: true };
    },
    accept: ({ sum }) => sum === total,
    maxDepth: cellCount + rays.length,
  }, shape, { multiSegment: true });
  return new NFA(spec, `sees ${total}`, [clueCell], ...rays);
};

// Two grey cells sharing an edge are forbidden. A Pair binds consecutive cells
// of its list, so one call per overlay row and column covers every edge.
const notBothGrey = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), shape);

return [
  shape,
  shade.toVar('grey'),
  // The overlay is a two-state choice; the grid's other values are unused.
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  new ContainAtLeast(String(SHADED), ...shade.cells()),
  ...shade.rows().map(row => new Pair(notBothGrey, 'no adjacent grey', ...row)),
  ...shade.columns().map(col => new Pair(notBothGrey, 'no adjacent grey', ...col)),
  new ConnectedValues('VS', UNSHADED),
  ...clues.map(([cell]) => new Given(shade.at(cell), UNSHADED)),
  ...clues.map(([cell, total]) => visionNfa(cell, total)),
];
