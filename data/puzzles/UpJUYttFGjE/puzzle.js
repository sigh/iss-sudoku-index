// Title: Ratio lines - Dynamic fog
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=UpJUYttFGjE
// Source: https://sudokupad.app/ujnp27j7ir

// Normal sudoku rules apply (rows, columns, boxes).
//
// Ratio lines: on each line, the sum of the odd digits on it is exactly half
// or double the sum of the even digits on it, and every end cell of the line
// holds a digit of the same parity as every other end cell of that line.
//
// White dot: the two marked adjacent pairs hold consecutive digits.
//
// Fog/reveal state (foglight/triggereffect in the payload) is solving UI, not
// a final-grid rule, and is not encoded.

// Each ratio line is transcribed as the drawn stroke segment(s) that make it
// up. Most lines are one stroke; five combine two strokes that touch where
// one stroke ends inside another's middle, drawing one branching line with
// 3-4 tips rather than two separate short lines (a standalone 2-cell branch
// off such a junction could never satisfy the ratio rule on its own, since
// its 2 cells would then be forced to the same parity, making one side of
// the ratio always zero). A segment is the drawn cell order of one stroke; a
// line's cells are the union of its segment(s), and its "end
// cells" are the cells with degree 1 once every segment's consecutive-pair
// edges are combined (the tips of a simple line, or every tip of a branching
// one).
const RATIO_LINES = [
  // Strokes #30,#31,#32 (pink, f5aeaeff): merge at R2C1 and R2C3, both of
  // which are mid-path in one stroke and an endpoint of the other.
  { segments: [
    ['R1C1', 'R2C1', 'R3C1'],
    ['R2C1', 'R3C2', 'R2C3', 'R3C3'],
    ['R2C3', 'R2C2'],
  ] },
  { segments: [['R4C6', 'R5C6', 'R6C6']] },               // stroke #28 (pink)
  { segments: [['R7C9', 'R8C8', 'R9C8']] },               // stroke #29 (pink)
  { segments: [['R7C1', 'R7C2', 'R8C2']] },               // stroke #33 (pink)
  { segments: [['R1C2', 'R1C3', 'R1C4']] },               // stroke #34 (yellow)
  // Strokes #35,#36,#37 (yellow, f1e0a3ff): merge at R5C1 and R5C2, mirroring
  // the pink tree above.
  { segments: [
    ['R4C1', 'R5C1', 'R6C1'],
    ['R5C1', 'R5C2', 'R4C2'],
    ['R5C2', 'R6C2'],
  ] },
  { segments: [['R4C4', 'R5C4', 'R6C4']] },               // stroke #38 (yellow), box-4 left column
  { segments: [['R3C9', 'R4C9', 'R4C8', 'R4C7']] },       // stroke #39 (yellow)
  // Strokes #40,#41 (cyan, 9de4ecff): merge at R8C6 (mid-path in #40,
  // endpoint of #41).
  { segments: [
    ['R7C8', 'R7C7', 'R8C7', 'R8C6', 'R7C6'],
    ['R8C6', 'R8C5'],
  ] },
  { segments: [['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']] }, // stroke #42 (yellow)
  // Strokes #43,#44 (yellow, e8f2a4ff): merge at R2C5 (mid-path in #43,
  // endpoint of #44).
  { segments: [
    ['R2C4', 'R2C5', 'R2C6'],
    ['R2C5', 'R3C6'],
  ] },
  { segments: [['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9']] }, // stroke #45 (green)
  { segments: [['R4C4', 'R4C5', 'R4C6']] },               // stroke #46 (green), box-4 top row
  { segments: [['R8C1', 'R9C1', 'R9C2']] },               // stroke #47 (green)
  { segments: [['R5C4', 'R5C5', 'R5C6']] },               // stroke #48 (cyan), box-4 middle row; carries the two white dots
  { segments: [['R6C4', 'R6C5', 'R6C6']] },               // stroke #49 (steel blue), box-4 bottom row
  { segments: [['R4C7', 'R3C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9']] }, // stroke #50 (steel blue)
  { segments: [['R5C7', 'R6C7', 'R6C8', 'R6C9']] },       // stroke #51 (purple)
  { segments: [['R4C5', 'R5C5', 'R6C5']] },               // stroke #52 (purple), box-4 middle column
  { segments: [['R9C7', 'R9C6', 'R9C5']] },               // stroke #53 (purple)
  // Strokes #54,#55 (purple, f5bff9ff): merge at R7C4 (mid-path in #54,
  // endpoint of #55).
  { segments: [
    ['R7C6', 'R7C5', 'R7C4', 'R8C4'],
    ['R7C4', 'R7C3'],
  ] },
];

// Derive each line's cell set and end cells (degree-1 cells) from its
// segments, rather than hand-listing them a second time.
function lineCellsAndEnds(segments) {
  const degree = new Map();
  const bump = (cell) => degree.set(cell, (degree.get(cell) || 0) + 1);
  for (const seg of segments) {
    for (let i = 0; i + 1 < seg.length; i++) {
      bump(seg[i]);
      bump(seg[i + 1]);
    }
  }
  const cells = [...degree.keys()];
  const ends = cells.filter((c) => degree.get(c) === 1);
  return { cells, ends };
}

// One ratio NFA, shared by every line: track the running sum of odd-valued
// cells and of even-valued cells (order-independent), accept when one sum is
// exactly double the other and the smaller side is non-empty (a line with
// only one parity present, which end-cell agreement alone cannot rule out,
// can never hit a 1:2 ratio against a zero sum).
const ratioSpec = {
  startState: { sumOdd: 0, sumEven: 0 },
  transition: ({ sumOdd, sumEven }, v) => (
    v % 2 === 1
      ? { sumOdd: sumOdd + v, sumEven }
      : { sumOdd, sumEven: sumEven + v }
  ),
  accept: ({ sumOdd, sumEven }) => (
    (sumEven > 0 && sumOdd === 2 * sumEven) ||
    (sumOdd > 0 && sumEven === 2 * sumOdd)
  ),
  maxDepth: 6, // the longest line (strokes #42, #23/#50 union) is 6 cells
};
const ratioNFA = NFA.encodeSpec(ratioSpec, 9);

// End cells of a line all share one parity; this checks every pair of them.
const sameParityKey = PairX.fnToKey((a, b) => a % 2 === b % 2, 9);

const ratioLineConstraints = RATIO_LINES.flatMap(({ segments }, i) => {
  const { cells, ends } = lineCellsAndEnds(segments);
  return [
    new NFA(ratioNFA, `ratio${i + 1}`, ...cells),
    // Every real line here has >= 2 end cells, but guard the degenerate case
    // declaratively rather than mutating a list.
    ...(ends.length >= 2
      ? [new PairX(sameParityKey, `ratio${i + 1}-ends`, ...ends)]
      : []),
  ];
});

return [
  new Shape('9x9'),
  ...ratioLineConstraints,
  // White dot overlays at edge(R5C4,R5C5) and edge(R5C5,R5C6), both on the
  // box-4 middle-row ratio line above.
  new WhiteDot('R5C4', 'R5C5', 'R5C6'),
];
