// Title: Nala's Toy Battle
// Author: Panthera
// Video: https://www.youtube.com/watch?v=UZY2TNxBWxQ
// Source: https://sudokupad.app/9ecadg11io

// Rules encoded below:
//  1. Normal sudoku.
//  2. Japanese sums inside the red region R3C3-R9C9. Cells there are shaded or
//     not; the pink clue cells in columns 1-2 give their row's shaded-run sums
//     in order from the outside in, the pink clue cells in row 1 do the same
//     for their column, the number of pink clue cells equals the number of
//     runs, and consecutive runs are separated by at least one unshaded cell.
//  3. A line with no pink clue cell has no shading; columns 3 and 9 are the
//     only unclued lines of the region.
//  4. A clue's value is (small corner digit of the cage drawn on the clue
//     cell) * 10 + (digit placed in the clue cell). A pink clue cell with no
//     cage marks a run whose sum is unknown.
//  5. Cells joined by a V sum to 5 (2 drawn).
//  6. Each of the four dot colours stands for one ratio out of 1:2 .. 1:9, the
//     same ratio for all dots of that colour.
//  7. Each pink line is independently a renban or a German whisper (>= 5).
//  8. A circled cell is odd.
// Omitted: the rules say "not all V's are given", and the unmarked V pairs are
// not drawn anywhere, so only the two drawn V's are asserted and no negative
// V constraint is added.
// Not encoded because they are not final-grid rules: the fog of war, and the
// red region outline itself (a region marker with no total, not a killer cage).

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Japanese sums shading overlay: one Var per cell of the red region, holding
// UNSHADED or SHADED. The row and column scans below both read this overlay,
// which is what keeps a row's runs and a column's runs on the same shading.
const UNSHADED = 1;
const SHADED = 2;
const regionCells = graph.block('R3C3', 7, 7);
const regionSet = new Set(regionCells);
const shade = graph.makeOverlay('VS', regionCells);

// Clue tables, transcribed from the pink cell colouring and the single-cell
// cages drawn on those cells. The number is the cage's small corner digit;
// `null` means no cage is drawn there, so that run's sum is unknown. The two
// cages drawn without a corner digit (R6C1, R7C1) are corner digit 0 by rule 4:
// no tens contribution, so the run sums to the clue cell's own digit.
const NO_CAGE = null;
const ROW_CLUES = [
  [3, [['R3C1', 1], ['R3C2', 1]]],
  [4, [['R4C1', 1], ['R4C2', 1]]],
  [5, [['R5C1', NO_CAGE], ['R5C2', NO_CAGE]]],
  [6, [['R6C1', 0]]],
  [7, [['R7C1', 0]]],
  [8, [['R8C1', 1]]],
  [9, [['R9C1', NO_CAGE]]],
];
const COL_CLUES = [
  [4, [['R1C4', 1]]],
  [5, [['R1C5', 3]]],
  [6, [['R1C6', 1]]],
  [7, [['R1C7', 2]]],
  [8, [['R1C8', 1]]],
];
const UNCLUED_COLUMNS = [3, 9];

// One state machine per clued line. It reads the line's cageed clue cells
// first, turning each into a target sum, and then walks the line as
// [shade flag, digit, shade flag, digit, ...].
//
// State fields:
//   phase     'clue' while the clue cells are still being read, else 'scan'.
//   runIndex  which run's clue cell is being read (clue phase only).
//   targets   the run sums still to be matched, in order; an entry is null for
//             a run whose clue cell carries no cage (sum unknown).
//   awaitFlag true when the next cell read is a shade flag, false when it is
//             the digit belonging to the flag just read.
//   shaded    what that flag said, so the digit knows whether it counts.
//   inRun     whether the previous cell was shaded, i.e. a run is open.
//   rem       the open run's target minus the digits taken so far, or null
//             when the open run has no known target. Counting down rather than
//             up keeps the field bounded by the target.
const clueState = (runIndex, targets) => ({ phase: 'clue', runIndex, targets });
const scanState = (awaitFlag, shaded, inRun, rem, targets) =>
  ({ phase: 'scan', awaitFlag, shaded, inRun, rem, targets });

function japaneseSumsSpec(tensDigits) {
  // Runs with no cage read no clue cell, so skip past them when deciding which
  // clue cell the next symbol belongs to.
  const skipUnclued = (runIndex, targets) => {
    while (runIndex < tensDigits.length && tensDigits[runIndex] === NO_CAGE) {
      targets = targets.concat([null]);
      runIndex++;
    }
    return runIndex === tensDigits.length
      ? scanState(true, false, false, null, targets)
      : clueState(runIndex, targets);
  };

  return NFA.encodeSpec({
    startState: skipUnclued(0, []),
    transition: (state, value) => {
      if (state.phase === 'clue') {
        const target = tensDigits[state.runIndex] * 10 + value;
        return skipUnclued(
          state.runIndex + 1, state.targets.concat([target]));
      }
      if (state.awaitFlag) {
        if (value !== UNSHADED && value !== SHADED) return undefined;
        if (value === SHADED) {
          if (state.inRun) {
            return scanState(false, true, true, state.rem, state.targets);
          }
          // A new run opens: it must be the next unmatched clue.
          if (state.targets.length === 0) return undefined;
          return scanState(
            false, true, true, state.targets[0], state.targets.slice(1));
        }
        // An unshaded cell closes any open run, which must be exactly on target.
        if (state.inRun && state.rem !== null && state.rem !== 0) return undefined;
        return scanState(false, false, false, null, state.targets);
      }
      if (!state.shaded) return scanState(true, false, false, null, state.targets);
      if (state.rem === null) return scanState(true, false, true, null, state.targets);
      if (value > state.rem) return undefined;
      return scanState(true, false, true, state.rem - value, state.targets);
    },
    // Every clue must have been used, and a run still open at the line's end
    // must also be exactly on target.
    accept: (state) => state.phase === 'scan' && state.awaitFlag
      && state.targets.length === 0
      && (!state.inRun || state.rem === null || state.rem === 0),
  }, shape);
}

function japaneseSumsLine(name, clues, lineCells) {
  const spec = japaneseSumsSpec(clues.map(([, tens]) => tens));
  const clueCells = clues.filter(([, tens]) => tens !== NO_CAGE).map(([cell]) => cell);
  const scanCells = lineCells.flatMap(cell => [shade.at(cell), cell]);
  return new NFA(spec, name, ...clueCells, ...scanCells);
}

// Ratio dots, transcribed from the coloured edge circles.
const DOTS_BY_COLOUR = [
  ['yellow', [['R1C9', 'R2C9']]],
  ['green', [['R5C2', 'R4C2'], ['R2C6', 'R2C7']]],
  ['blue', [
    ['R4C2', 'R3C2'], ['R3C3', 'R3C2'], ['R2C3', 'R3C3'], ['R1C3', 'R2C3'],
    ['R1C2', 'R1C1'], ['R5C2', 'R5C1'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
    ['R3C9', 'R3C8'], ['R6C5', 'R6C6'], ['R6C6', 'R6C7']]],
  ['red', [
    ['R3C3', 'R3C4'], ['R2C5', 'R2C4'], ['R3C5', 'R2C5'], ['R2C8', 'R2C7']]],
];
const RATIOS = [2, 3, 4, 5, 6, 7, 8, 9];
// "1:n" means one cell is n times the other, in either direction.
const ratioKey = (ratio) =>
  Pair.fnToKey((a, b) => a === ratio * b || b === ratio * a, shape);

// Pink lines, as the strokes are drawn: two of them take a diagonal step, so
// the cell order here is the order along the stroke rather than an L bend.
const PINK_LINES = [
  ['R7C4', 'R7C5', 'R6C4'],
  ['R6C8', 'R7C7', 'R7C8'],
  ['R6C3', 'R6C2', 'R6C1'],
];

return [
  shape,

  // 8. Circled cell is odd.
  new Given('R7C6', 1, 3, 5, 7, 9),

  // 5. The two drawn V's.
  new V('R1C4', 'R2C4'),
  new V('R1C5', 'R2C5'),

  // 6. One ratio per colour, shared by every dot of that colour.
  ...DOTS_BY_COLOUR.map(([colour, dots]) => new Or(
    RATIOS.map(ratio => new And(dots.map(
      ([a, b]) => new Pair(ratioKey(ratio), `${colour} 1:${ratio}`, a, b)))))),

  // 7. Each pink line is a renban or a whisper, decided independently.
  ...PINK_LINES.map(cells => new Or([
    new Renban(...cells),
    new Whisper(5, ...cells),
  ])),

  // 2. The shading overlay and its domain.
  shade.toVar('japanese sums shading'),
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),

  // 3. Unclued lines of the region carry no shading.
  ...UNCLUED_COLUMNS.flatMap(col => graph.column(col)
    .filter(cell => regionSet.has(cell))
    .map(cell => new Given(shade.at(cell), UNSHADED))),

  // 2/4. The run scans.
  ...ROW_CLUES.map(([row, clues]) => japaneseSumsLine(
    `JSS row ${row}`, clues,
    graph.row(row).filter(cell => regionSet.has(cell)))),
  ...COL_CLUES.map(([col, clues]) => japaneseSumsLine(
    `JSS column ${col}`, clues,
    graph.column(col).filter(cell => regionSet.has(cell)))),
];
