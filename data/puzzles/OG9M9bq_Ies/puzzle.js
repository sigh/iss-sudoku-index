// Title: Two Truths And A Region
// Author: gdc
// Video: https://www.youtube.com/watch?v=OG9M9bq_Ies
// Source: https://sudokupad.app/4ssf9qr9l9
//
// Normal sudoku rules, no givens, standard 3x3 boxes.
//
// Six clue types (Cages, V, black dots, Renban, Arrows, Double Arrows) each
// have exactly three drawn clues that don't share cells. Within each type,
// exactly two of the three are correct and one is "lying" (its cells do not
// satisfy the type's arithmetic). Within each type, every cell clued by that
// type - including the liar's cells - holds a different digit.
//
// Encoding pattern: one flag Var per clue (1 = correct, 2 = lying). A single
// NFA per clue reads [flag, ...clueCells] and accepts only when the flag
// agrees with whether the clue's arithmetic actually holds. A ContainExact
// over the three flags in a type then forces exactly two 1s and one 2,
// without pre-selecting which clue is the liar (that stays a real deduction).
// A separate AllDifferent over the union of all three clues' cells encodes
// the per-type "including the liar, all different" rule directly, since it
// holds unconditionally (not only when a clue is correct).

// A flag-gated linear-equation check: sum(coeff_i * cell_i) == target.
// Cells are read in the order [flag, ...cells]; coeffs has one entry per
// cell (not counting the flag). The state becomes absorbing once all
// coeffs have been consumed, so the compiled state space stays bounded
// (NFA.encodeSpec otherwise explores the transition function unboundedly).
function linearFlagSpec(coeffs, target) {
  const length = coeffs.length;
  return {
    startState: { flag: null, sum: 0, idx: 0 },
    transition: (state, value) => {
      if (state.flag === null) return { flag: value, sum: 0, idx: 0 };
      if (state.idx >= length) return state;
      return {
        flag: state.flag,
        sum: state.sum + coeffs[state.idx] * value,
        idx: state.idx + 1,
      };
    },
    accept: (state) => {
      const holds = state.sum === target;
      return state.flag === 1 ? holds : holds === false;
    },
  };
}

// A flag-gated Renban check over cells read as [flag, ...cells]: holds when
// the cells form a single consecutive run (max - min === count - 1). Cell
// distinctness within the run is guaranteed separately by the per-type
// AllDifferent, so it is not re-checked here. Absorbing past `length` cells
// for the same bounded-state-space reason as linearFlagSpec.
function renbanFlagSpec(length) {
  return {
    startState: { flag: null, min: null, max: null, count: 0 },
    transition: (state, value) => {
      if (state.flag === null) {
        return { flag: value, min: null, max: null, count: 0 };
      }
      if (state.count >= length) return state;
      const min = state.min === null ? value : Math.min(state.min, value);
      const max = state.max === null ? value : Math.max(state.max, value);
      return { flag: state.flag, min, max, count: state.count + 1 };
    },
    accept: (state) => {
      const holds = state.max - state.min === state.count - 1;
      return state.flag === 1 ? holds : holds === false;
    },
  };
}

// A flag-gated black-dot check over exactly [flag, cellA, cellB]: holds when
// one digit is double the other, in either direction.
function blackDotFlagSpec() {
  return {
    startState: { flag: null, first: null, holds: null },
    transition: (state, value) => {
      if (state.flag === null) return { flag: value, first: null, holds: null };
      if (state.first === null) return { flag: state.flag, first: value, holds: null };
      const holds = value === 2 * state.first || state.first === 2 * value;
      return { flag: state.flag, first: state.first, holds };
    },
    accept: (state) => (state.flag === 1 ? state.holds : state.holds === false),
  };
}

function linearFlagConstraint(name, flagCell, cells, coeffs, target) {
  const encoded = NFA.encodeSpec(linearFlagSpec(coeffs, target), 9);
  return new NFA(encoded, name, flagCell, ...cells);
}

function renbanFlagConstraint(name, flagCell, cells) {
  const encoded = NFA.encodeSpec(renbanFlagSpec(cells.length), 9);
  return new NFA(encoded, name, flagCell, ...cells);
}

function blackDotFlagConstraint(name, flagCell, cellA, cellB) {
  const encoded = NFA.encodeSpec(blackDotFlagSpec(), 9);
  return new NFA(encoded, name, flagCell, cellA, cellB);
}

// A flag-gated single-cell equation check: the single-cell case of
// linearFlagConstraint. Reading just [flagCell, cell] is a genuine binary
// relation between two cells, so it is expressed as a Pair rather than an NFA.
function singleCellFlagConstraint(name, flagCell, cell, coeff, target) {
  const key = Pair.fnToKey((flag, value) => {
    const holds = coeff * value === target;
    return flag === 1 ? holds : holds === false;
  }, 9);
  return new Pair(key, name, flagCell, cell);
}

// Builds the flag Var, its {1,2} domain, the three clue NFAs, and the
// exactly-one-liar ContainExact for one clue type.
function truthOrLieGroup(prefix, clueSpecs, buildClueConstraint) {
  const flags = new Var(prefix, `${prefix} truth flags (1=correct,2=lying)`, 3);
  const constraints = [flags];
  for (let i = 0; i < 3; i++) {
    constraints.push(new Given(flags.cell(i + 1), 1, 2));
  }
  clueSpecs.forEach((spec, i) => {
    constraints.push(buildClueConstraint(`${prefix}${i + 1}`, flags.cell(i + 1), spec));
  });
  // Exactly two flags read "1" (correct) and one reads "2" (lying).
  constraints.push(
    new ContainExact('1_1_2', flags.cell(1), flags.cell(2), flags.cell(3)));
  return constraints;
}

const cageClues = [
  { cells: ['R1C1', 'R1C2'], coeffs: [1, 1], target: 9 },
  { cells: ['R6C3'], coeffs: [1], target: 1 },
  { cells: ['R2C7', 'R3C7', 'R4C7'], coeffs: [1, 1, 1], target: 12 },
];

const vClues = [
  { cells: ['R1C1', 'R1C2'], coeffs: [1, 1], target: 5 },
  { cells: ['R7C3', 'R7C4'], coeffs: [1, 1], target: 5 },
  { cells: ['R7C7', 'R7C8'], coeffs: [1, 1], target: 5 },
];

// Arrow: bulb - sum(shaft) == 0.
const arrowClues = [
  { cells: ['R4C3', 'R5C3'], coeffs: [1, -1], target: 0 },
  { cells: ['R6C4', 'R6C5', 'R6C6', 'R6C7'], coeffs: [1, -1, -1, -1], target: 0 },
  { cells: ['R4C8', 'R4C9', 'R5C9'], coeffs: [1, -1, -1], target: 0 },
];

// Double Arrow: bulb1 + bulb2 - sum(remaining) == 0.
const doubleArrowClues = [
  { cells: ['R5C1', 'R3C3', 'R4C2'], coeffs: [1, 1, -1], target: 0 },
  { cells: ['R5C8', 'R7C9', 'R6C8', 'R6C9'], coeffs: [1, 1, -1, -1], target: 0 },
  // No remaining cells: the two circles alone must sum to 0, which two grid
  // digits (1-9) never do, so this clue is structurally always the liar.
  { cells: ['R8C3', 'R8C4'], coeffs: [1, 1], target: 0 },
];

const dotClues = [
  ['R2C3', 'R2C4'],
  ['R1C8', 'R2C8'],
  ['R9C4', 'R9C5'],
];

const renbanClues = [
  ['R1C5', 'R2C5', 'R3C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R7C2', 'R8C1', 'R9C1'],
];

const constraints = [
  new Shape('9x9'),

  ...truthOrLieGroup('CGF', cageClues, (name, flagCell, spec) =>
    spec.cells.length === 1
      ? singleCellFlagConstraint(
          name, flagCell, spec.cells[0], spec.coeffs[0], spec.target)
      : linearFlagConstraint(name, flagCell, spec.cells, spec.coeffs, spec.target)),
  new AllDifferent('R1C1', 'R1C2', 'R6C3', 'R2C7', 'R3C7', 'R4C7'),

  ...truthOrLieGroup('VFL', vClues, (name, flagCell, spec) =>
    linearFlagConstraint(name, flagCell, spec.cells, spec.coeffs, spec.target)),
  new AllDifferent('R1C1', 'R1C2', 'R7C3', 'R7C4', 'R7C7', 'R7C8'),

  ...truthOrLieGroup('DOT', dotClues, (name, flagCell, cells) =>
    blackDotFlagConstraint(name, flagCell, cells[0], cells[1])),
  new AllDifferent('R2C3', 'R2C4', 'R1C8', 'R2C8', 'R9C4', 'R9C5'),

  ...truthOrLieGroup('REN', renbanClues, (name, flagCell, cells) =>
    renbanFlagConstraint(name, flagCell, cells)),
  new AllDifferent(
    'R1C5', 'R2C5', 'R3C5', 'R7C6', 'R8C6', 'R9C6', 'R7C2', 'R8C1', 'R9C1'),

  ...truthOrLieGroup('ARW', arrowClues, (name, flagCell, spec) =>
    linearFlagConstraint(name, flagCell, spec.cells, spec.coeffs, spec.target)),
  new AllDifferent(
    'R4C3', 'R5C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R4C8', 'R4C9', 'R5C9'),

  ...truthOrLieGroup('DAF', doubleArrowClues, (name, flagCell, spec) =>
    linearFlagConstraint(name, flagCell, spec.cells, spec.coeffs, spec.target)),
  new AllDifferent(
    'R5C1', 'R3C3', 'R4C2', 'R5C8', 'R7C9', 'R6C8', 'R6C9', 'R8C3', 'R8C4'),
];

return constraints;
