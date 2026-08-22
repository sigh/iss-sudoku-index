// Title: 30 Zombies In 20 Minutes
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=WA6HLN6QemY
// Source: https://app.crackingthecryptic.com/sudoku/nFHGGRm34m

// Normal sudoku (default 3x3 boxes -- the payload's `regions` array is just
// the plain box tiling). Five 3-cell Arrows, one per crossing row (1,3,5,7,9):
// the bulb is the first cell, the arm the other two ("digits along an arrow
// sum to the digit in that arrow's circle"). Two little-killer-style
// diagonals (labelled "30" and "20" outside the grid, matching the title)
// sum along the indicated diagonal.
//
// Each of rows 1,3,5,7,9 also draws two no-total "bank" cages flanking that
// row's arrow (the riddle's "banks on either side" of the "bridge"). Every
// cage cell lies inside a single row, so AllDifferent there is already
// implied by row uniqueness; included anyway as a faithful (if redundant)
// reading of the drawn cage boxes. The two single-cell bank cages (R1C9,
// R9C1) are omitted: a one-cell no-total cage adds no constraint.
//
// Sandwich ("total time after each crossing") clues: the five right-hand clue
// cells print only "-", never a number, so there is no literal target to
// build a fixed-sum `Sandwich` from. But the rules state exactly what each
// target *is*: "Rows 1,3,5,7,9 represent bridge crossings in order... People
// are represented by their crossing time. The sandwich clues to the right
// indicate the total time after each crossing." Each row's own arrow-bulb
// digit is that row's crossing time (the Arrow rule already forces the arm
// to sum to it), so the row's sandwich sum must equal the running total of
// the bulb digits from crossing 1 through that row's own crossing -- a
// relation between grid cells, not a missing constant. Encoded as one custom
// NFA per row: it reads that row's own bulb plus every earlier row's bulb
// (in crossing order), then scans the row's own 9 cells for the sandwich sum
// between the 1 and the 9, and accepts only when the two totals match. The
// state carries a single signed running difference (bulb total minus
// between-total so far, clamped at a -1 sink once it goes negative, since the
// between-total only decreases it) plus a 3-value scan stage (before/inside/
// after the two endpoints), so the compiled state count stays small
// regardless of row 9's 5-bulb prefix.
const sandwichSpec = (crossingCount) => NFA.encodeSpec({
  // remaining: bulb cells still to add into diff before the row scan starts.
  // diff: bulbTotalSoFar - betweenTotalSoFar (negative once impossible).
  // stage: 0 = before first endpoint, 1 = between endpoints, 2 = after both.
  startState: { remaining: crossingCount, diff: 0, stage: 0 },
  transition: ({ remaining, diff, stage }, value) => {
    if (remaining > 0) {
      return { remaining: remaining - 1, diff: diff + value, stage: 0 };
    }
    if (stage === 0) {
      return { remaining: 0, diff, stage: (value === 1 || value === 9) ? 1 : 0 };
    }
    if (stage === 1) {
      if (value === 1 || value === 9) return { remaining: 0, diff, stage: 2 };
      const next = diff - value;
      return { remaining: 0, diff: next < 0 ? -1 : next, stage: 1 };
    }
    return { remaining: 0, diff, stage: 2 };
  },
  accept: ({ diff, stage }) => stage === 2 && diff === 0,
  maxDepth: crossingCount + 9,
}, 9);

const crossingRows = [
  { bulb: 'R1C6', row: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'] },
  { bulb: 'R3C7', row: ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'] },
  { bulb: 'R5C4', row: ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'] },
  { bulb: 'R7C5', row: ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'] },
  { bulb: 'R9C2', row: ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'] },
];

const sandwichConstraints = crossingRows.map((r, i) => {
  const bulbs = crossingRows.slice(0, i + 1).map(c => c.bulb);
  return new NFA(
    sandwichSpec(bulbs.length), `sandwich-crossing-${i + 1}`,
    ...bulbs, ...r.row);
});

const geometry = cellGeometry(9);
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Arrow('R1C6', 'R1C7', 'R1C8'),
  new Arrow('R3C7', 'R3C6', 'R3C5'),
  new Arrow('R5C4', 'R5C5', 'R5C6'),
  new Arrow('R7C5', 'R7C4', 'R7C3'),
  new Arrow('R9C2', 'R9C3', 'R9C4'),

  LittleKiller.fromCells(30, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C6', 1, -1), geometry),

  new AllDifferent('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new AllDifferent('R3C1', 'R3C2', 'R3C3', 'R3C4'),
  new AllDifferent('R3C8', 'R3C9'),
  new AllDifferent('R5C1', 'R5C2', 'R5C3'),
  new AllDifferent('R5C7', 'R5C8', 'R5C9'),
  new AllDifferent('R7C1', 'R7C2'),
  new AllDifferent('R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new AllDifferent('R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),

  ...sandwichConstraints,
];
