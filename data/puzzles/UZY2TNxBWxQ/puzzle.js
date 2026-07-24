// Title: Nala's Toy Battle
// Author: Panthera
// Video: https://www.youtube.com/watch?v=UZY2TNxBWxQ
// Source: https://sudokupad.app/9ecadg11io

// Normal sudoku. Grid is entirely under fog (no givens shown), which is
// solving UI only and is not encoded.
//
// Odd: R7C6 must be odd.
//
// V: two marked pairs sum to 5 (not all V's are marked, so only the marked
// pairs are enforced; no negative constraint is added elsewhere).
//
// Ratio dots: four colours (yellow/green/blue/red) each mark an unknown
// fixed ratio from 1:2 .. 1:9, shared by every dot of that colour, chosen by
// the solver. Encoded as one Or (over the 8 candidate ratios) per colour,
// applied to every dot of that colour at once so the same ratio governs all
// of them.
//
// Pink lines: each line is independently either a Renban line or a German
// Whisper line, encoded as an Or per line.
//
// Japanese Sums colouring: within R3-9,C3-9, some cells are shaded, forming
// (per clued row/column) one or more maximal shaded runs. A pink clue cell
// with a written cage total pins its run's digit-sum; a pink clue cell with
// no total only asserts that a run exists there, of unspecified length and
// sum. A row/column with no pink clue cell at all has no shading. A cage
// total is a compound number: the cage's own small corner digit (its
// displayed value) times 10, plus the digit the solver places in that very
// clue cell (the "little 1 and a 4 placed in it makes the clue 14" rule) --
// i.e. the total is read off the clue cell itself, not a separate written
// number. This is modelled with a shading Var overlay ('VS') over the 49
// cells, restricted to SHADED/UNSHADED, and one scanning NFA per clued
// row/column, run against every reachable assignment of its clue cell(s)'
// own digits, tracking run boundaries and the running sum of shaded digits.

const graph = cellGraph('9x9');

const SHADED = 1;
const UNSHADED = 2;

// ---- Ratio dots ----

const ratioDotsByColor = {
  yellow: [['R1C9', 'R2C9']],
  green: [['R5C2', 'R4C2'], ['R2C6', 'R2C7']],
  blue: [
    ['R4C2', 'R3C2'], ['R3C3', 'R3C2'], ['R2C3', 'R3C3'], ['R1C3', 'R2C3'],
    ['R1C2', 'R1C1'], ['R5C2', 'R5C1'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
    ['R3C9', 'R3C8'], ['R6C5', 'R6C6'], ['R6C6', 'R6C7'],
  ],
  red: [['R3C3', 'R3C4'], ['R2C5', 'R2C4'], ['R3C5', 'R2C5'], ['R2C8', 'R2C7']],
};

function ratioGroupConstraint(pairs) {
  const options = [];
  for (let r = 2; r <= 9; r++) {
    // Ratio 1:2 is exactly the native BlackDot relation.
    options.push(r === 2
      ? new And(pairs.map(([a, b]) => new BlackDot(a, b)))
      : new And(pairs.map(([a, b]) => new Pair(
        Pair.fnToKey((x, y) => x === y * r || y === x * r, 9), `ratio-1-${r}`, a, b))));
  }
  return new Or(options);
}

const ratioConstraints = Object.values(ratioDotsByColor)
  .map(pairs => ratioGroupConstraint(pairs));

// ---- Pink lines: Renban or German Whisper, each independently ----

const pinkLines = [
  ['R7C4', 'R7C5', 'R6C4'],
  ['R6C8', 'R7C7', 'R7C8'],
  ['R6C3', 'R6C2', 'R6C1'],
];

const lineConstraints = pinkLines.map(cells => new Or([
  new Renban(...cells),
  new Whisper(5, ...cells),
]));

// ---- V pairs (sum to 5); not all V's are marked ----

const vPairs = [['R2C4', 'R1C4'], ['R1C5', 'R2C5']];
const vConstraints = vPairs.map(([a, b]) => new V(a, b));

// ---- Japanese Sums colouring ----

const subCells = graph.block('R3C3', 7, 7);
const shade = graph.makeOverlay('VS', subCells);

const rowRunCells = r => graph.row(r).slice(2, 9); // C3..C9
const colRunCells = c => graph.column(c).slice(2, 9); // R3..R9

// NFA for a clued row/column with one or two known-sum runs, given fixed
// (compile-time literal) numeric targets -- not read from the grid, so the
// state carries only a bounded running sum, never the targets themselves.
// Scans the line's cells as interleaved (shade, digit) pairs, tracking run
// boundaries and each run's sum.
const knownRunNFACache = new Map();
function knownRunNFA(targets) {
  const cacheKey = targets.join(',');
  if (knownRunNFACache.has(cacheKey)) return knownRunNFACache.get(cacheKey);
  const numTargets = targets.length;
  const spec = NFA.encodeSpec({
    startState: { stage: 'S', runIndex: 0, inRun: false, sum: 0 },
    transition: (state, value) => {
      if (state.stage === 'S') {
        const shaded = value === SHADED;
        let { runIndex, inRun, sum } = state;
        if (shaded && !inRun) {
          runIndex += 1;
          if (runIndex > numTargets) return undefined; // too many runs
          inRun = true;
        } else if (!shaded && inRun) {
          // Run closes here: its accumulated sum must match its target.
          if (sum !== targets[runIndex - 1]) return undefined;
          inRun = false;
          sum = 0;
        }
        return { stage: 'D', runIndex, inRun, sum, shaded };
      }
      // stage === 'D': add this cell's digit to the running sum if shaded.
      const { runIndex, inRun, sum, shaded } = state;
      let newSum = sum;
      if (shaded) {
        const target = targets[runIndex - 1];
        newSum = Math.min(sum + value, target + 1); // clamp at the sink
      }
      return { stage: 'S', runIndex, inRun, sum: newSum };
    },
    accept: (state) => {
      if (state.stage !== 'S' || state.runIndex !== numTargets) return false;
      // A run still open at the line's end closes at the boundary.
      if (state.inRun) return state.sum === targets[state.runIndex - 1];
      return true;
    },
  }, 9);
  knownRunNFACache.set(cacheKey, spec);
  return spec;
}

// A clue cell's total is corner*10 + the digit the solver places in that
// cell. The corner is a compile-time literal; the digit is not, so branch
// over its 9 possibilities (an Or of fixed-target NFAs) rather than reading
// it as NFA state -- that keeps every individual NFA's state small instead
// of multiplying it by every reachable combination of clue-cell digits.
function targetBranches(targetSources) {
  if (targetSources.length === 0) return [[]];
  const [{ cell, corner }, ...rest] = targetSources;
  const branches = [];
  for (let d = 1; d <= 9; d++) {
    for (const tail of targetBranches(rest)) {
      branches.push([{ cell, value: d, target: corner * 10 + d }, ...tail]);
    }
  }
  return branches;
}

// NFA for a clued row/column with `count` pink positions that carry no
// written total (a drawn cage with no value, or plain pink with no cage at
// all): exactly `count` maximal shaded runs of unspecified length and sum.
const unknownRunNFACache = new Map();
function unknownRunNFA(count) {
  if (unknownRunNFACache.has(count)) return unknownRunNFACache.get(count);
  const spec = NFA.encodeSpec({
    startState: { runCount: 0, inRun: false },
    transition: (state, value) => {
      const shaded = value === SHADED;
      let { runCount, inRun } = state;
      if (shaded && !inRun) {
        runCount += 1;
        if (runCount > count) return undefined; // too many runs
        inRun = true;
      } else if (!shaded && inRun) {
        inRun = false;
      }
      return { runCount, inRun };
    },
    accept: (state) => state.runCount === count,
  }, 9);
  unknownRunNFACache.set(count, spec);
  return spec;
}

function knownRunConstraint(cells, targetSources) {
  const runSeq = cells.flatMap(cell => [shade.at(cell), cell]);
  const branches = targetBranches(targetSources).map(assignment => new And([
    ...assignment.map(({ cell, value }) => new Given(cell, value)),
    new NFA(knownRunNFA(assignment.map(a => a.target)), 'jss-run', ...runSeq),
  ]));
  return new Or(branches);
}

function unknownRunConstraint(cells, count) {
  return new NFA(unknownRunNFA(count), 'jss-run-unknown',
    ...shade.at(cells));
}

// Every row 3-9 is pink in C1, so every row has at least one run; rows 3-5
// are also pink in C2, giving those a second run. C1/C2 have a written cage
// total only for rows 3, 4 (both slots) and 8 (C1 only) -- the rest (row 5's
// two slots, and row 6/7/9's C1 slot) are pink with no total.
const rowRunConstraints = [
  knownRunConstraint(rowRunCells(3),
    [{ cell: 'R3C1', corner: 1 }, { cell: 'R3C2', corner: 1 }]),
  knownRunConstraint(rowRunCells(4),
    [{ cell: 'R4C1', corner: 1 }, { cell: 'R4C2', corner: 1 }]),
  unknownRunConstraint(rowRunCells(5), 2),
  unknownRunConstraint(rowRunCells(6), 1),
  unknownRunConstraint(rowRunCells(7), 1),
  knownRunConstraint(rowRunCells(8), [{ cell: 'R8C1', corner: 1 }]),
  unknownRunConstraint(rowRunCells(9), 1),
];

// Only C4-C8 are pink in R1/R2 (all with a written total); C3 and C9 have no
// pink cell at all, so per the rules they carry no shading.
const colRunConstraints = [
  knownRunConstraint(colRunCells(4), [{ cell: 'R1C4', corner: 1 }]),
  knownRunConstraint(colRunCells(5), [{ cell: 'R1C5', corner: 3 }]),
  knownRunConstraint(colRunCells(6), [{ cell: 'R1C6', corner: 1 }]),
  knownRunConstraint(colRunCells(7), [{ cell: 'R1C7', corner: 2 }]),
  knownRunConstraint(colRunCells(8), [{ cell: 'R1C8', corner: 1 }]),
];
const uncluedCols = [3, 9];

const forcedUnshaded = new Set();
for (const c of uncluedCols) for (const cell of colRunCells(c)) forcedUnshaded.add(cell);

const shadeDomainGivens = subCells.map(cell => forcedUnshaded.has(cell)
  ? new Given(shade.at(cell), UNSHADED)
  : new Given(shade.at(cell), SHADED, UNSHADED));

return [
  new Shape('9x9'),
  new Given('R7C6', 1, 3, 5, 7, 9),
  ...vConstraints,
  ...ratioConstraints,
  ...lineConstraints,
  shade.toVar('JSS shading'),
  ...shadeDomainGivens,
  ...rowRunConstraints,
  ...colRunConstraints,
];
