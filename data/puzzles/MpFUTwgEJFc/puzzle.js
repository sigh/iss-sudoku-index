// Title: Ranked Quads
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=MpFUTwgEJFc
// Source: https://sudokupad.app/0oajbse81h

// QUAD CLUES: each digit in a circle must appear in the surrounding 2x2 area,
// with multiplicity (a digit repeated in the circle's printed number must
// repeat that many times in the 2x2). The printed number's digits are the
// quad's values, e.g. "22" -> [2, 2].
//
// FULL QUAD-RANK: reading each of the 25 overlapping 2x2 areas' four cells as
// top-left, top-right, bottom-left, bottom-right gives a 4-digit number. The
// same printed circle number is also the rank of its area's 4-digit number
// among all 25, sorted ascending (rank 1 = lowest). All 25 numbers are
// distinct, so ranks never tie.
//
// The rank rule has no dedicated ISS class, so it is built from primitives:
// for each clued quad, compare its (tl, tr, bl, br) tuple against every one
// of the other 24 quads' tuples. Since every digit is a single value 1-6,
// lexicographic order of the tuple matches numeric order of the 4-digit
// number (no carries). Each comparison is recorded in a {1, 2} flag cell
// (1 = other quad's number is smaller) via a small state machine that reads
// the two tuples digit-by-digit, interleaved, and then the flag; a final
// ContainExact over the 24 flags for a clue pins the count of smaller quads
// to (rank - 1), which is exactly the clue's rank.

function cellAt(r, c) {
  // r, c are 0-indexed grid positions.
  return makeCellId(r + 1, c + 1);
}

// All 25 overlapping 2x2 areas (top-left corner at r, c for r, c in 0..4),
// each read top-left, top-right, bottom-left, bottom-right.
const quads = [];
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    quads.push({
      r, c,
      tl: cellAt(r, c), tr: cellAt(r, c + 1),
      bl: cellAt(r + 1, c), br: cellAt(r + 1, c + 1),
    });
  }
}
const quadAt = new Map(quads.map(q => [`${q.r}_${q.c}`, q]));

// Clued quads: top-left corner (0-indexed), the circle's printed digits (for
// the QUAD CLUES rule), and the circle's number as a rank (for FULL QUAD-RANK).
const CLUES = [
  { r: 1, c: 0, digits: [2, 2], rank: 22 },
  { r: 1, c: 1, digits: [6], rank: 6 },
  { r: 3, c: 1, digits: [1, 1], rank: 11 },
  { r: 4, c: 1, digits: [5], rank: 5 },
];

// State machine comparing one clued ("target") quad against one other quad.
// Cell sequence: [target_tl, other_tl, target_tr, other_tr, target_bl,
// other_bl, target_br, other_br, flag]. `flag` must be 1 if the "other"
// quad's 4-digit number is smaller than the target's, else 2 (values are
// guaranteed distinct by the puzzle, so exactly one holds).
const lexLessSpec = {
  startState: { step: 0, remembered: null, decided: null },
  transition({ step, remembered, decided }, value) {
    if (step < 8) {
      if (step % 2 === 0) {
        // Reading the target's digit for this position; remember it.
        return { step: step + 1, remembered: value, decided };
      }
      // Reading the other quad's digit for this position; compare unless an
      // earlier digit already decided the order.
      let d = decided;
      if (d === null) {
        if (value < remembered) d = 'less';
        else if (value > remembered) d = 'greater';
      }
      return { step: step + 1, remembered: null, decided: d };
    }
    // step === 8: the flag cell, checked against the decided order.
    if (value === 1 && decided === 'less') return { step: 9 };
    if (value === 2 && decided === 'greater') return { step: 9 };
    return undefined;
  },
  accept: (state) => state.step === 9,
};
const lexLessNFA = NFA.encodeSpec(lexLessSpec, 6);

// "All the 4-digit numbers are different" is itself a rule clause of
// FULL QUAD-RANK (needed for "rank" to be well-defined at all), not merely a
// solver-side observation: without it, a grid where two *unclued* quads tie
// still satisfies every rank-count check above, so it must be enforced
// directly. State machine over one pair's 8 digits: accept unless all four
// positions match.
const distinctSpec = {
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
  maxDepth: 8,
};
const distinctNFA = NFA.encodeSpec(distinctSpec, 6);

const distinctConstraints = [];
for (let i = 0; i < quads.length; i++) {
  for (let j = i + 1; j < quads.length; j++) {
    const a = quads[i], b = quads[j];
    distinctConstraints.push(new NFA(
      distinctNFA, 'QuadValuesDistinct',
      a.tl, b.tl, a.tr, b.tr, a.bl, b.bl, a.br, b.br));
  }
}

const OTHER_COUNT = quads.length - 1; // 24
const flagVar = new Var('Q', 'quad-rank order flags', CLUES.length * OTHER_COUNT);

const quadClueConstraints = [];
const rankConstraints = [];
let flagIndex = 0;

for (const clue of CLUES) {
  const target = quadAt.get(`${clue.r}_${clue.c}`);
  quadClueConstraints.push(new Quad(target.tl, ...clue.digits));

  const flagsForClue = [];
  for (const other of quads) {
    if (other.r === clue.r && other.c === clue.c) continue;
    flagIndex += 1;
    const flag = flagVar.cell(flagIndex);
    flagsForClue.push(flag);
    rankConstraints.push(new Given(flag, 1, 2));
    rankConstraints.push(new NFA(
      lexLessNFA, 'QuadRankOrder',
      target.tl, other.tl, target.tr, other.tr,
      target.bl, other.bl, target.br, other.br,
      flag));
  }

  // Exactly (rank - 1) of the other 24 quads must have a smaller 4-digit
  // number, which makes this quad's number rank `clue.rank` among all 25.
  rankConstraints.push(new ContainExact(
    Array(clue.rank - 1).fill(1).join('_'), ...flagsForClue));
}

return [
  new Shape('6x6'),
  flagVar,
  ...quadClueConstraints,
  ...distinctConstraints,
  ...rankConstraints,
];
