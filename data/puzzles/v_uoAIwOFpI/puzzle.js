// Title: The Wall
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=v_uoAIwOFpI
// Source: https://sudokupad.app/g13eyoghwx?setting-nogrid=1

// Rules: place 1-9 once each in every row and column (no box constraint is
// stated or drawn). The grid is tiled by a running-bond wall of 45 bricks --
// 36 horizontal two-cell bricks and 9 single-cell half-bricks -- read from
// the puzzle's drawn mortar lines: every odd playable row has its half-brick
// at the left edge (column 1) and every even row has it at the right edge
// (column 9), with the remaining eight cells of each row forming four
// horizontal dominoes. INDIVIDUALITY requires that no two bricks share the
// same digits regardless of order/position.
//
// COMMONALITY (a circled digit on each brick showing how many bricks share
// its sum, plus inequality symbols between bricks) is omitted: the source
// payload carries no digit or symbol values for these marks anywhere, so it
// cannot be encoded.

const bricks = [];
for (let r = 1; r <= 9; r++) {
  const singleAtLeft = (r % 2 === 1);
  const singleCol = singleAtLeft ? 1 : 9;
  bricks.push([makeCellId(r, singleCol)]);
  const dominoStart = singleAtLeft ? 2 : 1;
  for (let i = 0; i < 4; i++) {
    const c = dominoStart + i * 2;
    bricks.push([makeCellId(r, c), makeCellId(r, c + 1)]);
  }
}
const singles = bricks.filter(b => b.length === 1).map(b => b[0]);
const dominoes = bricks.filter(b => b.length === 2);

// A single-cell brick's "digits" is just its one value, so INDIVIDUALITY for
// the 9 singles is a plain AllDifferent.
//
// A domino's two digits already differ (same row), and two dominoes hold the
// same unordered digit pair exactly when their (low, high) digits both
// match. Read each domino's low/high digits into a Var pair via a small NFA
// (over the real 1-9 alphabet -- no widened Shape needed), then forbid every
// pair of dominoes from matching on both Lo and Hi.
const loHiNFA = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, a: value };
    if (state.phase === 1) {
      // `value` is the domino's second digit.
      return { phase: 2, lo: Math.min(state.a, value), hi: Math.max(state.a, value) };
    }
    if (state.phase === 2) {
      // `value` is the Lo Var; it must match the computed low digit.
      return value === state.lo ? { phase: 3, hi: state.hi } : undefined;
    }
    // phase 3: `value` is the Hi Var; it must match the computed high digit.
    return value === state.hi ? { phase: 4 } : undefined;
  },
  accept: (state) => state.phase === 4,
}, 9);

const loVar = new Var('L', 'domino low digit', dominoes.length);
const hiVar = new Var('H', 'domino high digit', dominoes.length);
const dominoLoHi = dominoes.map(([a, b], i) => new NFA(
  loHiNFA, 'domino low/high digits',
  a, b, loVar.cell(i + 1), hiVar.cell(i + 1)));

// "Not equal" between two cells is just a two-cell AllDifferent, applied
// between every pair of dominoes' Lo/Hi Vars: at least one of Lo/Hi must
// differ.
const dominoPairsDistinct = [];
for (let i = 0; i < dominoes.length; i++) {
  for (let j = i + 1; j < dominoes.length; j++) {
    dominoPairsDistinct.push(new Or([
      new AllDifferent(loVar.cell(i + 1), loVar.cell(j + 1)),
      new AllDifferent(hiVar.cell(i + 1), hiVar.cell(j + 1)),
    ]));
  }
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new AllDifferent(...singles),
  loVar,
  hiVar,
  ...dominoLoHi,
  ...dominoPairsDistinct,
];
