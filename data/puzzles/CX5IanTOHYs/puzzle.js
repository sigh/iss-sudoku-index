// Title: Little Killer Counting
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=CX5IanTOHYs
// Source: https://sudokupad.app/bha9cza16q

// Normal 6x6 sudoku rules apply -- the default Shape('6x6') boxes are the
// drawn 2x3 regions, so no Jigsaw/RegionSize is needed.
//
// Seven little-killer diagonals, each running from an edge cell to the far
// grid edge along the drawn arrow direction. Three carry a visible given sum;
// the other four have an invisible (white-on-white) clue badge in the source
// -- no sum, per "if one is given".
//
// Self-referential rule: for every digit d that appears anywhere along any of
// the 7 diagonals, exactly d of those 7 diagonals contain at least one d (the
// rule's own worked example). A digit that never appears on a diagonal is
// left unconstrained by this rule. One NFA per digit 1-6 scans all 7
// diagonals as separate segments and counts, per segment, whether that digit
// was seen at least once; `accept` requires the resulting count across
// segments to be either 0 (digit never seen on any diagonal) or exactly equal
// to the digit itself.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

// Diagonals (origin cell first), per the drawn arrow direction -- up-left for
// the six arrows anchored on the bottom/right edges, up-right for the one
// anchored on the left edge. Comment gives the paired underlay clue text.
const diagonals = [
  graph.ray('R6C2', -1, -1), // underlay "?" (blank): no given sum
  graph.ray('R6C3', -1, -1), // underlay "8"
  graph.ray('R5C6', -1, -1), // underlay "?" (blank): no given sum
  graph.ray('R4C6', -1, -1), // underlay "?" (blank): no given sum
  graph.ray('R3C6', -1, -1), // underlay "9"
  graph.ray('R2C6', -1, -1), // underlay "7"
  graph.ray('R2C1', -1, 1),  // underlay "?" (blank): no given sum
];

const givenSums = [null, 8, null, null, 9, 7, null];

const littleKillers = diagonals
  .map((cells, i) => [cells, givenSums[i]])
  .filter(([, sum]) => sum !== null)
  .map(([cells, sum]) => LittleKiller.fromCells(sum, cells, geometry));

// For a fixed digit t: state {count, seenInSegment}. `count` increments once
// per segment (diagonal) the first time t is seen in it, clamped at t+1 (a
// sink meaning "already too many diagonals contain t"). `seenInSegment`
// resets at each SEGMENT_BREAK (one break between each pair of diagonals).
const digitCountSpec = (t) => NFA.encodeSpec({
  startState: { count: 0, seenInSegment: false },
  transition: ({ count, seenInSegment }, value) => {
    if (value === SEGMENT_BREAK) return { count, seenInSegment: false };
    if (value === t && !seenInSegment) {
      return { count: Math.min(count + 1, t + 1), seenInSegment: true };
    }
    return { count, seenInSegment };
  },
  accept: ({ count }) => count === 0 || count === t,
}, 6, { multiSegment: true });

const digitCounters = [1, 2, 3, 4, 5, 6].map(
  t => new NFA(digitCountSpec(t), `count-${t}`, ...diagonals));

return [
  new Shape('6x6'),
  ...littleKillers,
  ...digitCounters,
];
