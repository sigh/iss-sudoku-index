// Title: unknown
// Author: Osh Tirola
// Video: https://www.youtube.com/watch?v=2UUH5SdbpAs
// Source: https://cracking-the-cryptic.web.app/sudoku/GM8FdqTnMb

// Normal Sudoku rules apply over the nine irregular 9-cell regions below (no
// default 3x3 boxes). In each row, column, and region, exactly two cells are
// "stars"; star cells cannot touch, even diagonally. Purple outside clues
// give the sum of the two starred digits in their row/column; grey outside
// clues give the sum of the digits strictly between the two stars in their
// row/column. Row 1 has no outside clue in either direction.

const graph = cellGraph('9x9');

// Region cell lists, R#C# order as drawn (payload `regions`, 0-indexed
// [row,col] pairs converted to 1-indexed R#C#). These nine regions already
// cover all 81 cells exactly once (checked against the payload), so the
// payload's 10th (empty stub) region is vacuous and is omitted.
const regions = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R5C4', 'R5C2', 'R5C3', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R8C5', 'R9C6', 'R9C7', 'R8C7'],
  ['R9C8', 'R8C8', 'R7C8', 'R7C7', 'R7C6', 'R8C6', 'R7C5', 'R7C4', 'R8C4'],
  ['R6C2', 'R7C2', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R5C5', 'R5C6', 'R5C7'],
  ['R6C6', 'R6C7', 'R6C8', 'R5C8', 'R4C8', 'R4C7', 'R3C7', 'R2C7', 'R2C8'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R3C6', 'R4C6'],
  ['R2C9', 'R3C9', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R2C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R2C5', 'R4C5'],
];
const jigsawRegions = regions.map(cells => new Jigsaw('9x9', ...cells));

// Outside clues, keyed by 1-based row/column index. Purple = sum of the two
// star digits; grey = sum of the digits strictly between the two stars.
// Values transcribed from the drawn outside-clue text; purple/grey read off
// each clue's fill colour (magenta purple vs light grey).
const purpleColumns = { 1: 13, 2: 17, 4: 8, 5: 13, 6: 3, 7: 3, 8: 14, 9: 11 };
const purpleRows = { 2: 6, 3: 9, 4: 5, 5: 9, 6: 11, 7: 9, 8: 8, 9: 11 };
const greyColumns = { 3: 7, 6: 29 };
const greyRows = { 2: 2, 5: 21, 7: 2, 9: 4 };

// Star indicator overlay: NOT_STAR / STAR fit in the default 1-9 domain, so
// no widened Shape is needed (same pattern as a hidden-modifier flag var).
const NOT_STAR = 1;
const STAR = 2;
const flags = graph.makeOverlay('VS');
const flag = cell => flags.at(cell);
const starVar = flags.toVar('star flags');
// Every star flag admits NOT_STAR or STAR: one Given template, replicated
// (translation offset 0) over every flag cell via the overlay locator.
const starDomain = flags.makeReplicate(new Given(flag('R1C1'), NOT_STAR, STAR));

// Exactly two stars per row / column / region.
const TWO_STARS = '1_1_1_1_1_1_1_2_2';
const starCounts = [
  ...graph.rows().map(cells => new ContainExact(TWO_STARS, ...flags.at(cells))),
  ...graph.columns().map(cells => new ContainExact(TWO_STARS, ...flags.at(cells))),
  ...regions.map(cells => new ContainExact(TWO_STARS, ...flags.at(cells))),
];

// No two stars touch, even diagonally: forbid STAR/STAR on every king-move
// pair of grid cells. Grouped into the 4 "forward" king offsets so each
// unordered pair is constrained exactly once, and each offset group is one
// Pair template stamped by Replicate over every grid cell that has a
// same-offset neighbour (targets computed from the grid itself, so edge
// cells are naturally excluded from the offsets that would fall off-grid).
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 9);
const kingOffsets = [[0, 1], [1, -1], [1, 0], [1, 1]];
const noTouchStars = kingOffsets.map(([dRow, dCol]) => {
  // Replicate.encodeTargetCells locates targets/origin in the overlay's own
  // coordinate space (VS ids), not the grid's -- map through flag() first.
  const targetCells = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const originCell = targetCells[0];
  const partnerCell = graph.step(originCell, dRow, dCol);
  const targets = flags.at(targetCells);
  const origin = flag(originCell);
  const partner = flag(partnerCell);
  return new Replicate(
    [new Pair(noTouchKey, 'star no-touch', origin, partner)],
    Replicate.encodeTargetCells(targets, origin, flags),
    origin,
  );
});

// Read a row/column as [digit, flag, digit, flag, ..., digit, flag] so one
// NFA can see both which cells are starred and their digits together.
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

// Purple: sum of the two starred digits equals `target`. State tracks
// whether the next symbol is a digit or its flag, the pending digit (added
// only if its flag turns out to be STAR), how many stars seen, and the
// running sum (clamped past target so it cannot blow the state count).
function starSumSpec(target) {
  return NFA.encodeSpec({
    startState: { onDigit: true, pending: 0, count: 0, sum: 0 },
    transition: ({ onDigit, pending, count, sum }, value) => {
      if (onDigit) return { onDigit: false, pending: value, count, sum };
      const isStar = value === STAR;
      return {
        onDigit: true,
        pending: 0,
        count: count + (isStar ? 1 : 0),
        sum: Math.min(sum + (isStar ? pending : 0), target + 1),
      };
    },
    accept: ({ onDigit, count, sum }) => onDigit && count === 2 && sum === target,
    maxDepth: 18,
  }, 9);
}

// Grey: sum of the digits strictly between the two stars equals `target`.
// `seen` counts stars crossed so far (0/1/2); only digits read while
// `seen === 1` (i.e. between the stars) are added to the running sum.
function starSandwichSpec(target) {
  return NFA.encodeSpec({
    startState: { onDigit: true, pending: 0, seen: 0, sum: 0 },
    transition: ({ onDigit, pending, seen, sum }, value) => {
      if (onDigit) return { onDigit: false, pending: value, seen, sum };
      const isStar = value === STAR;
      if (seen === 0) {
        return { onDigit: true, pending: 0, seen: isStar ? 1 : 0, sum };
      }
      if (seen === 1) {
        if (isStar) return { onDigit: true, pending: 0, seen: 2, sum };
        return {
          onDigit: true, pending: 0, seen: 1,
          sum: Math.min(sum + pending, target + 1),
        };
      }
      // seen === 2: past the second star, nothing further counts.
      return { onDigit: true, pending: 0, seen: 2, sum };
    },
    accept: ({ onDigit, seen, sum }) => onDigit && seen === 2 && sum === target,
    maxDepth: 18,
  }, 9);
}

const purpleConstraints = [
  ...Object.entries(purpleColumns).map(([c, total]) =>
    new NFA(starSumSpec(total), 'purpleCol', ...interleave(graph.column(Number(c))))),
  ...Object.entries(purpleRows).map(([r, total]) =>
    new NFA(starSumSpec(total), 'purpleRow', ...interleave(graph.row(Number(r))))),
];
const greyConstraints = [
  ...Object.entries(greyColumns).map(([c, total]) =>
    new NFA(starSandwichSpec(total), 'greyCol', ...interleave(graph.column(Number(c))))),
  ...Object.entries(greyRows).map(([r, total]) =>
    new NFA(starSandwichSpec(total), 'greyRow', ...interleave(graph.row(Number(r))))),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawRegions,
  new Given('R1C6', 6),
  starVar,
  starDomain,
  ...starCounts,
  ...noTouchStars,
  ...purpleConstraints,
  ...greyConstraints,
];
