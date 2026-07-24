// Title: Quadrank Arrows
// Author: Phil The Hat
// Video: https://www.youtube.com/watch?v=1mz2gzfti3Q
// Source: https://sudokupad.app/pd589n0d3g

// VQ holds each circle's four surrounding digits in nondecreasing order.
const sortedDigits = new Var('Q', 'sorted quadrank digits', '12x4');
const vq = (circle, digit) => sortedDigits.cell(circle + 1, digit + 1);

const circles = [
  {cells: ['R2C1', 'R2C2', 'R3C1', 'R3C2'], rank: 'R1C1'},
  {cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], rank: 'R1C2'},
  {cells: ['R2C3', 'R2C4', 'R3C3', 'R3C4'], rank: 'R1C3'},
  {cells: ['R2C4', 'R2C5', 'R3C4', 'R3C5'], rank: 'R1C4'},
  {cells: ['R2C5', 'R2C6', 'R3C5', 'R3C6'], rank: 'R1C5'},
  {cells: ['R2C6', 'R2C7', 'R3C6', 'R3C7'], rank: 'R1C6'},
  {cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'], rank: 'R1C7'},
  {cells: ['R2C8', 'R2C9', 'R3C8', 'R3C9'], rank: 'R1C8'},
  {cells: ['R6C7', 'R6C8', 'R7C7', 'R7C8'], rank: 'R8C5'},
  {cells: ['R5C7', 'R5C8', 'R6C7', 'R6C8'], rank: 'R4C9'},
  {cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'], rank: 'R7C9'},
  {cells: ['R3C5', 'R3C6', 'R4C5', 'R4C6'], rank: 'R3C9'},
];

const atMost = Pair.fnToKey((a, b) => a <= b, 9);
const sortedTupleConstraints = circles.flatMap((circle, i) => {
  const tuple = [0, 1, 2, 3].map(d => vq(i, d));
  return [
    new SameValues(2, ...circle.cells, ...tuple),
    new Pair(atMost, 'nondecreasing', ...tuple),
  ];
});

// Compare [rank A, rank B, tuple A1, tuple B1, ..., tuple A4, tuple B4].
// The rank comparison must equal the lexicographic comparison of the sorted
// four-digit circle values, so equality and ordering are both exact.
const rankComparison = NFA.encodeSpec({
  startState: {step: 0, first: null, rankCmp: 0, valueCmp: 0},
  transition: (state, value) => {
    if (state.step % 2 === 0) {
      return {...state, step: state.step + 1, first: value};
    }
    const cmp = Math.sign(state.first - value);
    return {
      step: state.step + 1,
      first: null,
      rankCmp: state.step === 1 ? cmp : state.rankCmp,
      valueCmp: state.step > 1 && state.valueCmp === 0 ? cmp : state.valueCmp,
    };
  },
  accept: state => state.step === 10 && state.rankCmp === state.valueCmp,
  maxDepth: 10,
}, 9);

const rankComparisons = [];
for (let a = 0; a < circles.length; a++) {
  for (let b = a + 1; b < circles.length; b++) {
    const cells = [circles[a].rank, circles[b].rank];
    for (let d = 0; d < 4; d++) cells.push(vq(a, d), vq(b, d));
    rankComparisons.push(new NFA(rankComparison, 'quadrank comparison', ...cells));
  }
}

// Dense ranking: a used rank k > 1 requires rank k-1 to be used too.
const rankCells = circles.map(circle => circle.rank);
const rankContinuity = [];
for (let rank = 2; rank <= 9; rank++) {
  const machine = NFA.encodeSpec({
    startState: {lowerSeen: false, currentSeen: false},
    transition: (state, value) => ({
      lowerSeen: state.lowerSeen || value === rank - 1,
      currentSeen: state.currentSeen || value === rank,
    }),
    accept: state => !state.currentSeen || state.lowerSeen,
    maxDepth: rankCells.length,
  }, 9);
  rankContinuity.push(new NFA(machine, `no skipped rank ${rank}`, ...rankCells));
}

const cages = [
  new Cage(7, 'R4C1', 'R4C2', 'R5C2'),
  new Cage(8, 'R8C1', 'R8C2', 'R9C1'),
  new Cage(8, 'R5C5', 'R5C6', 'R6C6'),
  new Cage(11, 'R6C2', 'R6C3'),
  new Cage(9, 'R8C3', 'R8C4'),
  new Cage(13, 'R9C3', 'R9C4', 'R9C5'),
  new Cage(1, 'R1C9'),
  new Cage(7, 'R7C2', 'R7C3'),
  new Cage(8, 'R5C9', 'R6C9'),
  new Cage(7, 'R8C7', 'R9C7'),
  new Cage(13, 'R6C5', 'R7C5'),
];

return [
  new Shape('9x9'),
  sortedDigits,
  ...sortedTupleConstraints,
  ...rankComparisons,
  ...rankContinuity,
  ...cages,
];
