// Title: The Third Law Of Thermodynamics
// Author: gdc
// Video: https://www.youtube.com/watch?v=4sSpZ2U84aU
// Source: https://sudokupad.app/29hyhl8ay5

// Normal sudoku rules apply (default row/column/box all-different; the
// drawn regions are the standard 3x3 boxes).
//
// Dynamic fog ("Dynamics") only controls what is visible while solving; it
// is not a rule about the finished grid and is not encoded.
//
// Entropy: every 2x2 area contains a low (1-3), a middle (4-6), and a high
// (7-9) digit. GlobalEntropy is exactly this 9x9 rule.
//
// Thermo: digits increase from the bulb along a grey thermo of exactly 4
// cells, orthogonal only, no branching, no overlap between thermos. The art
// draws six bulbs, each with one confirmed next cell (a drawn neck stub plus
// a fade-textured mark in that cell). Two of those six thermos also have one
// further cell drawn as an isolated pip, with no drawn connection to the
// bulb: R3C4 and R7C4. Neither pip is orthogonally adjacent to any bulb, so
// each is reached by continuing on from that thermo's confirmed next cell.
// Distance from every *other* thermo's confirmed next cell is too large to
// fit inside a 4-cell thermo, which pins each pip to exactly one thermo:
//   - R3C4 is 2 orthogonal steps from R3C2 (nearest other candidate, R2C7,
//     is 4 steps away) -- this forces the connecting cell R3C3, giving the
//     full R4C2 thermo: R4C2 < R3C2 < R3C3 < R3C4.
//   - R7C4 is 1 orthogonal step from R7C3 (nearest other candidate, R6C8, is
//     5 steps away) -- so R7C4 is the R7C2 thermo's 3rd cell, with an
//     undrawn 4th cell.
// None of the other four thermos (bulbs R4C5, R4C1, R3C7, R6C9) has a
// further drawn cell.
//
// For every thermo cell that isn't drawn, every orthogonal continuation is
// generated below (no revisiting a cell already on the same thermo, and no
// landing on a cell already confirmed to belong to a *different* thermo) and
// offered as a disjunction; Thermo's own increasing-value rule -- not this
// code -- picks the true completion. This is a sound but relaxed reading:
// generated candidates from two different thermos can occasionally name the
// same cell (checked below: R4C5/R7C2 share {R6C4, R7C5}; R4C5/R6C9 share
// {R6C6, R5C7}), so "don't overlap" is not enforced between the undrawn
// portions of different thermos -- an explicit omission, not an invented
// relaxation, since the source art doesn't resolve those cells at all.
const KNOWN_THERMO_PREFIXES = [
  ['R4C2', 'R3C2', 'R3C3', 'R3C4'], // fully drawn/forced
  ['R7C2', 'R7C3', 'R7C4'],         // bulb, next cell, and forced 3rd cell
  ['R4C5', 'R5C5'],
  ['R4C1', 'R3C1'],
  ['R3C7', 'R2C7'],
  ['R6C9', 'R6C8'],
];
const THERMO_LENGTH = 4;

const graph = cellGraph('9x9');

// All ways to extend `prefix` by orthogonal steps to exactly `length` cells,
// never revisiting a cell already in `prefix` and never stepping onto a cell
// in `forbidden` (cells already confirmed to belong to another thermo).
const extendPath = (prefix, length, forbidden) => {
  if (prefix.length === length) return [prefix];
  const results = [];
  for (const next of graph.neighbours(prefix[prefix.length - 1])) {
    if (prefix.includes(next) || forbidden.has(next)) continue;
    results.push(...extendPath([...prefix, next], length, forbidden));
  }
  return results;
};

const thermoConstraints = KNOWN_THERMO_PREFIXES.map((prefix, i) => {
  const otherKnownCells = new Set(KNOWN_THERMO_PREFIXES.flatMap(
    (p, j) => (j === i ? [] : p)));
  const completions = extendPath(prefix, THERMO_LENGTH, otherKnownCells);
  return completions.length === 1
    ? new Thermo(...completions[0])
    : new Or(completions.map(cells => new Thermo(...cells)));
});

return [
  new Shape('9x9'),

  new Given('R3C9', 5),

  new GlobalEntropy(),

  ...thermoConstraints,
];
