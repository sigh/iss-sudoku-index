// Title: Secret Skyscraper Sudoku
// Author: Wessel Strijkstra
// Video: https://www.youtube.com/watch?v=7au-_6EyYJw
// Source: https://app.crackingthecryptic.com/webapp/htFgPjhFp2
//
// Standard 9x9 sudoku (rows/cols/boxes all-different from Shape).
// Kropki dots: black = one value double the other; white = consecutive values.
// Skyscraper outside clues: a clue shows the count of grid digits visible in
// its row/column from its side (a digit is visible if it beats every digit
// nearer the clue). Every one of the 36 outside clues is hidden behind a
// letter A-F instead of a printed number: same letter always hides the same
// number, different letters hide different numbers (the puzzle's "secret"
// twist).
//
// Each letter gets one Var cell holding its hidden value; that same cell is
// reused as the clue's target in every NFA below, so "same letter, same
// number" holds by construction. AllDifferent over the six cells encodes
// "different letters, different numbers".

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const clueVars = LETTERS.map(L => new Var(L, `clue ${L}`, 1));
const clueCell = Object.fromEntries(
  LETTERS.map((L, i) => [L, clueVars[i].cell(1)]));

// Clue letter per column (top/bottom) and per row (left/right), index 0 = 1.
// Transcribed from the drawn letter nearest each outside-clue cell.
const TOP = ['A', 'F', 'B', 'B', 'C', 'B', 'B', 'D', 'D'];
const BOTTOM = ['D', 'D', 'B', 'D', 'F', 'C', 'D', 'B', 'A'];
const LEFT = ['B', 'F', 'B', 'A', 'F', 'D', 'C', 'E', 'F'];
const RIGHT = ['D', 'C', 'B', 'D', 'F', 'B', 'A', 'B', 'B'];

// Skyscraper-visibility NFA: first segment is the single clue cell (sets the
// target count), second segment is the row/column ray in viewing order.
// `count` tracks visible digits so far (clamped once it could only fail);
// `max` is the tallest digit seen. Accept when the ray's final visible count
// equals the target.
const skyscraperSpec = NFA.encodeSpec({
  startState: { target: null, max: 0, count: 0 },
  transition: ({ target, max, count }, value) => {
    if (value === SEGMENT_BREAK) return { target, max: 0, count: 0 };
    if (target === null) return { target: value, max: 0, count: 0 };
    const visible = value > max ? 1 : 0;
    return {
      target,
      max: visible ? value : max,
      count: Math.min(count + visible, target + 1),
    };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 11, // 1 clue cell + 1 break + 9 ray cells
}, 9, { multiSegment: true });

const skyscraperNFAs = [];
for (let i = 1; i <= 9; i++) {
  const col = (r) => makeCellId(r, i);
  const row = (c) => makeCellId(i, c);
  const colTopDown = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(col);
  const rowLeftRight = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(row);
  skyscraperNFAs.push(
    new NFA(skyscraperSpec, `sky-top-c${i}`, [clueCell[TOP[i - 1]]], colTopDown),
    new NFA(skyscraperSpec, `sky-bottom-c${i}`, [clueCell[BOTTOM[i - 1]]],
      colTopDown.slice().reverse()),
    new NFA(skyscraperSpec, `sky-left-r${i}`, [clueCell[LEFT[i - 1]]], rowLeftRight),
    new NFA(skyscraperSpec, `sky-right-r${i}`, [clueCell[RIGHT[i - 1]]],
      rowLeftRight.slice().reverse()),
  );
}

// Kropki dots between two grid cells.
const blackDotEdges = [
  ['R1C1', 'R1C2'], ['R2C1', 'R2C2'], ['R2C7', 'R3C7'],
  ['R2C7', 'R2C8'], ['R5C7', 'R5C8'], ['R7C9', 'R8C9'],
];
const whiteDotEdges = [
  ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R2C5', 'R2C6'],
];
const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));
const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

// One dot's other end is an outside clue cell rather than a grid cell
// (the drawn dot spans R5C9 and the ring cell holding letter F, the clue for
// the right side of row 5). WhiteDot requires grid-adjacent cells, so this
// non-grid pairing uses the equivalent custom Pair relation instead.
const diffByOne = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const clueDot = new Pair(diffByOne, 'F clue vs R5C9', clueCell.F, 'R5C9');

return [
  new Shape('9x9'),
  ...clueVars,
  new AllDifferent(...LETTERS.map(L => clueCell[L])),
  ...blackDots,
  ...whiteDots,
  clueDot,
  ...skyscraperNFAs,
];
