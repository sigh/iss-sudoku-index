// Title: From A to Zeta : A Zodiac Puzzle
// Author: zetamath and friends
// Video: https://www.youtube.com/watch?v=us_d2RLkoDQ
// Source: https://sudokupad.app/yvkb4l2c2j

// Nine gray letter cells (A-H, Z) each hold that letter's digit; the nine
// letters are a permutation of 1-9. Every other clue's numeric value is one
// of these letters (never a literal number known up front), so each clue is
// built as a small state machine that reads the letter's own grid cell first
// (to learn the target digit), then the clue's cells.

const L = {
  A: 'R5C1', B: 'R5C2', C: 'R5C8', D: 'R5C9',
  E: 'R3C5', F: 'R4C5', G: 'R6C5', H: 'R7C5', Z: 'R9C9',
};

function colCells(col, rows) {
  return rows.map(r => makeCellId(r, col));
}
function rowCells(row, cols) {
  return cols.map(c => makeCellId(row, c));
}
const DOWN = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const UP = [9, 8, 7, 6, 5, 4, 3, 2, 1];

// A cage whose total is "?<letter>": digits sum to 10*q + letterValue for
// some unconstrained tens digit q in 1-9 (the leading "?" is never 0, which
// matches the Var's default 1-9 domain). `varPrefix` must be pure letters.
function selfCluedCage(cageCells, letterCell, varPrefix) {
  const qCell = 'V' + varPrefix;
  return [
    new Var(varPrefix, `tens digit for ${varPrefix} cage`, 1),
    new AllDifferent(...cageCells),
    new Sum(0, ...cageCells, [qCell, -10], [letterCell, -1]),
  ];
}

// A little killer diagonal whose total is exactly the letter's value.
function littleKillerLetter(diagonalCells, letterCell) {
  return new EqualSum(diagonalCells, [letterCell]);
}

// A little killer diagonal whose total is "?<letter>" (see selfCluedCage).
function littleKillerSelfClued(diagonalCells, letterCell, varPrefix) {
  const qCell = 'V' + varPrefix;
  return [
    new Var(varPrefix, `tens digit for ${varPrefix} little killer`, 1),
    new Sum(0, ...diagonalCells, [qCell, -10], [letterCell, -1]),
  ];
}

// Quadruple: the letter's digit appears in at least one of the 4 cells.
function quadContainsLetter(quadCells, letterCell, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, found: false };
      const { target, found } = state;
      return { target, found: found || value === target };
    },
    accept: (state) => !!state && state.found === true,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, letterCell, ...quadCells);
}

// Numbered room (door): the digit N cells into the row/column (from this
// side) equals the letter's value, where N is the digit in the first cell
// from this side.
function doorLetter(orderedCells, letterCell, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) {
        // First symbol: the letter's own value (the target).
        return { target: value, expect: undefined, satisfied: false };
      }
      if (state.expect === undefined) {
        // First data cell: its value is N, the position to check.
        const N = value;
        const satisfied = (N === 1) ? (value === state.target) : state.satisfied;
        return { target: state.target, expect: N - 1, satisfied };
      }
      if (state.expect > 0) {
        const expect = state.expect - 1;
        const satisfied = (expect === 0) ? (value === state.target) : state.satisfied;
        return { target: state.target, expect, satisfied };
      }
      return state;
    },
    accept: (state) => !!state && state.satisfied === true,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, letterCell, ...orderedCells);
}

// Skyscraper: the letter's value is the count of cells visible from this
// side (a cell is visible only if strictly greater than every prior cell).
function skyscraperLetter(orderedCells, letterCell, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, maxSeen: 0, count: 0 };
      const { target, maxSeen, count } = state;
      if (value > maxSeen) return { target, maxSeen: value, count: count + 1 };
      return { target, maxSeen, count };
    },
    accept: (state) => !!state && state.count === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, letterCell, ...orderedCells);
}

return [
  new Shape('9x9'),

  // Each letter A-H,Z is a different digit 1-9.
  new AllDifferent(...Object.values(L)),

  // Killer cages, self-clued with "?<letter>".
  ...selfCluedCage(['R5C4', 'R5C5', 'R5C6'], L.Z, 'QCA'),
  ...selfCluedCage(['R4C1', 'R4C2'], L.E, 'QCB'),
  ...selfCluedCage(['R6C1', 'R6C2'], L.H, 'QCC'),
  ...selfCluedCage(['R7C3', 'R8C3', 'R8C4'], L.E, 'QCD'),
  ...selfCluedCage(['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C6', 'R3C7'], L.F, 'QCE'),

  // Little killer diagonals.
  littleKillerLetter(['R9C7', 'R8C8', 'R7C9'], L.G),
  ...littleKillerSelfClued(
    ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'], L.Z, 'QLK'),

  // Quadruple circle.
  quadContainsLetter(['R6C7', 'R6C8', 'R7C7', 'R7C8'], L.A, 'Quad A'),

  // Skyscrapers (buildings).
  skyscraperLetter(colCells(3, DOWN), L.E, 'Skyscraper top C3'),
  skyscraperLetter(rowCells(9, DOWN), L.A, 'Skyscraper left R9'),

  // Numbered rooms (doors).
  doorLetter(colCells(3, UP), L.E, 'Door bottom C3'),
  doorLetter(rowCells(4, UP), L.C, 'Door right R4'),
  doorLetter(rowCells(9, UP), L.G, 'Door right R9'),
  doorLetter(colCells(9, DOWN), L.A, 'Door top C9'),
  doorLetter(colCells(1, UP), L.Z, 'Door bottom C1'),
  doorLetter(rowCells(8, DOWN), L.D, 'Door left R8'),
];
