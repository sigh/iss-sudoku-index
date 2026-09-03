// Title: Count Some Dominoes
// Author: mellowrobinson
// Video: https://www.youtube.com/watch?v=jgATrHS3pBg
// Source: https://sudokupad.app/27qnv0oduh

// Rules encoded below:
//  - Divide the grid into nine non-overlapping regions of nine orthogonally
//    connected cells; every cell holds 1-9 with no repeat in a row, column or
//    region (ChaosConstruction + NoBoxes).
//  - A domino is two cells sharing an edge. The digit in a caged cell says how
//    many dominoes lying entirely inside that cell's region have digits summing
//    to the cage's printed total. A domino only half in the region does not
//    count, and dominoes may overlap, so every orthogonally adjacent pair is
//    judged independently.
//  - Digits separated by an X sum to 10; digits separated by a V sum to 5. The
//    rules state no exhaustiveness clause, so unmarked pairs are unrestricted.
//  - One given digit, R1C5 = 6.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
// Chaos-construction region label paired with each grid cell.
const cc = graph.makeOverlay('CC');

// Drawn single-cell cages: [caged cell, printed total].
const CLUES = [
  ['R1C1', 5], ['R2C3', 5], ['R8C4', 12], ['R2C1', 10], ['R1C4', 7],
  ['R3C2', 10], ['R5C1', 13], ['R2C9', 7], ['R6C9', 7], ['R5C7', 11],
  ['R4C7', 14], ['R5C2', 9], ['R7C5', 5],
];

// Drawn edge marks.
const V_PAIRS = [
  ['R1C1', 'R1C2'], ['R1C3', 'R2C3'], ['R2C1', 'R3C1'],
  ['R3C2', 'R3C3'], ['R8C3', 'R8C4'],
];
const X_PAIRS = [
  ['R3C6', 'R3C7'], ['R5C2', 'R5C3'],
];

// Every domino on the board, as [upper-or-left cell, lower-or-right cell].
const DOMINOES = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    DOMINOES.push([makeCellId(r, c), makeCellId(r, c + 1)]);
  }
}
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    DOMINOES.push([makeCellId(r, c), makeCellId(r + 1, c)]);
  }
}

// The distinct printed totals. A domino's "class" is the index of the total it
// makes (1-based), or NO_CLASS when it makes none of them or straddles two
// regions. There are 8 distinct totals, so the 9 classes fit the Var alphabet.
const TOTALS = [...new Set(CLUES.map(([, total]) => total))].sort((a, b) => a - b);
const NO_CLASS = TOTALS.length + 1;
const classOf = (sum) => {
  const i = TOTALS.indexOf(sum);
  return i < 0 ? NO_CLASS : i + 1;
};

// One class cell per domino, in DOMINOES order.
const domClass = new Var('DM', 'Domino class', DOMINOES.length);
const domClassCell = (i) => domClass.cell(i + 1);

// Classifier: reads [region(a), region(b), digit(a), digit(b), class] for one
// domino and forces the class cell. `region` is the first cell's label; `same`
// records whether the domino lies in a single region, and a straddling domino
// drops its digits (a = 0) so it can only take NO_CLASS.
const classifySpec = {
  startState: { step: 0 },
  transition(state, value) {
    switch (state.step) {
      case 0: return { step: 1, region: value };
      case 1: return { step: 2, same: value === state.region };
      case 2: return { step: 3, a: state.same ? value : 0 };
      case 3: return { step: 4, cls: state.a ? classOf(state.a + value) : NO_CLASS };
      default: return value === state.cls ? { step: 5 } : undefined;
    }
  },
  accept: (state) => state.step === 5,
};
const classifyNFA = NFA.encodeSpec(classifySpec, shape);

// Counter: one machine per printed total. Segment 1 is the caged cell's region
// label, segment 2 walks every domino as [region of its first cell, its class],
// and segment 3 is the caged digit. A domino is counted when its first cell
// shares the caged cell's region -- which for a classified domino means the
// whole domino does -- and its class is this machine's total. `count` saturates
// at OVER_MAX, a sink no digit can match.
const OVER_MAX = 10;
const countSpec = (cls) => ({
  startState: { step: 0 },
  transition(state, value) {
    if (value === SEGMENT_BREAK) {
      return state.step === 0
        ? { step: 1, region: state.region, count: 0, pending: null }
        : { step: 2, count: state.count };
    }
    if (state.step === 0) return { step: 0, region: value };
    if (state.step === 1) {
      if (state.pending === null) {
        return {
          step: 1, region: state.region, count: state.count,
          pending: value === state.region,
        };
      }
      const hit = state.pending && value === cls ? 1 : 0;
      return {
        step: 1, region: state.region,
        count: Math.min(state.count + hit, OVER_MAX), pending: null,
      };
    }
    return value === state.count ? { step: 3 } : undefined;
  },
  accept: (state) => state.step === 3,
});
const countNFA = new Map(
  TOTALS.map(total => [total, NFA.encodeSpec(
    countSpec(classOf(total)), shape, { multiSegment: true })]));

const dominoScan = DOMINOES.flatMap(
  ([a], i) => [cc.at(a), domClassCell(i)]);

return [
  shape,
  new ChaosConstruction(),
  new NoBoxes(),
  domClass,

  new Given('R1C5', 6),

  ...V_PAIRS.map(pair => new V(...pair)),
  ...X_PAIRS.map(pair => new X(...pair)),

  ...DOMINOES.map(([a, b], i) => new NFA(
    classifyNFA, 'DominoClass',
    cc.at(a), cc.at(b), a, b, domClassCell(i))),

  ...CLUES.map(([cell, total]) => new NFA(
    countNFA.get(total), 'DominoCount',
    [cc.at(cell)], dominoScan, [cell])),
];
