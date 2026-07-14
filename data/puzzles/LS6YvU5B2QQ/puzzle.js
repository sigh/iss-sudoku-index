// Title: Bigger Than Me
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=LS6YvU5B2QQ
// Source: https://sudokupad.app/nthjb6e7c0

// Normal 6x6 sudoku rules apply. (Shape('6x6')'s default boxes are 2 rows x
// 3 cols, matching the puzzle's drawn regions exactly.)

// "The digit in a coloured square indicates how many circles of that colour
// contain a digit bigger than itself." Four colours are drawn (cyan, yellow,
// green, red); each colours exactly 6 circle cells, and some cells of that
// colour also carry a square instead of (or as well as) a circle. Every
// square is its own clue, checked against its colour's fixed set of 6
// circles.

// One NFA per squared cell: the first read cell is the square (sets
// "target" to its own digit), then each circle of that colour adds 1 to
// "count" when its digit exceeds target. Accept iff count == target at the
// end. (Passing a flat, unbroken cell list -- no nested segment arrays --
// keeps this a single-segment scan, so no SEGMENT_BREAK handling is needed.)
const biggerCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value > target ? 1 : 0;
    const next = count + hit;
    // Once count exceeds target it can never come back down: dead branch.
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 6);

const biggerCount = (square, circles) =>
  new NFA(biggerCountSpec, 'biggerCount', square, ...circles);

const CYAN_CIRCLES = ['R4C4', 'R1C6', 'R6C6', 'R1C1', 'R3C2', 'R5C3'];
const YELLOW_CIRCLES = ['R4C2', 'R3C4', 'R5C5', 'R3C1', 'R6C3', 'R2C3'];
const GREEN_CIRCLES = ['R2C5', 'R6C5', 'R5C4', 'R5C1', 'R2C4', 'R2C2'];
const RED_CIRCLES = ['R1C5', 'R4C1', 'R1C3', 'R5C2', 'R6C4', 'R2C1'];

const CYAN_SQUARES = ['R3C5', 'R2C6'];
const YELLOW_SQUARES = ['R4C6'];
const GREEN_SQUARES = ['R4C5', 'R5C6', 'R1C4'];
const RED_SQUARES = ['R4C3', 'R3C6'];

const colourClues = [
  ...CYAN_SQUARES.map(sq => biggerCount(sq, CYAN_CIRCLES)),
  ...YELLOW_SQUARES.map(sq => biggerCount(sq, YELLOW_CIRCLES)),
  ...GREEN_SQUARES.map(sq => biggerCount(sq, GREEN_CIRCLES)),
  ...RED_SQUARES.map(sq => biggerCount(sq, RED_CIRCLES)),
];

return [
  new Shape('6x6'),
  ...colourClues,
];
