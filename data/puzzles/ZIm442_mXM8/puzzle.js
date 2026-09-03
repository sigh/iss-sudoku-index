// Title: Pierced Snake
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=ZIm442_mXM8
// Source: https://app.crackingthecryptic.com/sudoku/tGf29NLMRT

// Normal sudoku rules apply. Digits along an arrow must sum to the number in the
// circle. There is a 1-cell-wide snake (with a head and a tail) that enters each
// box exactly once. It may not touch itself, not even diagonally. The number in
// any circle indicates how many cells the snake occupies in that box. The first
// two digits on the arrow, as read from the circle, give a 2-digit number showing
// the sum of the snake's cells in the circle's box.
//
// Every sentence above is encoded; nothing is omitted.

// Snake membership lives in one Var cell per grid cell. The code also records
// how many snake neighbours the cell has, so that "exactly two ends" is a count
// over the codes rather than a second overlay.
const OFF = 1;   // not on the snake
const BODY = 2;  // on the snake, two snake neighbours
const TIP = 3;   // on the snake, one snake neighbour (the head or the tail)
const isOn = value => value !== OFF;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes();
const snake = graph.makeOverlay('VS');

// Drawn circles, one per box for seven of the nine boxes. Transcribed from the
// seven white circle overlays.
const circles = ['R2C2', 'R1C7', 'R4C3', 'R5C8', 'R7C2', 'R8C5', 'R9C7'];

// Drawn arrows: bulb (the circle it starts in) first, then the arm cells in
// order away from the bulb, following each drawn shaft from its circle to its
// arrowhead. R9C7's circle has no shaft, so it appears in `circles` only.
const arrows = [
  ['R4C3', 'R3C3', 'R2C3'],
  ['R2C2', 'R3C3', 'R2C3'],
  ['R1C7', 'R2C6', 'R2C7', 'R2C8'],
  ['R5C8', 'R5C7', 'R4C8'],
  ['R7C2', 'R6C2', 'R6C3', 'R6C4'],
  ['R8C5', 'R7C5', 'R6C5', 'R5C5'],
];

const boxOf = cell => boxes.find(box => box.includes(cell));

// --- Snake shape -----------------------------------------------------------

// Degree: a BODY cell has exactly two snake neighbours, a TIP exactly one, and
// an OFF cell is unconstrained. Reads the cell's own code, then each of its
// orthogonal neighbours' codes.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return isOn(value)
        ? { phase: 'on', wanted: value === TIP ? 1 : 2, count: 0 }
        : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (isOn(value) ? 1 : 0);
    return count > state.wanted
      ? undefined
      : { phase: 'on', wanted: state.wanted, count };
  },
  accept: state => state.phase === 'off' || state.count === state.wanted,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'snake-degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// Two ends: exactly two cells in the whole grid carry the TIP code. Together
// with the degree rule and the connectivity below this makes the snake cells one
// simple path -- head and tail at the two TIPs.
const twoEnds = new ContainExact(`${TIP}_${TIP}`, ...snake.cells());

// No self-touch and 1-cell-wide: reads the four codes of a 2x2 block, left to
// right then top to bottom. A diagonal pair with both other cells off is a
// diagonal touch; a 90-degree turn (three on cells) is not, and must stay legal.
// All four on is two cells wide.
const noTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };  // this block already checked
    const next = [...block, isOn(value)];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    const twoWide = topLeft && topRight && bottomLeft && bottomRight;
    return (diagonalOnly || twoWide) ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One machine per 2x2 block, stamped over the 64 blocks by their top-left cell.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouches = snake.makeReplicate(
  new NFA(noTouchMachine, 'snake-no-touch',
    ...snake.at(graph.block(blockOrigins[0], 2, 2))),
  snake.at(blockOrigins));

// One visit per box: the snake's cells inside a box form a single non-empty
// orthogonally-connected group. Cells belonging to two separate visits could not
// be orthogonally adjacent (the degree rule already forbids that), so a
// connected non-empty group is exactly one entry into the box.
//
// The machine scans a box's nine codes in reading order. `front` holds the
// component labels of the three most recently read cells -- the only ones a
// later cell can join, since the next cell touches the previous cell and the
// cell three back, which is `front[0]` (zero-padded, so the top row correctly
// has nothing above it). `col` is only needed to drop the left neighbour at the
// start of a row. Labels are renumbered by first appearance so that states
// differing only in label names collapse. When a label falls out of `front` its
// component can never grow again, so it must be the only one, and every
// remaining cell must be off the snake (`sealed`).
const relabel = front => {
  const seen = new Map([[0, 0]]);
  return front.map(label => {
    if (!seen.has(label)) seen.set(label, seen.size);
    return seen.get(label);
  });
};
const boxVisitMachine = NFA.encodeSpec({
  startState: { front: [0, 0, 0], sealed: false, col: 0 },
  transition: ({ front, sealed, col }, value) => {
    const on = isOn(value);
    if (sealed && on) return undefined;             // a second, separate visit
    const above = front[0];                         // cell three back
    const left = col !== 0 ? front[2] : 0;          // cell one back, same row
    let merged = front;
    let label = 0;
    if (on) {
      const joins = [above, left].filter(l => l !== 0);
      if (joins.length === 0) {
        label = Math.max(...front) + 1;             // starts a new component
      } else {
        label = joins[0];
        if (joins.length === 2 && joins[1] !== label) {
          merged = front.map(l => (l === joins[1] ? label : l));
        }
      }
    }
    const next = [merged[1], merged[2], label];
    const dropped = merged[0];
    let nextSealed = sealed;
    if (dropped !== 0 && !next.includes(dropped)) {
      if (next.some(l => l !== 0)) return undefined;  // a second component
      nextSealed = true;
    }
    return { front: relabel(next), sealed: nextSealed, col: (col + 1) % 3 };
  },
  accept: ({ front, sealed }) => {
    const live = new Set(front.filter(label => label !== 0));
    return sealed ? live.size === 0 : live.size === 1;
  },
}, geometry.numValues);
const boxVisits = boxes.map(box => new NFA(boxVisitMachine, 'box-visit',
  ...snake.at(box)));

// --- Circle and arrow clues ------------------------------------------------

const arrowSums = arrows.map(cells => new Arrow(...cells));

// A circle's digit counts the snake cells in the circle's box. Reads the circle
// digit, then the codes of the box's nine cells.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };  // the circle digit
    const next = count + (isOn(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(circle => new NFA(countMachine, 'snake-count',
  circle, ...snake.at(boxOf(circle))));

// The arrow's first two arm digits form a two-digit number equal to the sum of
// the digits in the snake's cells of the circle's box. Reads those two digits,
// then (code, digit) for each of the box's nine cells; a cell off the snake
// contributes nothing and its digit is skipped. Nine distinct digits cap any box
// total at 45, which bounds the countdown.
const MAX_BOX_SUM = 45;
const boxSumMachine = NFA.encodeSpec({
  startState: { phase: 'tens' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tens':
        return { phase: 'ones', tens: value };
      case 'ones': {
        const total = state.tens * 10 + value;
        return total > MAX_BOX_SUM ? undefined : { phase: 'code', left: total };
      }
      case 'code':
        return isOn(value)
          ? { phase: 'digit', left: state.left }
          : { phase: 'skip', left: state.left };
      case 'digit':
        return value > state.left
          ? undefined
          : { phase: 'code', left: state.left - value };
      case 'skip':
        return { phase: 'code', left: state.left };
    }
  },
  accept: ({ phase, left }) => phase === 'code' && left === 0,
}, geometry.numValues);
const boxSums = arrows.map(([bulb, ...arm]) => new NFA(boxSumMachine, 'snake-sum',
  arm[0], arm[1],
  ...boxOf(bulb).flatMap(cell => [snake.at(cell), cell])));

return [
  new Shape('9x9'),
  new Given('R3C5', 8),
  new Given('R9C9', 9),
  snake.toVar('snake'),
  snake.makeReplicate(new Given(snake.cells()[0], OFF, BODY, TIP)),
  // A single snake: the on-snake cells form one orthogonally-connected region.
  new ConnectedValues('VS', [BODY, TIP]),
  ...degrees,
  twoEnds,
  noTouches,
  ...boxVisits,
  ...arrowSums,
  ...circleCounts,
  ...boxSums,
];
