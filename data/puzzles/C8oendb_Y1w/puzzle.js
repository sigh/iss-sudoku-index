// Title: Wrinkled Potato
// Author: Quiriqui
// Video: https://www.youtube.com/watch?v=C8oendb_Y1w
// Source: https://app.crackingthecryptic.com/sudoku/nJ3mJm2ggg

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no givens).
// Every line below is simultaneously:
//   - Entropic: every 3 consecutive cells hold one low(1-3), one mid(4-6), one
//     high(7-9) digit.
//   - A region-sum line: the digits on the line sum to the same total N in
//     every box segment it passes through.
// and every line's own N differs from every other line's N.
//
// The drawn payload has 10 same-colour stroke entries, but entries
// #0,#1,#2,#8,#9 chain end-to-end (each sharing exactly one cell with the
// next) into a single unbroken 27-cell outer line -- treated here as ONE
// line, not five. Keeping them separate is not viable: stroke entry #9 alone
// (R7C9-R8C9-R9C8-R9C7-R9C6) would split into a 4-cell box segment (4 distinct
// digits, sum >= 10) and a 1-cell box segment (sum <= 9), which could never
// share a sum. Entries #3,#4,#5,#6,#7 share no cells with each other or with
// the outer chain, so they remain 5 separate lines.

const outerSpiral = [
  // Merge of stroke entries #8,#0,#1,#2,#9, walked in the single order the
  // shared endpoints force (8->0 at R3C8, 0->1 at R1C6, 1->2 at R6C1,
  // 2->9 at R9C6).
  'R7C7', 'R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C8',
  'R2C7', 'R1C6',
  'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1',
  'R7C1', 'R8C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6',
  'R9C7', 'R9C8', 'R8C9', 'R7C9',
];

const innerLines = [
  ['R7C6', 'R6C6', 'R5C6'],                           // stroke entry #3
  ['R5C2', 'R6C2', 'R5C3', 'R6C4', 'R5C5', 'R4C4'],   // stroke entry #4
  ['R4C2', 'R4C3', 'R5C4', 'R4C5', 'R4C6'],           // stroke entry #5
  ['R2C4', 'R2C3', 'R3C3'],                           // stroke entry #6
  ['R3C7', 'R3C6', 'R3C5'],                           // stroke entry #7
];

const allLines = [outerSpiral, ...innerLines];

// A short representative segment per line, used only to compare sums across
// lines (see below). RegionSumLine already forces every segment of a given
// line to share that line's sum, so any one segment stands in for "this
// line's sum".
const sumRefs = [
  ['R7C7', 'R8C8', 'R7C8'], // outerSpiral's first box segment
  ['R7C6'],
  ['R5C2', 'R6C2', 'R5C3'],
  ['R4C2', 'R4C3'],
  ['R2C4'],
  ['R3C7'],
];

// "Every line has a different sum" compares each pair of lines' representative
// segments. There is no built-in cross-line sum-inequality constraint, and the
// true sums span roughly 1-18 -- too wide for an auxiliary Var (ISS's 9x9
// value alphabet caps at 16) -- so this scans both segments in one NFA,
// tracking each side's running sum in state (not in the grid's value
// alphabet) and rejecting only if the two totals end up equal.
function differentSumNFA(name, segA, segB) {
  const spec = NFA.encodeSpec({
    startState: { inB: false, sumA: 0, sumB: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { inB: true, sumA: state.sumA, sumB: 0 };
      if (!state.inB) return { inB: false, sumA: state.sumA + value, sumB: 0 };
      return { inB: true, sumA: state.sumA, sumB: state.sumB + value };
    },
    accept: (state) => state.sumA !== state.sumB,
    maxDepth: segA.length + segB.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(spec, name, segA, segB);
}

const distinctSums = [];
for (let i = 0; i < sumRefs.length; i++) {
  for (let j = i + 1; j < sumRefs.length; j++) {
    distinctSums.push(
      differentSumNFA(`diffSum${i}_${j}`, sumRefs[i], sumRefs[j]));
  }
}

return [
  new Shape('9x9'),
  ...allLines.map(cells => new Entropic(...cells)),
  ...allLines.map(cells => new RegionSumLine(...cells)),
  ...distinctSums,
];
