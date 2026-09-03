// Title: Cobra's Curse
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=Jv_jTv8V2Zc
// Source: https://sudokupad.app/748nmm3bpM

// Rules encoded here, in full:
//  - Normal sudoku.
//  - Blue lines are region sum lines: 3x3 box borders divide each into segments
//    with the same sum.
//  - Brown lines are product sum lines: the digits on the two ends of the line
//    multiply together to give the sum of ALL digits on the line.
//  - A 1-cell-wide snake moves orthogonally and does not touch itself, not even
//    diagonally. It enters every 3x3 box exactly once. It may not use any cell
//    that lies on a drawn line, but may use a circled cell.
//  - The snake is itself both a region sum line and a product sum line.
//  - A digit in a circle says how many times that digit appears on the snake.
// Nothing is omitted.

// Snake membership code carried by the VS overlay, one Var cell per grid cell.
// Splitting "on the snake" into END and MID lets the degree rule and the snake's
// product-sum rule (which needs the two end digits) read the same layer.
const OFF = 1;   // not on the snake
const END = 2;   // on the snake, one of its two ends
const MID = 3;   // on the snake, between two snake cells

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const snake = graph.makeOverlay('VS');
// The common segment sum of the snake's nine box segments, as a single Var cell.
// It fits a digit cell: the snake crosses nine boxes, so its total is 9 * VT, and
// the product sum rule makes that total a product of two digits, hence at most 81.
const segmentSum = graph.makeOverlay('VT', [gridCells[0]]);
const segmentSumCell = segmentSum.cells()[0];

// Drawn geometry, transcribed from the puzzle's line and circle art.
// Cells are listed in the order the stroke visits them, so the first and last
// entry of a brown line are its two ends.
const blueLines = [
  ['R1C7', 'R1C6', 'R1C5', 'R2C5'],
  ['R2C9', 'R3C9', 'R4C9', 'R4C8'],
];
const brownLines = [
  ['R2C3', 'R3C3', 'R4C3', 'R4C4'],
  ['R7C5', 'R7C6', 'R7C7', 'R6C7'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
];
const circles = ['R4C6', 'R1C9'];

const lineCells = [...blueLines, ...brownLines].flat();

// --- Snake membership -------------------------------------------------------
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], OFF, END, MID)),
  ...snake.at(lineCells).map(cell => new Given(cell, OFF)),
];

// --- Degree: an end has one snake neighbour, a middle cell has two. ---------
// Reads the cell's own code, then the code of each orthogonal neighbour.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, code) => {
    if (state.phase === 'start') {
      if (code === OFF) return { phase: 'free' };
      return { phase: 'count', need: code === END ? 1 : 2, count: 0 };
    }
    if (state.phase === 'free') return { phase: 'free' };
    const count = state.count + (code === OFF ? 0 : 1);
    return count > state.need
      ? undefined : { phase: 'count', need: state.need, count };
  },
  accept: (state) => state.phase === 'free' || state.count === state.need,
}, numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch -------------------------------------------------
// Reads the four codes of a 2x2 block, left-to-right then top-to-bottom. Two
// diagonally opposite snake cells are legal only as the two arms of a turn, i.e.
// when one of the other two cells of the block is on the snake as well.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, code) => {
    if (block === null) return { block: null };
    const next = [...block, code !== OFF];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, numValues);
// One machine per 2x2 block, stamped from the top-left block over every cell that
// starts one (i.e. every cell off the last row and column).
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2))),
  snake.at(blockOrigins));

// --- Enters every 3x3 box exactly once --------------------------------------
// Because the degree rule makes orthogonal adjacency between snake cells the same
// thing as being consecutive along the snake, the snake's cells inside one box
// form a forest, and it enters the box once exactly when they form one component.
// The machine scans the box row-major and keeps (snake cells seen) minus (adjacent
// snake pairs seen), which for a forest is that component count; it must end at 1.
const boxRunMachine = NFA.encodeSpec({
  // `above` is the completed row directly above the cell being read, `row` the
  // part of the current row already read.
  startState: { above: [], row: [], components: 0 },
  transition: ({ above, row, components }, code) => {
    const on = code !== OFF;
    const column = row.length;
    let next = components + (on ? 1 : 0);
    if (on && column > 0 && row[column - 1]) next--;
    if (on && above.length > 0 && above[column]) next--;
    const grown = [...row, on];
    return grown.length === 3
      ? { above: grown, row: [], components: next }
      : { above, row: grown, components: next };
  },
  accept: ({ components }) => components === 1,
  maxDepth: 9,   // the nine cells of one box; the running count is not otherwise bounded
}, numValues);
const boxes = graph.boxes();
const boxRuns = boxes.map(box => new NFA(boxRunMachine, 'box-run',
  ...snake.at(box)));

// --- The snake is a region sum line -----------------------------------------
// One machine per box: read the common segment sum, then each box cell's code
// followed by its digit, and total the digits of the cells on the snake.
const boxSumMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'target':
        return { phase: 'code', target: value, sum: 0 };
      case 'code':
        return {
          phase: 'digit', target: state.target, sum: state.sum,
          on: value !== OFF,
        };
      case 'digit': {
        const sum = state.on ? state.sum + value : state.sum;
        return sum > state.target
          ? undefined : { phase: 'code', target: state.target, sum };
      }
    }
  },
  accept: (state) => state.phase === 'code' && state.sum === state.target,
}, numValues);
const boxSums = boxes.map(box => new NFA(boxSumMachine, 'box-sum',
  segmentSumCell, ...box.flatMap(cell => [snake.at(cell), cell])));

// --- The snake is a product sum line ----------------------------------------
// Scans the whole grid as (code, digit) pairs after reading the segment sum. The
// snake's total is nine equal box segments, so the product of its two end digits
// must be nine times that sum. Ending with exactly two ends seen is also what
// makes the snake a single path rather than a path plus loops.
const snakeProductMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'target':
        return { phase: 'code', total: 9 * value, ends: 0, first: 0 };
      case 'code':
        return {
          phase: 'digit', total: state.total, ends: state.ends,
          first: state.first, code: value,
        };
      case 'digit': {
        const { total, ends, first, code } = state;
        if (code !== END) return { phase: 'code', total, ends, first };
        if (ends === 0) return { phase: 'code', total, ends: 1, first: value };
        if (ends === 1) {
          return first * value === total
            ? { phase: 'code', total, ends: 2, first: 0 } : undefined;
        }
        return undefined;   // a third end: not a single snake
      }
    }
  },
  accept: (state) => state.phase === 'code' && state.ends === 2,
}, numValues);
const gridScan = gridCells.flatMap(cell => [snake.at(cell), cell]);
const snakeProduct = new NFA(snakeProductMachine, 'snake-product',
  segmentSumCell, ...gridScan);

// --- Circles count their own digit along the snake --------------------------
// Reads the circle's digit, then the whole grid as (code, digit) pairs, counting
// the snake cells holding that digit. The circled cell is scanned like any other,
// so it counts itself when it is on the snake.
const circleCountMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'target':
        return { phase: 'code', target: value, count: 0 };
      case 'code':
        return {
          phase: 'digit', target: state.target, count: state.count,
          on: value !== OFF,
        };
      case 'digit': {
        const hit = state.on && value === state.target ? 1 : 0;
        const count = state.count + hit;
        return count > state.target
          ? undefined : { phase: 'code', target: state.target, count };
      }
    }
  },
  accept: (state) => state.phase === 'code' && state.count === state.target,
}, numValues);
const circleCounts = circles.map(cell => new NFA(circleCountMachine, 'circle',
  cell, ...gridScan));

// --- Drawn product sum lines ------------------------------------------------
// Reads the line's cells end to end, keeping the first digit and the running
// total, and whether the total so far equals first * (digit just read) -- which
// on the last cell is exactly "the ends multiply to the whole line's sum".
const productSumMachine = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') {
      return { phase: 'rest', first: value, sum: value, matched: false };
    }
    const sum = state.sum + value;
    // The target is first * last <= first * 9, so a bigger running total is dead.
    if (sum > 9 * state.first) return undefined;
    return {
      phase: 'rest', first: state.first, sum,
      matched: sum === state.first * value,
    };
  },
  accept: (state) => state.phase === 'rest' && state.matched,
}, numValues);
const productSumLines = brownLines.map(line =>
  new NFA(productSumMachine, 'product-sum', ...line));

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  segmentSum.toVar('snake segment sum'),
  ...membership,
  // A single snake: its cells form one orthogonally-connected region, and the
  // degree rule above makes that region a path.
  new ConnectedValues('VS', [END, MID]),
  ...degrees,
  noDiagonalTouches,
  ...boxRuns,
  ...boxSums,
  snakeProduct,
  ...circleCounts,
  ...blueLines.map(line => new RegionSumLine(...line)),
  ...productSumLines,
];
