// Title: Ninety One
// Author: NotThatItMatters
// Video: https://www.youtube.com/watch?v=HiDyddNPHwM
// Source: https://app.crackingthecryptic.com/sudoku/pHm4JTbr9d

// Normal 9x9 Sudoku with four givens, plus:
//  - Every five-cell cage, read left to right or top to bottom as A-B-C-D-E,
//    has the Horner value (A * B + C) * D + E = 91.
//  - "Each cage contains a unique set of digits": the eight cages hold eight
//    different digit sets. Each cage is a five-cell run inside one row or one
//    column, so Sudoku already forbids a repeat within a cage; read instead as
//    "digits do not repeat in a cage" the sentence would state nothing.
//  - The six shaded cells in the top right, and the six in the bottom left,
//    are each a pair of overlapping 1-9-3-2 snakes stepping orthogonally or
//    diagonally.
// No rule is omitted.

// Cell lists transcribe the eight drawn cages in their reading order: the four
// horizontal cages left to right, the four vertical cages top to bottom.
const cages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
];

// Horner scan of A-B-C-D-E. `stage` is how many digits have been read, `val`
// the partial result after them: A, then A*B, A*B+C, (A*B+C)*D, and finally
// +E. Every remaining step multiplies by at least 1 and then adds at least 1,
// so a partial past the 91 target can never return to it: drop the branch.
const horner91 = NFA.encodeSpec({
  startState: { stage: 0, val: 0 },
  transition: ({ stage, val }, value) => {
    if (stage === 5) return undefined;  // a cage is exactly five cells
    const next =
      stage === 0 ? value :
        stage === 1 ? val * value :
          stage === 2 ? val + value :
            stage === 3 ? val * value :
              val + value;
    if (next > 91) return undefined;
    return { stage: stage + 1, val: next };
  },
  accept: ({ stage, val }) => stage === 5 && val === 91,
}, 9);

// Two cages hold different digit sets exactly when some digit appears in the
// second and not in the first, both holding five distinct digits. One cage per
// segment; the machine guesses that witness digit `d` up front, kills the
// branch if `d` turns up in the first cage, and accepts only if `d` turned up
// in the second.
const differentCageSets = NFA.encodeSpec({
  startState: Array.from(
    { length: 9 }, (_, i) => ({ d: i + 1, second: false, found: false })),
  transition: ({ d, second, found }, value) => {
    if (value === SEGMENT_BREAK) {
      return second ? undefined : { d, second: true, found };
    }
    if (!second) return value === d ? undefined : { d, second, found };
    return { d, second, found: found || value === d };
  },
  accept: ({ second, found }) => second && found,
}, 9, { multiSegment: true });

// The blue/grey underlays shade six cells in the top right and six in the
// bottom left. They mark cells only: no traversal, endpoint or pairing is
// drawn, and the grey layer sits under the blue one on the same cells rather
// than splitting them into two snakes.
const shadedGroups = [
  ['R1C7', 'R1C8', 'R2C7', 'R3C5', 'R3C6', 'R3C8'],
  ['R6C3', 'R6C4', 'R7C2', 'R8C2', 'R8C3', 'R9C1'],
];

const SNAKE_DIGITS = [1, 9, 3, 2];

const isKingStep = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.max(Math.abs(p.row - q.row), Math.abs(p.col - q.col)) === 1;
};

// Every ordered four-cell walk within `cells` whose consecutive cells touch
// orthogonally or diagonally. Both directions of a walk appear.
const snakePaths = (cells) => {
  const out = [];
  const walk = (path) => {
    if (path.length === SNAKE_DIGITS.length) {
      out.push(path);
      return;
    }
    for (const cell of cells) {
      if (path.includes(cell)) continue;
      if (path.length && !isKingStep(path[path.length - 1], cell)) continue;
      walk([...path, cell]);
    }
  };
  walk([]);
  return out;
};

// With the traversals undrawn, the rule is the disjunction over every pair of
// walks that covers the shaded set: 4 + 4 cells over 6 shaded cells, which by
// itself makes the two walks overlap in exactly two cells, as "overlapping"
// requires. Labelling a walk 1-9-3-2 fixes one digit per cell, and distinct
// pairs can force the same digits, so branches are deduplicated on the
// assignment. Six cells yield four surviving assignments in the top right and
// two in the bottom left.
const snakePairBranches = (cells) => {
  const paths = snakePaths(cells);
  const branches = new Map();
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const digits = new Map();
      let consistent = true;
      for (const path of [paths[i], paths[j]]) {
        path.forEach((cell, k) => {
          if (digits.has(cell) && digits.get(cell) !== SNAKE_DIGITS[k]) {
            consistent = false;
          }
          digits.set(cell, SNAKE_DIGITS[k]);
        });
      }
      if (!consistent || digits.size !== cells.length) continue;
      branches.set(cells.map(cell => digits.get(cell)).join(''), digits);
    }
  }
  return new Or([...branches.values()].map(
    digits => new And(cells.map(cell => new Given(cell, digits.get(cell))))));
};

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  new Given('R4C5', 9),
  new Given('R5C9', 1),
  new Given('R8C4', 3),
  ...cages.map(cells => new NFA(horner91, 'Horner 91', cells)),
  ...cages.flatMap((a, i) => cages.slice(i + 1).map(
    b => new NFA(differentCageSets, 'different cage sets', a, b))),
  ...shadedGroups.map(snakePairBranches),
];
