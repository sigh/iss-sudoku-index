// Title: A tilt at full rank
// Author: bellal
// Video: https://www.youtube.com/watch?v=Ia2Qbr7WPPw
// Source: https://sudokupad.app/u3r1c3ptbf

// 0-8 sudoku on the ordinary 9x9 grid (Shape below); no givens.
//
// Tilted 5x5 latin square: the 25 cells under the red circles (DIAMOND_CELLS)
// form a 5x5 grid tilted 45 degrees, split into 10 five-cell diagonal lines
// (5 "down-right", constant row-col, and 5 "down-left", constant row+col).
// All 25 cells share one common set of five digits from 0-8, and each line
// uses that set once each with no repeat. Encoded as AllDifferent per line,
// plus a distinct-value count of exactly 5 across all 25 cells: with every
// line already forced to 5 distinct values, a global universe of only 5
// distinct values forces every line's value set to equal that same 5-set.
//
// Full rank: each of the 10 lines read as a 5-digit number in both
// directions gives 20 numbers, ranked 1 (lowest) to 20 (highest) with no
// ties. Four blue cages (1 or 2 ordinary grid cells, read left-to-right, no
// leading 0 on a 2-cell one) each spell the rank of one specific
// line-direction, identified by a short arrow drawn from the cage into that
// direction's starting cell (see CAGE_CLUES below for the cage->line map).
//
// No ISS class expresses a rank among derived multi-cell values, so it is
// built from primitives: every digit is single-valued 0-8, so lexicographic
// order of a line-direction's 5 cells matches numeric order of the 5-digit
// number (no carries) -- the number itself never needs to be materialized as
// a weighted-sum Var. For each clued line-direction, one {0,1} flag Var per
// each of the other 19 numbers (via a small NFA reading both 5-cell tuples
// interleaved) records whether that number is smaller; a Sum then pins
// 1 + (count of smaller numbers) to the cage's own spelled value, which is
// exactly that line-direction's rank. A second NFA per pair of *different*
// lines' readings (all 4 direction combinations, one per unordered line
// pair) enforces all 20 numbers pairwise distinct -- required for "rank" to
// be well-defined at all (a same-line forward/backward pair is already
// distinct for free, since AllDifferent on the line forces their first
// digits to differ).
//
// Kropki dot: white dot between R1C9/R2C9 -- differ by 1.

const shape = new Shape('9x9', '0-8');

// Red circle underlay positions (25 cells; row-major from the payload's
// `underlays`).
const DIAMOND_CELLS = [
  'R1C5',
  'R2C4', 'R2C6',
  'R3C3', 'R3C5', 'R3C7',
  'R4C2', 'R4C4', 'R4C6', 'R4C8',
  'R5C1', 'R5C3', 'R5C5', 'R5C7', 'R5C9',
  'R6C2', 'R6C4', 'R6C6', 'R6C8',
  'R7C3', 'R7C5', 'R7C7',
  'R8C4', 'R8C6',
  'R9C5',
];

// Group the drawn diamond cells into the 10 diagonal lines: 5 "down-right"
// (constant row-col) and 5 "down-left" (constant row+col), each ordered top
// (lowest row) to bottom -- the "forward" reading direction below.
function diagonalLines(keyFn) {
  const groups = new Map();
  for (const id of DIAMOND_CELLS) {
    const { row, col } = parseCellId(id);
    const key = keyFn(row, col);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ row, id });
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([key, cells]) => ({
      key,
      cells: cells.sort((a, b) => a.row - b.row).map(c => c.id),
    }));
}
const downRightLines = diagonalLines((row, col) => row - col);
const downLeftLines = diagonalLines((row, col) => row + col);
const allLines = [...downRightLines, ...downLeftLines];

const lineAllDifferent = allLines.map(l => new AllDifferent(...l.cells));

// "Same set of five" across all 25 circled cells.
const distinctCount = new Var('D', 'distinct values among the diamond cells', 1);
const distinctCountCell = distinctCount.cell(1);

// Every line read in both directions: 20 numbers total.
const numbers = [];
for (const line of allLines) {
  numbers.push({ line, forward: true, cells: line.cells });
  numbers.push({ line, forward: false, cells: [...line.cells].reverse() });
}
function numberFor(family, key, forward) {
  const line = family.find(l => l.key === key);
  return numbers.find(n => n.line === line && n.forward === forward);
}

// Blue cages: cells (drawn cage geometry) plus which line-direction each is
// attached to, per the short arrow drawn from the cage into that direction's
// starting cell (decoded from the payload's `arrows`).
const CAGE_CLUES = [
  { cageCells: ['R2C1', 'R2C2'], target: numberFor(downRightLines, 0, true) },
  { cageCells: ['R2C8', 'R2C9'], target: numberFor(downLeftLines, 10, true) },
  { cageCells: ['R8C8'], target: numberFor(downRightLines, 0, false) },
  { cageCells: ['R7C9'], target: numberFor(downRightLines, -2, false) },
];

// State machine comparing two 5-digit tuples, interleaved position by
// position: [a0, b0, a1, b1, a2, b2, a3, b3, a4, b4]. Accepts iff at least
// one position differs (order not needed here, just inequality).
const DISTINCT_SPEC = {
  startState: { step: 0, remembered: null, anyDiff: false },
  transition({ step, remembered, anyDiff }, value) {
    if (step % 2 === 0) {
      return { step: step + 1, remembered: value, anyDiff };
    }
    return {
      step: step + 1, remembered: null,
      anyDiff: anyDiff || value !== remembered,
    };
  },
  accept: (state) => state.anyDiff,
  // Without this, the compiler treats `step` as unbounded (no transition
  // ever rejects on its own) and hits the state cap.
  maxDepth: 10,
};
const distinctNFA = NFA.encodeSpec(DISTINCT_SPEC, shape);

const distinctConstraints = [];
for (let i = 0; i < allLines.length; i++) {
  for (let j = i + 1; j < allLines.length; j++) {
    const numsI = numbers.filter(n => n.line === allLines[i]);
    const numsJ = numbers.filter(n => n.line === allLines[j]);
    for (const a of numsI) {
      for (const b of numsJ) {
        const interleaved = [];
        for (let k = 0; k < 5; k++) interleaved.push(a.cells[k], b.cells[k]);
        distinctConstraints.push(
          new NFA(distinctNFA, 'DiagonalNumbersDistinct', ...interleaved));
      }
    }
  }
}

// State machine comparing a clue's "target" tuple against one "other" tuple,
// interleaved as above, then a trailing flag cell: flag must be 1 if the
// other tuple's number is smaller than the target's, else 0 (a tie is
// unreachable here: cross-line ties are excluded by DISTINCT_SPEC above, and
// same-line forward/backward ties are excluded by that line's AllDifferent).
const RANK_LESS_SPEC = {
  startState: { step: 0, remembered: null, decided: null },
  transition({ step, remembered, decided }, value) {
    if (step < 10) {
      if (step % 2 === 0) {
        return { step: step + 1, remembered: value, decided };
      }
      let d = decided;
      if (d === null) {
        if (value < remembered) d = 'less';
        else if (value > remembered) d = 'greater';
      }
      return { step: step + 1, remembered: null, decided: d };
    }
    // step === 10: the flag cell.
    if (value === 1 && decided === 'less') return { step: 11 };
    if (value === 0 && decided === 'greater') return { step: 11 };
    return undefined;
  },
  accept: (state) => state.step === 11,
};
const rankLessNFA = NFA.encodeSpec(RANK_LESS_SPEC, shape);

const OTHER_COUNT = numbers.length - 1; // 19
const FLAG_COUNT = CAGE_CLUES.length * OTHER_COUNT; // 76
const flagVar = new Var('F', 'full-rank order flags', FLAG_COUNT);
// No separate domain restriction: RANK_LESS_SPEC's flag step above already
// rejects every value except 0 or 1 (neither accepting branch matches, so
// the transition returns undefined), so each flag's own DiagonalRankOrder
// NFA already forces it into {0, 1}.

const rankOrderConstraints = [];
const cageRankConstraints = [];
let flagIndex = 0;

for (const clue of CAGE_CLUES) {
  const flagsForClue = [];
  for (const other of numbers) {
    if (other === clue.target) continue;
    flagIndex += 1;
    const flag = flagVar.cell(flagIndex);
    flagsForClue.push(flag);

    const interleaved = [];
    for (let k = 0; k < 5; k++) interleaved.push(clue.target.cells[k], other.cells[k]);
    rankOrderConstraints.push(
      new NFA(rankLessNFA, 'DiagonalRankOrder', ...interleaved, flag));
  }

  // The cage's spelled value equals 1 + (count of smaller numbers), i.e.
  // the target line-direction's rank.
  const cage = clue.cageCells;
  const cageTerms = cage.length === 2
    ? [[cage[0], 10], [cage[1], 1]]
    : [[cage[0], 1]];
  cageRankConstraints.push(
    new Sum(1, ...cageTerms, ...flagsForClue.map(f => [f, -1])));
  if (cage.length === 2) {
    // Rules text N.B.: "two-digit numbers ... do not start with 0", read
    // here as governing these two-digit rank labels (the only "two-digit"
    // numbers the rules name -- the 5-digit line numbers are always 5-digit).
    cageRankConstraints.push(new Given(cage[0], 1, 2, 3, 4, 5, 6, 7, 8));
  }
}

return [
  shape,
  ...lineAllDifferent,
  distinctCount,
  new Given(distinctCountCell, 5),
  new CountDistinct(distinctCountCell, ...DIAMOND_CELLS),
  new WhiteDot('R1C9', 'R2C9'),
  flagVar,
  ...distinctConstraints,
  ...rankOrderConstraints,
  ...cageRankConstraints,
];
