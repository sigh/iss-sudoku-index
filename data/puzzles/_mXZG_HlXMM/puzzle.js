// Title: Thing
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=_mXZG_HlXMM
// Source: https://app.crackingthecryptic.com/sudoku/nRLRNDQ28T

// Rules encoded:
// - Standard 6x6 sudoku: 1-6 once per row, column and box. The payload's six
//   regions are the default 2x3 box tiling for a 6x6 grid, so no explicit
//   region constraint is needed.
// - Doublers: exactly one cell per row, column and box is a "doubler". A
//   parallel flag Var per grid cell (1 = plain, 2 = doubler) tracks this.
//   Every rule below other than the row/column/box placement uses each
//   cell's EFFECTIVE value (digit * flag), per "The value of this cell
//   counts as double its digit for the other rules."
// - "Each digit appears once in the set of doublers": the six doubler
//   cells' raw digits are pairwise distinct. Encoded as one pass over the
//   whole grid that rejects a repeated digit among flagged (doubler) cells.
// - Arrows: the effective value of the circled (bulb) cell equals the sum
//   of the effective values along its arm.
// - Black circles: none of a circle's surrounding four cells may reach the
//   listed value(s) as an EFFECTIVE value (a plain digit, or a doubled
//   digit that lands on it) -- "a black circle containing a 4 excludes
//   both a regular 4 and a doubled 2, but not a doubled 4."

const graph = cellGraph('6x6');

// Doubler flags: one parallel Var per grid cell, restricted to {1, 2}.
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);

const oneDoublerPerGroup = [
  ...flags.rows(),
  ...flags.columns(),
  ...flags.boxes(),
].map(group => new ContainExact('2', ...group));

// Global: no digit is used by two different doubler cells. Scans the whole
// grid as (digit, flag) pairs, carrying a bitmask of digits already claimed
// by a doubler cell; a repeat has no transition, so the constraint fails.
const distinctDoublerDigitsSpec = NFA.encodeSpec({
  startState: { awaiting: 'digit', bitmask: 0 },
  transition: (state, value) => {
    if (state.awaiting === 'digit') {
      return { awaiting: 'flag', bitmask: state.bitmask, digit: value };
    }
    if (value === 2) {
      const bit = 1 << (state.digit - 1);
      if (state.bitmask & bit) return undefined;  // digit already used by a doubler
      return { awaiting: 'digit', bitmask: state.bitmask | bit };
    }
    return { awaiting: 'digit', bitmask: state.bitmask };
  },
  accept: state => state.awaiting === 'digit',
}, 6);

const distinctDoublerDigits = new NFA(
  distinctDoublerDigitsSpec, 'distinct doubler digits',
  graph.cells().flatMap(cell => [cell, flag(cell)]));

// Arrows: [bulb cell, arm cells...] -- the bulb is the cell the drawn
// circle sits on, followed by the arrow's arm cells in path order.
const arrows = [
  ['R3C2', ['R2C3', 'R1C3']],
  ['R1C4', ['R2C4', 'R2C5']],
  ['R6C3', ['R5C3', 'R5C4']],
];

// Effective-value arrow sum: reads bulbDigit, bulbFlag, then (armDigit,
// armFlag) pairs, and accepts once the running arm sum of effective values
// equals the bulb's own effective value.
const arrowSumSpec = NFA.encodeSpec({
  startState: { stage: 'bulbDigit' },
  transition: (state, value) => {
    switch (state.stage) {
      case 'bulbDigit':
        return { stage: 'bulbFlag', bulbDigit: value };
      case 'bulbFlag':
        return { stage: 'armDigit', target: state.bulbDigit * value, sum: 0 };
      case 'armDigit':
        return {
          stage: 'armFlag', target: state.target, sum: state.sum,
          armDigit: value,
        };
      case 'armFlag':
        return {
          stage: 'armDigit', target: state.target,
          // Clamp so the sum can't climb past the point of failure.
          sum: Math.min(state.sum + state.armDigit * value, state.target + 1),
        };
    }
  },
  accept: state => state.stage === 'armDigit' && state.sum === state.target,
}, 6);

const arrowConstraints = arrows.map(([bulb, arm]) => new NFA(
  arrowSumSpec, 'arrow',
  [bulb, flag(bulb), ...arm.flatMap(cell => [cell, flag(cell)])]));

// Black circles: [corner's four cells, excluded effective value(s)].
// Provenance: a black circle drawn at the shared corner of the four cells,
// labelled with the excluded digits stacked together (e.g. "356"), read as
// several digit characters -- not one multi-digit number, which the 1-6
// range can't hold -- the same convention as a normal multi-value Quad.
const blackCircles = [
  [['R1C1', 'R1C2', 'R2C1', 'R2C2'], [3, 5, 6]],
  [['R2C5', 'R2C6', 'R3C5', 'R3C6'], [4]],
  [['R4C1', 'R4C2', 'R5C1', 'R5C2'], [1, 2]],
  [['R5C5', 'R5C6', 'R6C5', 'R6C6'], [6]],
];

const blackCircleConstraints = blackCircles.flatMap(([cells, excluded]) => {
  const key = Pair.fnToKey((digit, f) => !excluded.includes(digit * f), 6);
  return cells.map(
    cell => new Pair(key, 'black circle exclusion', cell, flag(cell)));
});

return [
  new Shape('6x6'),
  flags.toVar('doubler flags'),
  ...graph.cells().map(cell => new Given(flag(cell), 1, 2)),
  ...oneDoublerPerGroup,
  distinctDoublerDigits,
  ...arrowConstraints,
  ...blackCircleConstraints,
];
