// Title: Untitled
// Author: Grant Fikes
// Video: https://www.youtube.com/watch?v=pnghC02JeQY
// Source: https://cracking-the-cryptic.web.app/sudoku/4R7H4Nh22N

// No underlying Sudoku grid: this is a pure shading nonogram over a 10x10
// grid, so the grid is `Raw` (no rows, columns, boxes, or digits) and its
// own cell values, 1 = BLACK / 2 = WHITE, are the shading.
//
// Rules: shade cells so the black cells form a single orthogonally-connected
// region; no 2x2 block of the grid may be entirely black; each row/column
// carries an ordered clue list, read in the row's/column's natural reading
// direction, where a number is a run of exactly that length, `?` is a run of
// unknown positive length, and `*` is zero or more further runs of unknown
// length, in that position of the sequence.

const BLACK = 1;
const WHITE = 2;

const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// No 2x2 block may be entirely black. Scans the block's 4 cells (order
// doesn't matter for an "all four equal BLACK" test) and rejects only if
// every one is BLACK; this is deliberately one-sided (unlike a full
// Yin-Yang), since the rules impose nothing on all-white 2x2 blocks.
const no4BlackMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allBlack = next.every(v => v === BLACK);
    return allBlack ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no4Black = graph.makeReplicate(
  new NFA(no4BlackMachine, 'no-4-black', ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

// Row/column run-length clue lists, transcribed from the outside clue lanes,
// each read in that row's/column's natural reading direction. A `?` token is
// one run of unknown positive length; a `*` token is zero or more further
// runs, each of unknown length.
const rowClues = {
  1: ['2', '1'],
  2: ['?', '?', '?'],
  3: ['*'],
  4: ['?', '?', '?', '?', '?'],
  5: ['5', '*'],
  6: ['*', '1'],
  7: ['3', '?', '?', '2'],
  8: ['?'],
  9: ['?', '4', '3'],
  10: ['*'],
};
const colClues = {
  1: ['2', '2', '?'],
  2: ['*', '3', '*'],
  3: ['*'],
  4: ['*'],
  5: ['*'],
  6: ['*'],
  7: ['4', '*'],
  8: ['*'],
  9: ['4', '*'],
  10: ['3'],
};

// Builds a Regex pattern (over digits '1'=BLACK, '2'=WHITE) that accepts a
// line iff it decomposes, left to right, into exactly this token sequence:
// a NUM token is `1{k}` (a run of that exact length); a `?` token is `1+`
// (one run, any positive length); a `*` token is zero or more runs of any
// length, each separated from its neighbours by `2+`. Two runs are always
// separated by `2+` so the match forces the actual maximal black runs of the
// line to fall exactly on token boundaries -- a token can't merge with its
// neighbour because a literal white cell always sits between them. `needGap`
// tracks whether a run has already been placed to the left (so the next
// token, if it produces a run at all, needs a mandatory leading gap) or not
// (so only an optional leading `2*` is needed, e.g. at the very start of the
// line). Recursion is right to left over the token list. This was validated
// by exhaustive brute force -- every one of the 1024 possible 10-cell
// black/white strings, against an independent run-list checker -- for every
// row/column clue actually used below.
function runClueRegex(tokens) {
  const n = tokens.length;
  const memo = new Map();
  const gapFrag = (needGap) => (needGap ? '2+' : '2*');

  function G(i, needGap) {
    const key = i + '|' + needGap;
    if (memo.has(key)) return memo.get(key);
    let res;
    if (i === n) {
      res = '2*';
    } else {
      const tok = tokens[i];
      if (tok === '*') {
        const zeroReps = G(i + 1, needGap);
        const oneOrMoreReps =
          gapFrag(needGap) + '1+' + '(2+1+)*' + G(i + 1, true);
        res = '(' + zeroReps + '|' + oneOrMoreReps + ')';
      } else {
        const frag = tok === '?' ? '1+' : `1{${tok}}`;
        res = gapFrag(needGap) + frag + G(i + 1, true);
      }
    }
    memo.set(key, res);
    return res;
  }

  return G(0, false);
}

const rowRegexes = Object.entries(rowClues).map(
  ([r, toks]) => new Regex(runClueRegex(toks), ...graph.row(+r)));
const colRegexes = Object.entries(colClues).map(
  ([c, toks]) => new Regex(runClueRegex(toks), ...graph.column(+c)));

return [
  shape,
  new ConnectedValues('', BLACK),
  no4Black,
  ...rowRegexes,
  ...colRegexes,
];
