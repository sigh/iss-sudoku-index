// Title: Untitled
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=pnghC02JeQY
// Source: https://cracking-the-cryptic.web.app/sudoku/4FfmrdfFRh

// There is no underlying Sudoku here: the puzzle is a pure shading nonogram on
// a 10x10 grid, so the grid type is `Raw` (no rows/columns/boxes/digits) and
// the grid's own two cell values, 1 = BLACK and 2 = WHITE, are the shading.
//
// Rules: shade cells so that the black cells form a single orthogonally
// connected group; no 2x2 region of the grid may be entirely black; the clues
// outside a row/column list, in reading order (left to right, top to bottom),
// the groups of consecutive black cells in that row/column, where a number is
// a group of exactly that length, `?` is one group of unknown but non-zero
// length, and `*` stands for any number of further groups (possibly none) of
// unknown length.
//
// Everything drawn in the source is accounted for: the outside clues below,
// plus two purely decorative features that no rule sentence refers to and that
// are therefore not encoded -- the two full-length divider lines that quarter
// the grid into 5x5 blocks, and the solid black 5x5 square in the unused
// corner of the clue margin.

const BLACK = 1;
const WHITE = 2;

const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// No 2x2 region entirely black. The machine walks the 4 cells of one 2x2 block
// (their order is irrelevant to an "all four are BLACK" test): `seen` collects
// the values until the block is complete, then the block is rejected
// (`undefined`) exactly when all four are BLACK and otherwise moves to the
// accepting `done` sink. This is deliberately one-sided -- the rules say
// nothing about an all-white 2x2, so an all-white block is allowed.
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

// Outside clue token lists, transcribed from the source's clue margin: each
// row's lane is read left to right and each column's lane top to bottom, so
// the token order below is the order the groups occur along that line.
const rowClues = {
  1: ['1', '1', '1', '*'],
  2: ['?', '1', '*', '?'],
  3: ['*', '1', '1', '*'],
  4: ['1', '*'],
  5: ['1', '1', '1', '?'],
  6: ['1', '1'],
  7: ['?', '1', '1'],
  8: ['*', '1', '1'],
  9: ['*'],
  10: ['1', '1'],
};
const colClues = {
  1: ['?', '1', '1'],
  2: ['1', '1', '1'],
  3: ['*', '?', '1', '1'],
  4: ['*'],
  5: ['?', '1', '*'],
  6: ['1', '1', '1', '1'],
  7: ['1', '*', '1'],
  8: ['*', '?', '1'],
  9: ['*', '1'],
  10: ['1', '1', '1', '?'],
};

// Compiles one clue token list into a Regex pattern over the line's values
// ('1' = BLACK, '2' = WHITE) that matches exactly the lines whose maximal
// black groups are, in order, the groups the tokens describe: a number `k`
// becomes `1{k}`, `?` becomes `1+`, and `*` becomes an alternation between
// contributing no group at all and contributing one or more groups
// (`1+(2+1+)*`). Because consecutive tokens are always separated by a
// mandatory `2+`, a match cannot let one maximal black group straddle two
// tokens. `needGap` is the recursion's only state: it says whether some group
// has already been placed to the left, so the next group must be preceded by
// at least one white cell (`2+`) rather than by an optional run of them
// (`2*`, which is what is wanted at the very start of the line). The
// recursion runs right to left over the token list. Each of the 20 patterns
// this produces was checked against an independent run-length reference over
// all 1024 possible 10-cell black/white lines.
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
        const zeroGroups = G(i + 1, needGap);
        const oneOrMoreGroups =
          gapFrag(needGap) + '1+' + '(2+1+)*' + G(i + 1, true);
        res = '(' + zeroGroups + '|' + oneOrMoreGroups + ')';
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
