// Title: World, a Tuning Fork
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=yCTzl3Z2z1Y
// Source: https://app.crackingthecryptic.com/55e6o5g53o

// Normal Sudoku rules apply. There are no given digits.
//
// Battenburg: wherever a 2x2 area consists of two odd and two even digits in a
// checkerboard pattern, a little checkerboard symbol is marked. Encoded both
// ways: the eight drawn symbols mark checkerboard 2x2s, and the 56 unmarked
// 2x2s are not checkerboards. In all eight drawn symbols the grey squares lie
// on the same diagonal as each other, so the colouring fixes no parity and
// either diagonal may hold the odd digits.
//
// Zipperlines: digits in cells an equal number of steps from the midpoint of a
// lavender line sum to the digit on the midpoint, marked by a lavender dot.
//
// No rule is omitted.

// Top-left cell of each drawn checkerboard symbol's 2x2 area.
const battenburgs = [
  'R1C1', 'R3C2', 'R4C3', 'R6C2', 'R6C5', 'R3C8', 'R5C8', 'R6C8',
];

// Each lavender line, in drawn order, with its dot on the centre cell.
// Where two lines cross they touch only at a grid corner and each runs
// straight on through it, so a crossing never splits or joins a line.
const zippers = [
  ['R3C2', 'R2C3', 'R1C3'],
  ['R2C2', 'R3C3', 'R4C3'],
  ['R8C9', 'R7C9', 'R7C8', 'R6C7', 'R6C6'],
  ['R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2', 'R4C1',
   'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8', 'R1C9',
   'R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
  ['R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C4',
   'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
];

// A 2x2 is a parity checkerboard exactly when its four perimeter neighbours
// alternate parity, which forces each diagonal to match and the two diagonals
// to differ. The cell list walks TL-TR-BR-BL and back to TL.
const oppositeParity = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);
const markedBattenburgs = battenburgs.map(topLeft => {
  const { row, col } = parseCellId(topLeft);
  return new Pair(oppositeParity, 'battenburg',
    topLeft,
    makeCellId(row, col + 1),
    makeCellId(row + 1, col + 1),
    makeCellId(row + 1, col),
    topLeft);
});

// Reads a 2x2 in the order TL, TR, BL, BR and remembers the three parities
// seen so far; the final cell rejects iff the four form a checkerboard.
const notBattenburgNFA = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (s, value) => {
    const parity = value % 2;
    if (s.i === 0) return { i: 1, tl: parity };
    if (s.i === 1) return { i: 2, tl: s.tl, tr: parity };
    if (s.i === 2) return { i: 3, tl: s.tl, tr: s.tr, bl: parity };
    const isChecker = s.tl === parity && s.tr === s.bl && s.tl !== s.tr;
    return isChecker ? undefined : { i: 4 };
  },
  accept: (s) => s.i === 4,
}, 9);

const graph = cellGraph('9x9');
const marked = new Set(battenburgs);
const unmarked = [];
for (let row = 1; row < 9; row++) {
  for (let col = 1; col < 9; col++) {
    const topLeft = makeCellId(row, col);
    if (!marked.has(topLeft)) unmarked.push(topLeft);
  }
}
// 56 copies of one 2x2 template at the same relative offsets. The template is
// anchored at R1C1, which is itself marked and so absent from the targets.
const unmarkedBattenburgs = graph.makeReplicate(
  [new NFA(notBattenburgNFA, 'not a battenburg',
    'R1C1', 'R1C2', 'R2C1', 'R2C2')],
  unmarked);

return [
  new Shape('9x9'),
  ...markedBattenburgs,
  unmarkedBattenburgs,
  ...zippers.map(cells => new Zipper(...cells)),
];
