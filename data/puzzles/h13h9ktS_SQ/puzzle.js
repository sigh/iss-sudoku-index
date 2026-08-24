// Title: Double Inverse Sandwiches
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=h13h9ktS_SQ
// Source: https://app.crackingthecryptic.com/sudoku/7dhpg42PrL
//
// Standard sudoku (default 3x3 boxes match the payload's regions) plus
// "neighbour of 1/9" outside clues: for a row or column, S1 is the sum of the
// cell(s) immediately left/right (or up/down) of wherever digit 1 sits in that
// line, and S9 is the same for digit 9. An outside clue shows either one
// number (equal to S1 or S9, undetermined) or two slots, where the first
// (left/top) slot is whichever of {1,9} is encountered first scanning that
// line in reading order, and the second slot is the other. A `?` slot is
// withheld information; `=`/`>` in place of the `-` separator still relates
// the two (still-undisclosed) values.

const shape = new Shape('9x9');

// Cells of a row/column in index order (position 1..9 along the line).
const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// The (0-2) cell ids immediately left/right (or up/down) of position k
// (1-indexed) within a 9-cell line.
const neighborsAt = (cells, k) => {
  const out = [];
  if (k > 1) out.push(cells[k - 2]);
  if (k < 9) out.push(cells[k]);
  return out;
};

// "A-B" or "?-B" etc: two slots, first slot for whichever of {1,9} is
// encountered first scanning `cells` in order, second slot for the other.
// A slot value of '?' means no constraint is placed on that slot.
function orderedPairClue(cells, first, second) {
  const branches = [];
  for (let k1 = 1; k1 <= 9; k1++) {
    for (let k9 = 1; k9 <= 9; k9++) {
      if (k1 === k9) continue;
      const earlierK = Math.min(k1, k9);
      const valAt = k => (k === earlierK) ? first : second;
      const sub = [new Given(cells[k1 - 1], 1), new Given(cells[k9 - 1], 9)];
      const v1 = valAt(k1);
      const v9 = valAt(k9);
      if (v1 !== '?') sub.push(new Sum(v1, ...neighborsAt(cells, k1)));
      if (v9 !== '?') sub.push(new Sum(v9, ...neighborsAt(cells, k9)));
      branches.push(new And(sub));
    }
  }
  return new Or(branches);
}

// "?=?": the two (undisclosed) slot values are equal, order irrelevant.
function equalPairClue(cells) {
  const branches = [];
  for (let k1 = 1; k1 <= 9; k1++) {
    for (let k9 = 1; k9 <= 9; k9++) {
      if (k1 === k9) continue;
      branches.push(new And([
        new Given(cells[k1 - 1], 1),
        new Given(cells[k9 - 1], 9),
        new EqualSum(neighborsAt(cells, k1), neighborsAt(cells, k9)),
      ]));
    }
  }
  return new Or(branches);
}

// A single NFA spec, reused across every "?>?" branch below: two segments,
// sum each, accept iff the first segment's sum exceeds the second's. State is
// (segment, sumA, sumB); each sum is bounded 0-17 (two distinct 1-9 digits),
// well under the compiled-state cap.
const greaterSpec = NFA.encodeSpec({
  startState: { seg: 'A', sumA: 0, sumB: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { ...state, seg: 'B' };
    return state.seg === 'A'
      ? { ...state, sumA: state.sumA + value }
      : { ...state, sumB: state.sumB + value };
  },
  accept: ({ sumA, sumB }) => sumA > sumB,
  // Each segment is at most 2 cells (the neighbours of one line position), so
  // the longest scan is 2 + SEGMENT_BREAK + 2 = 5 symbols.
  maxDepth: 5,
}, 9, { multiSegment: true });

// "?>?": the earlier-in-reading-order-of-{1,9} slot's neighbour-sum is
// strictly greater than the later one's; neither value is disclosed.
function greaterPairClue(cells) {
  const branches = [];
  for (let k1 = 1; k1 <= 9; k1++) {
    for (let k9 = 1; k9 <= 9; k9++) {
      if (k1 === k9) continue;
      const [earlierK, laterK] = k1 < k9 ? [k1, k9] : [k9, k1];
      branches.push(new And([
        new Given(cells[k1 - 1], 1),
        new Given(cells[k9 - 1], 9),
        new NFA(greaterSpec, 'neighbour-sum-order',
          neighborsAt(cells, earlierK), neighborsAt(cells, laterK)),
      ]));
    }
  }
  return new Or(branches);
}

// A single revealed value: it belongs to whichever of {1,9} it turns out to
// match (solver-determined, per the rules text).
function eitherTargetClue(cells, value) {
  const branches = [];
  for (const target of [1, 9]) {
    for (let k = 1; k <= 9; k++) {
      branches.push(new And([
        new Given(cells[k - 1], target),
        new Sum(value, ...neighborsAt(cells, k)),
      ]));
    }
  }
  return new Or(branches);
}

const givens = [
  new Given('R2C6', 6),
  new Given('R4C7', 4),
  new Given('R6C7', 5),
  new Given('R8C6', 5),
];

const outsideClues = [
  orderedPairClue(rowCells(1), 8, 8),
  orderedPairClue(rowCells(4), 5, 9),
  orderedPairClue(rowCells(5), 17, 8),
  eitherTargetClue(rowCells(6), 4),
  greaterPairClue(rowCells(7)),
  orderedPairClue(rowCells(8), '?', 7),
  orderedPairClue(rowCells(9), '?', 7),
  equalPairClue(colCells(1)),
  equalPairClue(colCells(4)),
  orderedPairClue(colCells(5), 4, 13),
  eitherTargetClue(colCells(7), 10),
  orderedPairClue(colCells(9), 2, 3),
];

return [shape, ...givens, ...outsideClues];
