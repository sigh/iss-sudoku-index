// Title: Kropki X-Sums
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=RF0N7iZ8FVo
// Source: https://app.crackingthecryptic.com/sudoku/hLFhRQp4gd

// Rules encoded below, in full; nothing is omitted.
//
//  - Normal sudoku rules apply. There are no given digits.
//  - White dots separate two consecutive numbers.
//  - Black dots separate two numbers with a ratio of 1:2.
//  - Not all dots are given, so an unmarked boundary says nothing.
//  - Every row and column has a number outside the grid at each of its two
//    ends. None of them is printed; they must be deduced. Such a number is the
//    sum of the x first digits of that row or column seen from its side of the
//    grid, where x is the first of those digits.
//
// The dots are drawn on three kinds of boundary: between two grid cells,
// between two outside numbers along the same side of the grid, and between an
// outside number and the grid cell it faces. A dot on either of the last two
// kinds relates whole outside numbers (1 to 45), not digits. An outside number
// that no dot touches is unconstrained by the rules and needs no encoding, so
// only the seventeen positions named in the dot tables get one here.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Drawn data: every dot in the source, as the two things whose shared boundary
// it sits on. An endpoint is either a grid cell, or an outside number named by
// its side of the grid and the row or column it reads.
const WHITE_DOTS = [
  ['R3C1', 'R4C1'],
  ['R4C7', 'R5C7'],
  ['top4', 'top5'],
  ['right6', 'right7'],
  ['right7', 'right8'],
  ['right9', 'R9C9'],
];
const BLACK_DOTS = [
  ['R8C1', 'R9C1'],
  ['top2', 'top3'],
  ['top6', 'top7'],
  ['right3', 'right4'],
  ['bottom6', 'bottom7'],
  ['left7', 'R7C1'],
  ['left8', 'left9'],
];

// The grid cells an outside number reads, nearest to it first.
const CLUE_RAYS = {
  top: (n) => graph.ray(makeCellId(1, n), 1, 0),
  bottom: (n) => graph.ray(makeCellId(9, n), -1, 0),
  left: (n) => graph.ray(makeCellId(n, 1), 0, 1),
  right: (n) => graph.ray(makeCellId(n, 9), 0, -1),
};

const CLUE_NAME = /^(top|bottom|left|right)([1-9])$/;
const clueNames = [...new Set([...WHITE_DOTS, ...BLACK_DOTS].flat())]
  .filter((name) => CLUE_NAME.test(name)).sort();
const clueIndex = new Map(clueNames.map((name, i) => [name, i]));

// An outside number runs from 1 (a leading 1, summing itself) to 45 (a leading
// 9, summing the whole row or column), which is past a cell's 1-9 range, so
// each one is held in two cells as value = 9 * (high - 1) + low. That is a
// bijection between 1-45 and (high in 1-5, low in 1-9), so the pair carries no
// freedom of its own.
const high = new Var('H', 'outside number, high part', String(clueNames.length));
const low = new Var('L', 'outside number, low part', String(clueNames.length));
const highCell = (name) => high.cell(clueIndex.get(name) + 1);
const lowCell = (name) => low.cell(clueIndex.get(name) + 1);

// Reads an outside number's two value cells, then the nine grid cells of its
// ray. The first ray digit d is both the count of cells the sum covers and its
// first term, so the state then carries the sum still owed and the number of
// cells left to cover it; once that count runs out the rest of the ray is free.
// A branch dies as soon as the sum owed cannot be reached by the cells left
// (each holds 1 to 9), which is also what forces the count to land on zero
// exactly as the sum does.
const xSumMachine = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    const owe = (owed, left) => {
      if (owed < left || owed > 9 * left) return undefined;
      return left === 0 ? { phase: 'free' } : { phase: 'sum', owed, left };
    };
    switch (state.phase) {
      case 'high':
        // Confines the number to 1-45; a high part of 6 or more overshoots.
        return value <= 5 ? { phase: 'low', high: value } : undefined;
      case 'low':
        return { phase: 'first', total: 9 * (state.high - 1) + value };
      case 'first':
        return owe(state.total - value, value - 1);
      case 'sum':
        return owe(state.owed - value, state.left - 1);
      default:
        return { phase: 'free' };
    }
  },
  accept: (state) => state.phase === 'free',
  maxDepth: 11,
}, shape);

// A dot endpoint as a linear form over cells: coefficient-weighted terms plus
// the constant an outside number's 9 * (high - 1) + low expansion leaves over.
const term = (endpoint, coeff) => (CLUE_NAME.test(endpoint)
  ? { cells: [[highCell(endpoint), 9 * coeff], [lowCell(endpoint), coeff]], constant: -9 * coeff }
  : { cells: [[endpoint, coeff]], constant: 0 });

// sum(coeff * value) === rhs over the given terms.
const linear = (terms, rhs) => new Sum(
  rhs - terms.reduce((total, t) => total + t.constant, 0),
  ...terms.flatMap((t) => t.cells));

const whiteDot = ([a, b]) => new Or([
  linear([term(a, 1), term(b, -1)], 1),
  linear([term(a, 1), term(b, -1)], -1),
]);
const blackDot = ([a, b]) => new Or([
  linear([term(a, 1), term(b, -2)], 0),
  linear([term(a, -2), term(b, 1)], 0),
]);

const isGridPair = (dot) => dot.every((endpoint) => !CLUE_NAME.test(endpoint));

return [
  shape,
  high,
  low,

  ...clueNames.map((name) => new Given(highCell(name), 1, 2, 3, 4, 5)),
  ...clueNames.map((name) => new NFA(
    xSumMachine, `X-Sum ${name}`,
    highCell(name), lowCell(name),
    ...CLUE_RAYS[name.replace(/\d$/, '')](+name.slice(-1)))),

  ...WHITE_DOTS.filter(isGridPair).map((dot) => new WhiteDot(...dot)),
  ...BLACK_DOTS.filter(isGridPair).map((dot) => new BlackDot(...dot)),
  ...WHITE_DOTS.filter((dot) => !isGridPair(dot)).map(whiteDot),
  ...BLACK_DOTS.filter((dot) => !isGridPair(dot)).map(blackDot),
];
