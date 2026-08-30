// Title: A "4 to 6" Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ZzH2_tjQAHE
// Source: https://cracking-the-cryptic.web.app/sudoku/nrTRpjpgTF

// Normal sudoku rules apply (standard 3x3 boxes, from Shape('9x9')). Two
// givens (provenance: payload cells[row][col].value): R8C4=1, R9C6=4. Every
// outside clue (provenance: the 18 white text overlays flanking the grid,
// one per row/column lane) gives the sum of the digits sandwiched between
// the 4 and the 6 in that row or column, wherever those two digits fall --
// the title's "4 to 6 Sandwich" names this in place of the classic Sandwich
// Sudoku rule of sandwiching between 1 and 9. No `metadata.rules` text is
// present in the payload; the title is the only rule statement, and the
// clue values themselves cannot distinguish a "4 to 6" from a "1 to 9"
// reading -- with 7 free digits between any bread pair both readings can
// reach any sum 0-35 on every lane -- so the title is what this encoding
// follows.

// Sandwich (built-in) is fixed to the 1-9 bread pair, so the 4-6 variant
// needs a custom scan: a 3-state marker-phase NFA per row/column, run over
// that line's 9 cells in grid order. `m` tracks how many of {4, 6} have
// been seen so far ('none' / 'one' / 'both'); while `m === 'one'` every
// non-marker cell read is "between" and adds its value to `sum`, clamped at
// target+1 once the target can only be missed (bounded-counting NFA
// practice). Accept iff both markers were seen and the final sum equals the
// lane's target. `sum` is capped per line at that line's own target, so
// each of the 18 lanes below gets its own compiled machine.
const makeBetweenFourSixSumNFA = (target) => NFA.encodeSpec({
  startState: { m: 'none', sum: 0 },
  transition: ({ m, sum }, value) => {
    const isMarker = value === 4 || value === 6;
    const wasBetween = m === 'one';
    const newSum = (wasBetween && !isMarker)
      ? Math.min(sum + value, target + 1)
      : sum;
    const newM = m === 'none' ? (isMarker ? 'one' : 'none')
      : m === 'one' ? (isMarker ? 'both' : 'one')
        : 'both';
    return { m: newM, sum: newSum };
  },
  accept: ({ m, sum }) => m === 'both' && sum === target,
  maxDepth: 9,
}, /* numValues= */ 9);

const graph = cellGraph('9x9');

// Left-of-grid row clues, R1..R9 (provenance: left-margin overlays, one per
// row, nearest-grid-first = as-printed since each lane has a single clue).
const rowClues = [35, 16, 10, 14, 6, 2, 1, 25, 7];
// Top-of-grid column clues, C1..C9 (provenance: top-margin overlays, same).
const colClues = [26, 22, 11, 3, 2, 8, 18, 6, 12];

const rowSandwiches = rowClues.map((target, i) => new NFA(
  makeBetweenFourSixSumNFA(target), 'Sandwich4-6', ...graph.row(i + 1)));
const colSandwiches = colClues.map((target, i) => new NFA(
  makeBetweenFourSixSumNFA(target), 'Sandwich4-6', ...graph.column(i + 1)));

return [
  new Shape('9x9'),
  new Given('R8C4', 1),
  new Given('R9C6', 4),
  ...rowSandwiches,
  ...colSandwiches,
];
