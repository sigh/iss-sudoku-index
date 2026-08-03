// Title: World, a Tuning Fork
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=yCTzl3Z2z1Y
// Source: https://app.crackingthecryptic.com/55e6o5g53o

// Normal Sudoku rules apply.
//
// Battenburg: wherever a 2x2 area has two odd and two even digits in a
// checkerboard pattern, a little checkerboard symbol is marked there. Read
// biconditionally (the standard reading for this named clue, matching this
// repo's other Battenburg scripts): the eight drawn symbols are
// checkerboards, and every other 2x2 area is not.
//
// Zipperlines: digits an equal number of steps from the midpoint of a
// lavender line sum to the digit on the midpoint, marked by a drawn dot.
// Six of the nine drawn lavender strokes carry a dot; the dot's cell is the
// midpoint even where it sits off-centre in the stroke's own cell list, so a
// cell beyond the shorter arm has no equal-distance partner and is left
// unconstrained by this rule (the six lines below are trimmed to their
// symmetric span around the dot). The other three strokes carry no dot, so
// this rule cannot fix a midpoint for them and they are left unencoded.

// Top-left cell of each drawn checkerboard symbol's 2x2 block.
const battenburgs = [
  'R1C1', 'R3C2', 'R4C3', 'R6C5', 'R5C8', 'R6C8', 'R3C8', 'R6C2',
];

const parityOpposite = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);
// Each marked block is a checkerboard: walking its 2x2 perimeter, adjacent
// cells alternate parity (which forces the two diagonals to match).
const markedRules = battenburgs.map(topLeft => {
  const { row, col } = parseCellId(topLeft);
  const topRight = makeCellId(row, col + 1);
  const bottomRight = makeCellId(row + 1, col + 1);
  const bottomLeft = makeCellId(row + 1, col);
  return new Pair(parityOpposite, 'battenburg',
    topLeft, topRight, bottomRight, bottomLeft, topLeft);
});

// Every unmarked 2x2 block must fail to be a checkerboard. Reads the block
// row-major; state a/b remembers the first cell's parity, then rejects only
// if all three later cells keep alternating to complete the pattern.
const notBattenburg = NFA.encodeSpec({
  startState: 'start',
  transition: (state, value) => {
    const odd = value % 2 === 1;
    if (state === 'start') return odd ? 'a1' : 'b1';
    if (state === 'a1') return odd ? 'good' : 'a2';
    if (state === 'b1') return odd ? 'b2' : 'good';
    if (state === 'a2') return odd ? 'good' : 'a3';
    if (state === 'b2') return odd ? 'b3' : 'good';
    if (state === 'a3') return odd ? undefined : 'good';
    if (state === 'b3') return odd ? 'good' : undefined;
    return 'good';
  },
  accept: state => state === 'good',
  maxDepth: 4,
}, 9);

const graph = cellGraph('9x9');
const shown = new Set(battenburgs);
const absentOrigins = [];
for (let row = 1; row < 9; row++) for (let col = 1; col < 9; col++) {
  const topLeft = makeCellId(row, col);
  if (!shown.has(topLeft)) absentOrigins.push(topLeft);
}
const unmarkedRule = graph.makeReplicate(
  new NFA(notBattenburg, 'not a battenburg', ...graph.block('R1C1', 2, 2)),
  absentOrigins);

// Each entry is the symmetric span of a dotted stroke's interpolated cell
// path, centred on its dot (the middle cell of each list below). The first
// and fifth entries drop cells beyond the dot's shorter arm: the drawn
// stroke continues R6C8-R5C7-R5C6-R6C5-R6C4-R6C3-[R6C2..R5C3 below], and
// R3C6-R3C7-[R3C8..R2C7 below], but those extra cells have no
// equal-distance partner on the line, so no rule constrains them.
const zippers = [
  ['R6C2', 'R5C1', 'R4C1', 'R4C2', 'R5C3'],
  ['R2C2', 'R3C3', 'R4C3'],
  ['R3C2', 'R2C3', 'R1C3'],
  ['R8C9', 'R7C9', 'R7C8', 'R6C7', 'R6C6'],
  ['R3C8', 'R2C9', 'R1C9', 'R1C8', 'R2C7'],
  ['R3C5', 'R2C4', 'R1C4', 'R1C5', 'R2C6'],
];

return [
  new Shape('9x9'),
  ...markedRules,
  unmarkedRule,
  ...zippers.map(cells => new Zipper(...cells)),
];
