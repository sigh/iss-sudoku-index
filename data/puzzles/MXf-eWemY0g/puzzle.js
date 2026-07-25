// Title: Mischief
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=MXf-eWemY0g
// Source: https://sudokupad.app/6dugnv08rk

// Normal sudoku rules apply on a 9x9 grid with standard 3x3 boxes; there are
// no given digits (the grid's initial fog is solving UI, not encoded).
//
// Small "spot" dots on a line divide it into segments; a segment total is
// the sum of the digits in that segment, and digits never repeat within a
// segment (segments may repeat digits with each other).
//
// EQUAL SEGMENT (blue-painted line): every segment has the same total.
// SEGMENT RENBAN (pink-painted line): the segment totals form a set of
//   non-repeating consecutive integers, in any order.
// SEGMENT NABNER (yellow-painted line): no two segment totals are equal or
//   consecutive.
//
// SHENANIGANS: exactly one digit 1-9 is the "mischief digit" VM (solver
// determined, never given). A line containing VM is painted the wrong
// colour -- its true rule is one of the *other* two -- and a line not
// containing VM is painted correctly.

// Segment tables: hand-transcribed from the drawn line paths and the small
// coloured spot marks on them, each spot matched to the line it sits on by
// colour and position. One pair of drawn strokes shares an exact endpoint
// and is one continuous line, not two. Segment order within a line does not
// matter to any of the three rules, so closed-loop lines are listed as
// plain segment sets.
//
// Drawn colours matched to the rules' named colours: the yellow lines are
// unambiguously "a yellow line"; between the remaining two, sky-blue is
// named "BLUE LINE" and light violet is named "PINK LINE".

const LINES = [
  ['skyblue', [['R7C3'], ['R6C3', 'R5C3', 'R4C3']]],
  ['skyblue', [['R1C4', 'R2C5'], ['R2C6']]],
  ['skyblue', [['R1C5'], ['R1C6'], ['R1C7'], ['R1C8'], ['R1C9']]],

  ['violet', [['R4C1'], ['R3C1'], ['R2C1'], ['R1C1'], ['R1C2']]],
  ['violet', [['R1C3'], ['R1C4']]],
  ['violet', [['R4C2', 'R5C2', 'R6C2', 'R7C2'], ['R8C2']]],
  ['violet', [['R3C2'], ['R3C3']]],
  ['violet', [['R2C4'], ['R3C4']]],
  ['violet', [['R3C5', 'R3C6'], ['R3C7']]],
  ['violet', [['R7C5'], ['R7C6']]],

  ['yellow', [
    ['R9C2', 'R9C3'], ['R9C4'], ['R9C5', 'R9C6'], ['R9C7'], ['R9C8', 'R9C9'],
    ['R8C9', 'R7C9'], ['R6C9'], ['R5C9'],
    ['R4C9', 'R3C9', 'R2C9', 'R2C8', 'R2C7'], ['R2C6'],
  ]],
  ['yellow', [['R9C1', 'R8C1', 'R7C1', 'R6C1'], ['R5C1']]],
  ['yellow', [['R2C2'], ['R2C3']]],
  ['yellow', [['R4C4', 'R5C4'], ['R6C4', 'R7C4', 'R8C4']]],
  ['yellow', [['R4C6'], ['R4C5'], ['R5C5'], ['R6C5', 'R6C6']]],
  ['yellow', [['R5C7', 'R6C7'], ['R6C8', 'R5C8'], ['R4C8', 'R3C8', 'R4C7']]],
  ['yellow', [['R7C7', 'R8C7'], ['R8C8', 'R7C8']]],
];

const TYPE_FOR_COLOR = { skyblue: 'equal', violet: 'renban', yellow: 'nabner' };
const TYPES = ['equal', 'renban', 'nabner'];

const pairIdx = (n) => {
  const out = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([i, j]);
  return out;
};

// A segment total can be as large as 35 (5 distinct digits from 1-9), well
// past the grid's own 1-9 alphabet, so totals are never materialized as a
// single cell/Var value. Instead, each pairwise comparison between two
// segments' totals is one small NFA that reads segment A's cells, then
// segment B's cells (as two multiSegment arrays), accumulating each
// segment's own running sum in state and comparing the two finished sums in
// `accept`. The state never carries more than "segment A's finished total"
// plus "the in-progress running total", so it stays tiny regardless of the
// segments' digit values.
const segPairNFA = (relFn, label, segA, segB) => {
  const spec = NFA.encodeSpec({
    startState: { sumA: null, cur: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { sumA: state.cur, cur: 0 };
      return { sumA: state.sumA, cur: state.cur + value };
    },
    accept: (state) => state.sumA !== null && relFn(state.sumA, state.cur),
    // +1: maxDepth also counts the synthetic SEGMENT_BREAK symbol between
    // the two segments.
    maxDepth: segA.length + segB.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(spec, label, segA, segB);
};

// Each rule is a pairwise condition over every pair of a line's segments,
// expressed as a positive form (the rule holds) and its De Morgan negation
// (the rule does not hold), so a line's true rule can be asserted exclusive
// of the other two (see below).
const RULES = {
  // Equal: every pair of segment totals is equal.
  equal: {
    pos: (segs, label) => new And(pairIdx(segs.length).map(([i, j]) =>
      segPairNFA((a, b) => a === b, `${label}_${i}_${j}`, segs[i], segs[j]))),
    neg: (segs, label) => new Or(pairIdx(segs.length).map(([i, j]) =>
      segPairNFA((a, b) => a !== b, `${label}_${i}_${j}`, segs[i], segs[j]))),
  },
  // Renban: totals are all-different and every pairwise gap is <= K-1 (with
  // K distinct integers, a spread of exactly K-1 is precisely a consecutive
  // set, and K-1 is also the *smallest* spread K distinct integers can have,
  // so bounding every pairwise gap by K-1 forces exactly that spread).
  renban: {
    pos: (segs, label) => {
      const K = segs.length;
      return new And(pairIdx(K).map(([i, j]) => segPairNFA(
        (a, b) => a !== b && Math.abs(a - b) <= K - 1,
        `${label}_${i}_${j}`, segs[i], segs[j])));
    },
    neg: (segs, label) => {
      const K = segs.length;
      return new Or(pairIdx(K).map(([i, j]) => segPairNFA(
        (a, b) => a === b || Math.abs(a - b) > K - 1,
        `${label}_${i}_${j}`, segs[i], segs[j])));
    },
  },
  // Nabner: every pair of totals differs by >= 2 (this alone also forces
  // all-different, since a difference of 0 is excluded).
  nabner: {
    pos: (segs, label) => new And(pairIdx(segs.length).map(([i, j]) => segPairNFA(
      (a, b) => Math.abs(a - b) >= 2, `${label}_${i}_${j}`, segs[i], segs[j]))),
    neg: (segs, label) => new Or(pairIdx(segs.length).map(([i, j]) => segPairNFA(
      (a, b) => Math.abs(a - b) < 2, `${label}_${i}_${j}`, segs[i], segs[j]))),
  },
};

// Whether a line's cells contain the mischief digit VM.
const containsMischief = (cells) =>
  new Or(cells.map(c => new SameValues(2, 'VM', c)));
const notContainsMischief = (cells) =>
  new And(cells.map(c => new AllDifferent('VM', c)));

const lineConstraints = LINES.flatMap(([paintedColor, segs], li) => {
  const label = `Line${li + 1}`;
  const allCells = segs.flat();
  const paintedType = TYPE_FOR_COLOR[paintedColor];

  // For each candidate true type t: t holds AND neither other type also
  // holds (the line's true rule is unique, mirroring the puzzle's "every
  // line follows one of the three line rules"), combined with the
  // colour-vs-mischief requirement: the painted type needs the mischief
  // digit absent, any other true type needs it present.
  const branches = TYPES.map((t) => {
    const others = TYPES.filter(u => u !== t);
    const exactlyT = new And([
      RULES[t].pos(segs, `${label}_${t}`),
      ...others.map(u => RULES[u].neg(segs, `${label}_not${u}`)),
    ]);
    const colourTerm = t === paintedType ? notContainsMischief(allCells) : containsMischief(allCells);
    return new And([exactlyT, colourTerm]);
  });

  return [
    ...segs.filter(s => s.length > 1).map(s => new AllDifferent(...s)),
    new Or(branches),
  ];
});

return [
  new Shape('9x9'),
  new Var('M', 'Mischief digit', 1),
  ...lineConstraints,
];
