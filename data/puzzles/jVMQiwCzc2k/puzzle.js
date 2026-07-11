// Title: Yin Yang Doubler Uniqueness
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=jVMQiwCzc2k
// Source: https://sudokupad.app/yl0n45rfll

// Normal sudoku. Yin-Yang: shade some cells so all shaded cells are one
// orthogonally-connected region and all unshaded cells are another, with no
// 2x2 block entirely one shade. A shaded cell's VALUE is its digit doubled; an
// unshaded cell's VALUE is its digit doubled minus one. Renban lines, arrow
// sums, X pairs (sum 10) and black dots (2:1 ratio) all act on these VALUES,
// not the raw digits. Extra uniqueness: within each constraint TYPE (renban /
// arrow / X / black dot), no VALUE repeats across any cell that belongs to
// that type anywhere in the grid -- not just within one line or clue.
//
// ENCODED HERE: normal sudoku; a VS shade flag (1 = unshaded, 2 = shaded) per
// cell; and, since values run 1-18 (too wide for a single ISS cell domain),
// every value-consuming rule (2x2, renban, arrow, X, black dot, and the four
// cross-clue uniqueness groups) is an NFA that reads each cell's raw (digit,
// shade) pair and computes 2*digit-2+shade internally. OMITTED: the global
// orthogonal-connectivity requirement for the shaded region and for the
// unshaded region -- ISS has no general "these Var-labelled cells form one
// connected component" constraint, only local shading rules.

const UNSHADED = 1;
const SHADED = 2;
const DIGIT_VALUES = 9;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeOf = cell => shade.at(cell);
const gridCells = graph.cells();

const constraints = [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),
];
const add = (...cs) => constraints.push(...cs);

for (const cell of gridCells) add(new Given(shadeOf(cell), UNSHADED, SHADED));

const value = (digit, shadeValue) => 2 * digit - 2 + shadeValue;
const dsOf = cell => [cell, shadeOf(cell)];
const dsFlat = cells => cells.flatMap(dsOf);

// No 2x2 block is entirely shaded or entirely unshaded.
const notAllSameNFA = NFA.encodeSpec({
  startState: null,
  transition: (state, v) => state === null
    ? { first: v, allSame: true }
    : { first: state.first, allSame: state.allSame && v === state.first },
  accept: (state) => state !== null && !state.allSame,
}, SHADED);
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const block = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ].map(shadeOf);
    add(new NFA(notAllSameNFA, 'no-monochrome-2x2', ...block));
  }
}

// --- Renban lines (purple): the cells' VALUES form a consecutive, non-
// repeating set, in any order. Classic pairwise trick: n values are a
// consecutive non-repeating set iff every pair differs, and every pair's
// difference is below n (the line length) -- avoids tracking a running
// min/max/seen-set, which blows up the NFA state count for a 7-cell line. ---
const renbanPairNFACache = new Map();
const renbanPairNFA = (lineLength) => {
  if (renbanPairNFACache.has(lineLength)) return renbanPairNFACache.get(lineLength);
  const spec = NFA.encodeSpec({
    startState: { stage: 0 },
    transition: (state, v) => {
      if (state.stage === 0) return { stage: 1, dA: v };
      if (state.stage === 1) return { stage: 2, vA: value(state.dA, v) };
      if (state.stage === 2) return { stage: 3, vA: state.vA, dB: v };
      return { stage: 4, vA: state.vA, vB: value(state.dB, v) };
    },
    accept: (state) => state.stage === 4 &&
      state.vA !== state.vB && Math.abs(state.vA - state.vB) < lineLength,
  }, DIGIT_VALUES);
  renbanPairNFACache.set(lineLength, spec);
  return spec;
};

const renbanLines = [
  ['R4C3', 'R5C3'],
  ['R6C1', 'R6C2'],
  ['R7C1', 'R7C2', 'R7C3', 'R6C3', 'R6C4', 'R5C4', 'R4C4'],
  ['R1C4', 'R2C4'],
  ['R1C2', 'R2C2'],
  ['R4C8', 'R4C9'],
];
for (const line of renbanLines) {
  const nfa = renbanPairNFA(line.length);
  for (let i = 0; i < line.length; i++) {
    for (let j = i + 1; j < line.length; j++) {
      add(new NFA(nfa, 'renban', ...dsFlat([line[i], line[j]])));
    }
  }
}

// --- Arrows: the VALUES along the arrow sum to the VALUE in the circle. Two
// arrows share the R7C5 circle (two independent arms, both summing to it).
// value(d,s) = 2d + s - 2 is linear, so "sum(arm values) = bulb value"
// reduces to one linear equation over the raw digit/shade cells directly --
// avoids an n-ary NFA over up to 4 cells, whose (digit x shade) branching
// factor blows past the compile-time state limit. ---
const arrows = [
  { bulb: 'R7C5', arm: ['R8C4', 'R9C4'] },
  { bulb: 'R7C5', arm: ['R6C6', 'R5C6'] },
  { bulb: 'R8C8', arm: ['R9C7', 'R8C7', 'R8C6'] },
  { bulb: 'R3C7', arm: ['R3C6', 'R2C6'] },
];
for (const { bulb, arm } of arrows) {
  add(new Sum(2 * arm.length - 2,
    [bulb, -2], [shadeOf(bulb), -1],
    ...arm.flatMap(cell => [[cell, 2], shadeOf(cell)])));
}

// --- X: the two VALUES joined by an X sum to 10. ---
const xSumNFA = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (state, v) => {
    if (state.stage === 0) return { stage: 1, dA: v };
    if (state.stage === 1) return { stage: 2, vA: value(state.dA, v) };
    if (state.stage === 2) return { stage: 3, vA: state.vA, dB: v };
    return { stage: 4, vA: state.vA, vB: value(state.dB, v) };
  },
  accept: (state) => state.stage === 4 && state.vA + state.vB === 10,
}, DIGIT_VALUES);

const xPairs = [
  ['R4C1', 'R5C1'],
  ['R4C2', 'R5C2'],
];
for (const [a, b] of xPairs) add(new NFA(xSumNFA, 'x-sum-10', ...dsFlat([a, b])));

// --- Black dots: one VALUE is double the other. ---
const blackDotNFA = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (state, v) => {
    if (state.stage === 0) return { stage: 1, dA: v };
    if (state.stage === 1) return { stage: 2, vA: value(state.dA, v) };
    if (state.stage === 2) return { stage: 3, vA: state.vA, dB: v };
    return { stage: 4, vA: state.vA, vB: value(state.dB, v) };
  },
  accept: (state) => state.stage === 4 &&
    (state.vA === 2 * state.vB || state.vB === 2 * state.vA),
}, DIGIT_VALUES);

const blackDots = [
  ['R3C2', 'R3C3'],
  ['R9C2', 'R9C3'],
  ['R7C6', 'R7C7'],
  ['R5C7', 'R6C7'],
  ['R2C5', 'R3C5'],
];
for (const [a, b] of blackDots) add(new NFA(blackDotNFA, 'black-dot-ratio', ...dsFlat([a, b])));

// --- Cross-clue uniqueness: within each constraint type, no VALUE repeats
// across any cell that belongs to that type, anywhere in the grid. Modelled
// as a pairwise "different value" NFA between every pair of cells in the
// type's cell set (values are equal iff digit and shade both match, since
// odd/shaded and even/unshaded values never collide). ---
const valuesDifferNFA = NFA.encodeSpec({
  startState: { stage: 0 },
  transition: (state, v) => {
    if (state.stage === 0) return { stage: 1, dA: v };
    if (state.stage === 1) return { stage: 2, vA: value(state.dA, v) };
    if (state.stage === 2) return { stage: 3, vA: state.vA, dB: v };
    return { stage: 4, vA: state.vA, vB: value(state.dB, v) };
  },
  accept: (state) => state.stage === 4 && state.vA !== state.vB,
}, DIGIT_VALUES);

function uniqueCells(cellLists) {
  const seen = new Set();
  const cells = [];
  for (const list of cellLists) {
    for (const cell of list) {
      if (!seen.has(cell)) { seen.add(cell); cells.push(cell); }
    }
  }
  return cells;
}

function addGroupUniqueness(cells) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      add(new NFA(valuesDifferNFA, 'group-value-uniqueness', ...dsFlat([cells[i], cells[j]])));
    }
  }
}

addGroupUniqueness(uniqueCells(renbanLines));
addGroupUniqueness(uniqueCells(arrows.map(({ bulb, arm }) => [bulb, ...arm])));
addGroupUniqueness(uniqueCells(xPairs));
addGroupUniqueness(uniqueCells(blackDots));

return constraints;
