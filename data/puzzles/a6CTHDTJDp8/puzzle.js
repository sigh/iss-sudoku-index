// Title: The Wolf
// Author: Fiton
// Video: https://www.youtube.com/watch?v=a6CTHDTJDp8
// Source: https://sudokupad.app/9v0kvw4azl

// Rules encoded:
// Normal Sudoku rules apply.
// Shade some cells so that the shaded region is "super connected": orthogonally
// connected, and for any two shaded cells sharing a row or column, every cell
// between them is also shaded (i.e. each row/column's shaded cells form one
// contiguous run).
// Each box's shaded-cell count is >= 1 and equals the largest digit shaded in
// that box; all nine box counts are different.
// In the middle box, any two orthogonally non-adjacent cells must not hold
// consecutive digits (the contrapositive of "consecutive digits are adjacent").
// Black dots: the two digits are in 1:2 ratio.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade cell is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// Rule: super-connected shaded region.
// Global orthogonal connectivity of the shaded cells (one region).
const shadedConnected = new ConnectedValues('VS', SHADED);
// Row/column interval property: no row or column may have a shaded cell,
// then an unshaded cell, then a shaded cell again (that would leave an
// unshaded gap between two shaded cells in the same line).
const lineConvexity = [...graph.rows(), ...graph.columns()].map(
  line => new Regex('1*2*1*', ...shade.at(line)));

// Rule: per-box shaded count == largest shaded digit in that box, and all
// nine box counts differ. `boxCount` is a Var per box (anchored at each
// box's first cell) holding the number of shaded cells in that box.
const boxAnchors = Array.from({ length: 9 }, (_, i) => graph.box(i + 1)[0]);
const boxCount = graph.makeOverlay('VC', boxAnchors);

function boxCountSum(boxCells, countCell) {
  // sum(shadeVar) over 9 cells = 9 + (# shaded), since UNSHADED=1
  // contributes 1 and SHADED=2 contributes 2 per cell. So
  // sum(shadeVar) - countCell = 9 encodes countCell = # shaded cells.
  return new Sum(9, ...shade.at(boxCells), [countCell, -1]);
}

// NFA: scans a box's cells as interleaved (shade, digit) pairs, tracking only
// the largest digit seen among shaded cells (`max`); a trailing segment reads
// the box's count Var and accepts iff it equals that max. The shaded count
// itself is not recomputed here -- it comes from `boxCountSum` above, and the
// count Var's domain (1-9, the grid's default Var range) already forces it
// to be at least 1.
const boxMaxSpec = NFA.encodeSpec({
  startState: { max: 0, pendingShaded: undefined },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { max: state.max, awaitingCount: true };
    if (state.awaitingCount) return { done: true, ok: value === state.max };
    if (state.pendingShaded === undefined) {
      // Reading a shade token.
      return { max: state.max, pendingShaded: value === SHADED };
    }
    // Reading the digit token for the cell whose shade was just read.
    const max = state.pendingShaded ? Math.max(state.max, value) : state.max;
    return { max, pendingShaded: undefined };
  },
  accept: state => state.done === true && state.ok === true,
}, 9, { multiSegment: true });

function boxRules(boxIndex) {
  const boxCells = graph.box(boxIndex);
  const countCell = boxCount.at(boxAnchors[boxIndex - 1]);
  const shadeDigitPairs = boxCells.flatMap(
    cell => [shade.at(cell), cell]);
  return [
    boxCountSum(boxCells, countCell),
    new NFA(boxMaxSpec, `box${boxIndex} count=max`, shadeDigitPairs, [countCell]),
  ];
}

const boxRuleList = Array.from({ length: 9 }, (_, i) => boxRules(i + 1)).flat();
const distinctBoxCounts = new AllDifferent(...boxCount.cells());

// Rule: in the middle box (box 5), consecutive digits must be orthogonally
// adjacent. Encoded as the contrapositive over every non-adjacent cell pair
// in the box: those two cells must NOT hold consecutive digits. (Adjacent
// pairs get no constraint here -- they are already free to be consecutive
// or not.)
function isAdjacent(a, b) {
  const A = parseCellId(a), B = parseCellId(b);
  return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
}
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const middleBoxCells = graph.box(5);
const middleBoxPairs = [];
for (let i = 0; i < middleBoxCells.length; i++) {
  for (let j = i + 1; j < middleBoxCells.length; j++) {
    const a = middleBoxCells[i], b = middleBoxCells[j];
    if (!isAdjacent(a, b)) {
      middleBoxPairs.push(new Pair(notConsecutive, 'not consecutive', a, b));
    }
  }
}

// Black dots (ratio 1:2). Cell pairs read from the two rounded black
// overlays in the payload.
const blackDots = [
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R8C2', 'R8C3'),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 1),
  new Given('R7C3', 8),
  new Given('R9C9', 8),
  shade.toVar('shade'),
  shadeDomain,
  boxCount.toVar('box shaded count'),
  shadedConnected,
  ...lineConvexity,
  ...boxRuleList,
  distinctBoxCounts,
  ...middleBoxPairs,
  ...blackDots,
];
