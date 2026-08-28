// Title: Merry Camel to You!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=-kFYm-Rdml0
// Source: https://tinyurl.com/3cnj2c7n
//
// 12x12 canvas, digit alphabet 1-6. The canvas is four independent 6x6
// sudokus (top-left/top-right/bottom-left/bottom-right quadrants), each with
// its own 6 rows, 6 columns and 6 irregular jigsaw regions, all-different
// 1-6. There is no digit relation between quadrants -- a full 12-cell row of
// the canvas is two unrelated 6-cell sudoku rows side by side (12 cells
// cannot be all-different over only 6 symbols). The two dashed "cages" in
// the payload (no total) are pure visual dividers for two of the four
// quadrants and add no constraint beyond the quadrant row/column/region
// rules already stated here.
//
// Every cell also carries one of four colors -- Red, White, Blue, Pink (no
// unshaded cells). Reading a full 12-cell row (or column) in one direction,
// it decomposes into maximal same-color runs. The row's left-margin clue
// (Red/White ink, or black for "both occur") lists, in left-to-right order,
// the digit-sum of every run colored Red or White; the right-margin clue
// does the same for Blue/Pink runs. Columns work the same way with
// top-margin (Red/White) and bottom-margin (Blue/Pink) clues, top-to-bottom.
// An unclued side means neither of its two colors appears anywhere in that
// line. A black clue additionally requires both colors of its pair to occur
// somewhere in the line (not just one, repeated) -- which run is which color
// is not separately marked and is left open to the solver.
// "A different color between runs of the same color" is not encoded
// separately: a maximal run cannot border another run of its own color by
// construction, so the clause is automatically true of any run partition.

const COLOR = { R: 1, W: 2, B: 3, P: 4 };

// Row clues, transcribed from the puzzle's left/right outside-clue cells.
// mode is the drawn clue-ink color: 'R'/'W'/'B'/'P' = that color only,
// 'RW'/'BP' = black ink (both colors of the pair occur somewhere in the
// line). nums is the clue's number list, read in printed order.
const ROW_LEFT = {
  1: { mode: 'R', nums: [11] },
  2: { mode: 'R', nums: [23] },
  3: { mode: 'RW', nums: [18, 1] },
  4: { mode: 'R', nums: [26] },
  5: { mode: 'W', nums: [1, 5] },
  6: { mode: 'W', nums: [4, 3] },
  7: { mode: 'RW', nums: [2, 1, 4] },
  8: { mode: 'W', nums: [34] },
  9: { mode: 'RW', nums: [8, 26, 3] },
  10: { mode: 'RW', nums: [14, 22, 6] },
  11: { mode: 'RW', nums: [15, 10, 17] },
  12: { mode: 'R', nums: [42] },
};
const ROW_RIGHT = {
  1: { mode: 'B', nums: [24, 7] },
  2: { mode: 'B', nums: [17, 2] },
  3: { mode: 'B', nums: [14, 6, 3] },
  4: { mode: 'B', nums: [9, 7] },
  5: { mode: 'BP', nums: [9, 21, 6] },
  6: { mode: 'BP', nums: [5, 5, 1, 17, 1, 2, 4] },
  7: { mode: 'BP', nums: [8, 11, 11, 5] },
  8: { mode: 'B', nums: [5, 3] },
  9: { mode: 'B', nums: [5] },
  10: null,
  11: null,
  12: null,
};
const COL_TOP = {
  1: { mode: 'R', nums: [9] },
  2: { mode: 'R', nums: [15] },
  3: { mode: 'RW', nums: [10, 16] },
  4: { mode: 'RW', nums: [3, 3, 12] },
  5: { mode: 'RW', nums: [9, 15, 5] },
  6: { mode: 'RW', nums: [11, 16, 1] },
  7: { mode: 'RW', nums: [9, 1, 18, 2] },
  8: { mode: 'RW', nums: [12, 15, 4] },
  9: { mode: 'RW', nums: [18, 11, 7] },
  10: { mode: 'RW', nums: [9, 3, 5, 10] },
  11: { mode: 'RW', nums: [4, 1, 18, 11] },
  12: { mode: 'R', nums: [13] },
};
const COL_BOTTOM = {
  1: { mode: 'B', nums: [33] },
  2: { mode: 'B', nums: [27] },
  3: { mode: 'B', nums: [16] },
  4: { mode: 'BP', nums: [7, 17] },
  5: { mode: 'BP', nums: [9, 2, 1, 1] },
  6: { mode: 'BP', nums: [1, 13] },
  7: { mode: 'BP', nums: [3, 9] },
  8: { mode: 'P', nums: [11] },
  9: { mode: 'BP', nums: [2, 1, 3] },
  10: { mode: 'BP', nums: [6, 9] },
  11: { mode: 'B', nums: [6, 2] },
  12: { mode: 'B', nums: [29] },
};

// Every row's/column's full clue list sums to 42 (=21+21, the fixed digit
// total of its two independent 6-cell sudoku halves) -- a check on the
// transcription above, not part of the encoding.
for (const [table1, table2] of [[ROW_LEFT, ROW_RIGHT], [COL_TOP, COL_BOTTOM]]) {
  for (let i = 1; i <= 12; i++) {
    const sum1 = table1[i] ? table1[i].nums.reduce((a, b) => a + b, 0) : 0;
    const sum2 = table2[i] ? table2[i].nums.reduce((a, b) => a + b, 0) : 0;
    if (sum1 + sum2 !== 42) {
      throw new Error(`line ${i} clue totals do not sum to 42: ${sum1}+${sum2}`);
    }
  }
}

const colorsOfMode = (mode) => {
  if (mode === null || mode === undefined) return [];
  return mode.split('').map(ch => COLOR[ch]);
};

// -- Quadrant digit sudokus -------------------------------------------------

const QUADRANTS = [
  { rowBase: 0, colBase: 0 }, // top-left
  { rowBase: 0, colBase: 6 }, // top-right
  { rowBase: 6, colBase: 0 }, // bottom-left
  { rowBase: 6, colBase: 6 }, // bottom-right
];

const quadrantLines = [];
for (const { rowBase, colBase } of QUADRANTS) {
  for (let i = 0; i < 6; i++) {
    quadrantLines.push(
      Array.from({ length: 6 }, (_, j) => makeCellId(rowBase + i + 1, colBase + j + 1)));
    quadrantLines.push(
      Array.from({ length: 6 }, (_, j) => makeCellId(rowBase + j + 1, colBase + i + 1)));
  }
}
const quadrantAllDifferent = quadrantLines.map(cells => new AllDifferent(...cells));

// Irregular jigsaw regions (6 cells each, 24 total), one per 6x6 quadrant.
// Recovered from the payload's per-cell region-index field: that field is
// written only on cells that deviate from an implicit default piece, so the
// unlabelled cells were assigned by connectivity to whichever labelled
// region needed them to reach size 6 (or, in the top-left quadrant, formed
// one extra all-default piece). Every quadrant below tiles its 36 cells into
// exactly six size-6 connected pieces.
// [row, col] pairs (1-indexed, printed numbering); converted to cell ids
// with makeCellId below rather than hand-written 'R#C#' strings, since
// columns/rows past 9 are not written as two decimal digits.
const REGION_COORDS = [
  // top-left
  [[1, 5], [1, 6], [2, 5], [2, 6], [3, 6], [4, 6]],
  [[5, 5], [5, 6], [6, 3], [6, 4], [6, 5], [6, 6]],
  [[3, 1], [4, 1], [5, 1], [5, 2], [6, 1], [6, 2]],
  [[2, 3], [2, 4], [3, 2], [3, 3], [3, 4], [4, 2]],
  [[3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4]],
  [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2]],
  // top-right
  [[1, 7], [1, 8], [1, 9], [1, 10], [2, 7], [2, 8]],
  [[1, 11], [1, 12], [2, 11], [2, 12], [3, 12], [4, 12]],
  [[2, 9], [2, 10], [3, 9], [3, 10], [3, 11], [4, 11]],
  [[3, 7], [4, 7], [5, 7], [5, 8], [6, 7], [6, 8]],
  [[3, 8], [4, 8], [4, 9], [4, 10], [5, 9], [5, 10]],
  [[5, 11], [5, 12], [6, 9], [6, 10], [6, 11], [6, 12]],
  // bottom-left
  [[7, 1], [7, 2], [7, 3], [7, 4], [8, 1], [8, 2]],
  [[7, 5], [7, 6], [8, 5], [8, 6], [9, 6], [10, 6]],
  [[8, 3], [8, 4], [9, 3], [9, 4], [9, 5], [10, 5]],
  [[9, 1], [10, 1], [11, 1], [11, 2], [12, 1], [12, 2]],
  [[9, 2], [10, 2], [10, 3], [10, 4], [11, 3], [11, 4]],
  [[11, 5], [11, 6], [12, 3], [12, 4], [12, 5], [12, 6]],
  // bottom-right
  [[7, 7], [7, 8], [7, 9], [7, 10], [8, 7], [8, 8]],
  [[7, 11], [7, 12], [8, 11], [8, 12], [9, 12], [10, 12]],
  [[8, 9], [8, 10], [9, 8], [9, 9], [9, 10], [10, 8]],
  [[9, 7], [10, 7], [11, 7], [11, 8], [12, 7], [12, 8]],
  [[9, 11], [10, 9], [10, 10], [10, 11], [11, 9], [11, 10]],
  [[11, 11], [11, 12], [12, 9], [12, 10], [12, 11], [12, 12]],
];
const REGIONS = REGION_COORDS.map(coords => coords.map(([r, c]) => makeCellId(r, c)));
const regionAllDifferent = REGIONS.map(cells => new AllDifferent(...cells));

// -- Color overlay ------------------------------------------------------

const shape = new Shape('12x12', '1-6', 'Raw');
const graph = cellGraph(shape);
const colorOverlay = graph.makeOverlay('VCL');
const colorVar = colorOverlay.toVar('color');

// Each cell's color is restricted to the colors its row allows (from its
// left/right margin clues) intersected with the colors its column allows
// (from its top/bottom margin clues); an unclued side excludes both of its
// colors entirely.
const rowAllowed = {};
const colAllowed = {};
for (let i = 1; i <= 12; i++) {
  rowAllowed[i] = new Set([...colorsOfMode(ROW_LEFT[i] && ROW_LEFT[i].mode),
    ...colorsOfMode(ROW_RIGHT[i] && ROW_RIGHT[i].mode)]);
  colAllowed[i] = new Set([...colorsOfMode(COL_TOP[i] && COL_TOP[i].mode),
    ...colorsOfMode(COL_BOTTOM[i] && COL_BOTTOM[i].mode)]);
}
const colorGivens = [];
for (let r = 1; r <= 12; r++) {
  for (let c = 1; c <= 12; c++) {
    const allowed = [...rowAllowed[r]].filter(v => colAllowed[c].has(v));
    if (allowed.length === 0) {
      throw new Error(`no color allowed at R${r}C${c}`);
    }
    colorGivens.push(new Given(colorVar.cell(r, c), ...allowed));
  }
}

// -- Run-sum NFAs ---------------------------------------------------------
//
// One NFA per clued side of a line. It scans the line's 12 cells as
// [color, digit, color, digit, ...] (24 tokens): a `color` phase records the
// cell's color, then the paired `digit` phase decides whether that cell
// continues the open run (same color as the run), closes it and opens a new
// one (different color, but still one of this clue's pair -- e.g. Red then
// White), or -- if the color is not one of this clue's pair at all -- closes
// any open run and contributes nothing (a "gap" cell belonging to the other
// pair). Closing a run checks its accumulated digit sum against the next
// number in the clue list. `accept` closes any still-open run at line end
// and requires every clue number to have been consumed exactly, plus (when
// `requireBoth`) at least one run of each pair member to have occurred.
function runSumSpec(target, memberA, memberB, requireBoth) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'color', idx: 0, runColor: null, sum: 0, seenA: false, seenB: false },
    transition: (s, value) => {
      if (s.phase === 'color') {
        return { ...s, phase: 'digit', pendingColor: value };
      }
      const color = s.pendingColor;
      let { idx, runColor, sum, seenA, seenB } = s;
      const inPair = (color === memberA || color === memberB);
      if (!inPair) {
        if (runColor !== null) {
          if (idx >= target.length || sum !== target[idx]) return undefined;
          idx += 1;
        }
        return { phase: 'color', idx, runColor: null, sum: 0, seenA, seenB };
      }
      if (color === memberA) seenA = true;
      if (color === memberB) seenB = true;
      if (runColor === color) {
        sum += value;
      } else {
        if (runColor !== null) {
          if (idx >= target.length || sum !== target[idx]) return undefined;
          idx += 1;
        }
        runColor = color;
        sum = value;
      }
      // Early reject: a run's sum may never exceed the clue number it must
      // eventually match -- keeps the compiled state count bounded.
      if (idx >= target.length || sum > target[idx]) return undefined;
      return { phase: 'color', idx, runColor, sum, seenA, seenB };
    },
    accept: (s) => {
      let { idx, runColor, sum, seenA, seenB } = s;
      if (runColor !== null) {
        if (idx >= target.length || sum !== target[idx]) return false;
        idx += 1;
      }
      if (idx !== target.length) return false;
      if (requireBoth && !(seenA && seenB)) return false;
      return true;
    },
  }, 6);
  return spec;
}

const runSumNFAs = [];
for (let r = 1; r <= 12; r++) {
  const cells = Array.from({ length: 12 },
    (_, j) => makeCellId(r, j + 1));
  const scan = cells.flatMap(cell => [colorOverlay.at(cell), cell]);
  const left = ROW_LEFT[r];
  if (left) {
    const spec = runSumSpec(left.nums, COLOR.R, COLOR.W, left.mode === 'RW');
    runSumNFAs.push(new NFA(spec, `row${r}-RW`, scan));
  }
  const right = ROW_RIGHT[r];
  if (right) {
    const spec = runSumSpec(right.nums, COLOR.B, COLOR.P, right.mode === 'BP');
    runSumNFAs.push(new NFA(spec, `row${r}-BP`, scan));
  }
}
for (let c = 1; c <= 12; c++) {
  const cells = Array.from({ length: 12 },
    (_, i) => makeCellId(i + 1, c));
  const scan = cells.flatMap(cell => [colorOverlay.at(cell), cell]);
  const top = COL_TOP[c];
  if (top) {
    const spec = runSumSpec(top.nums, COLOR.R, COLOR.W, top.mode === 'RW');
    runSumNFAs.push(new NFA(spec, `col${c}-RW`, scan));
  }
  const bottom = COL_BOTTOM[c];
  if (bottom) {
    const spec = runSumSpec(bottom.nums, COLOR.B, COLOR.P, bottom.mode === 'BP');
    runSumNFAs.push(new NFA(spec, `col${c}-BP`, scan));
  }
}

return [
  shape,
  colorVar,
  ...quadrantAllDifferent,
  ...regionAllDifferent,
  ...colorGivens,
  ...runSumNFAs,
];
