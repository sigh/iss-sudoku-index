// Title: Abyssus
// Author: Gerhard1963
// Video: https://www.youtube.com/watch?v=WgcEgXdBHBg
// Source: https://sudokupad.app/zi8pirt0ks

// Doublers: nine hidden cells, one per row/column/box, whose digits form a
// permutation of 1-9 ("using each of the digits 1-9 once each" -- the only
// non-redundant referent for that clause, since ordinary sudoku already
// forces every row/column/box to use 1-9 once). A doubler's VALUE is twice
// its digit; every other cell's VALUE equals its digit. Digit identity
// (sudoku all-different) is unaffected. A VD Var overlay flag (1 = normal,
// 2 = doubler) tracks placement; every rule below that reads "value" scans
// interleaved digit/flag pairs and uses digit * flag as the effective value.
//
// Cages, the Orbital Whispers lines, and the dots are all VALUE-based (not
// digit-based) per the rules text, so each needs a custom NFA rather than the
// native Cage/Whisper/BlackDot/WhiteDot classes, which read digits.
//
// Dots are non-exhaustive ("Not all dots are necessarily given"), so no
// negative constraint is added for undotted adjacent pairs.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

// Exactly one doubler per row/column/box: nine flags of {1,2} summing to 10
// forces eight 1s and one 2.
const placementSums = [
  ...graph.rows().map(row => new Sum(10, ...flags.at(row))),
  ...graph.columns().map(col => new Sum(10, ...flags.at(col))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),
];

// Each digit 1-9 is doubled at exactly one cell across the whole grid; nine
// doublers over nine digits with this per-digit constraint forces the nine
// doubler digits to be all different.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: (state) => state.phase === 'digit' && state.count === 1,
}, 9);

// Generic two-cell effective-value relation: scans [digitA, flagA, digitB,
// flagB] (via `interleave`) and accepts iff `relation(effA, effB)` holds,
// where eff = digit * flag. Used for the dots, the whisper-line neighbour
// gap, and the cage sums -- everything in this puzzle that reads "value"
// over exactly two cells.
const pairSpec = (relation) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, digitA: value };
      case 1: {
        if (value !== 1 && value !== 2) return undefined;
        return { phase: 2, effA: state.digitA * value };
      }
      case 2: return { phase: 3, effA: state.effA, digitB: value };
      case 3: {
        if (value !== 1 && value !== 2) return undefined;
        const effB = state.digitB * value;
        return relation(state.effA, effB) ? { phase: 'ok' } : undefined;
      }
      case 'ok': return { phase: 'ok' };
    }
  },
  accept: (state) => state.phase === 'ok',
}, 9);

const whisperGE8 = pairSpec((a, b) => Math.abs(a - b) >= 8);
const whiteDotConsecutive = pairSpec((a, b) => Math.abs(a - b) === 1);
const blackDotRatio = pairSpec((a, b) => a === 2 * b || b === 2 * a);
const cageEffectiveSum = target => pairSpec((a, b) => a + b === target);

const adjacentPairs = cells => cells.slice(0, -1).map((c, i) => [c, cells[i + 1]]);

// Cages, provenance: `cages` array (2 real 2-cell cages, both vertical
// dominoes within one column).
const cages = [
  { cells: ['R2C7', 'R3C7'], total: 10 },
  { cells: ['R7C3', 'R8C3'], total: 7 },
];

// Orbital Whispers lines, provenance: geometry helper's interpolated cell
// paths for the 6 lightsteelblue strokes (the puzzle's only line colour).
const whisperLines = [
  ['R1C8', 'R2C9'],
  ['R8C1', 'R9C2'],
  ['R4C2', 'R4C3', 'R3C4', 'R3C5'],
  ['R2C6', 'R3C6', 'R4C7', 'R5C7'],
  ['R6C8', 'R6C7', 'R7C6', 'R7C5'],
  ['R8C4', 'R7C4', 'R6C3', 'R5C3'],
];

// White dots, provenance: geometry helper's edge marks with white
// fill/black border (9 of the 10 overlays).
const whiteDots = [
  ['R2C2', 'R3C2'],
  ['R2C3', 'R2C4'],
  ['R1C4', 'R1C5'],
  ['R3C7', 'R3C8'],
  ['R4C8', 'R4C9'],
  ['R6C1', 'R6C2'],
  ['R9C5', 'R9C6'],
  ['R8C6', 'R8C7'],
  ['R7C8', 'R8C8'],
];

// Black dot, provenance: geometry helper's one edge mark with black
// fill/white glyph.
const blackDots = [
  ['R7C2', 'R7C3'],
];

return [
  new Shape('9x9'),

  flags.toVar('doubler flags'),
  flags.makeReplicate([new Given(flagOrigin, 1, 2)], flagTargets),
  ...placementSums,
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doubledDigitSpec(i + 1), `doubled-digit-${i + 1}`, ...interleave(gridCells))),

  // Cages: "In a cage, digits cannot repeat and their values sum to the
  // number shown. There is a doubler cell in every cage."
  ...cages.flatMap(({ cells, total }) => [
    new AllDifferent(...cells),
    new NFA(cageEffectiveSum(total), `cage-sum-${total}`, ...interleave(cells)),
    new Or([new Given(flag(cells[0]), 2), new Given(flag(cells[1]), 2)]),
  ]),

  // Orbital Whispers: "Neighbouring values ... must differ by at least 8" --
  // adjacent cells along the drawn path only, not every pair on the line.
  ...whisperLines.flatMap(cells =>
    adjacentPairs(cells).map(([a, b]) =>
      new NFA(whisperGE8, 'orbital-whisper-ge-8', ...interleave([a, b])))),

  ...whiteDots.map(([a, b]) =>
    new NFA(whiteDotConsecutive, 'white-dot-consecutive', ...interleave([a, b]))),
  ...blackDots.map(([a, b]) =>
    new NFA(blackDotRatio, 'black-dot-ratio', ...interleave([a, b]))),
];
