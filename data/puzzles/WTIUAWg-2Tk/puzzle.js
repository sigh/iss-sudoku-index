// Title: My Favorite Song
// Author: theasylm
// Video: https://www.youtube.com/watch?v=WTIUAWg-2Tk
// Source: https://sudokupad.app/9wm6ctm2hv

// Rules encoded here:
//   - Normal sudoku (no givens).
//   - Thermometer: digits strictly increase from the bulb in R9C1.
//   - Japanese sums: each cell is either unshaded or shaded one of nine
//     colours. The badges outside a row/column list, in order, the runs of
//     contiguous cells shaded that colour, each badge giving the run's digit
//     sum. Runs of the same colour need an unshaded cell between them; runs of
//     different colours may touch. All shaded runs are given.
// Not a constraint: "remove all unshaded markings once complete, then read the
// song title hidden vertically in the grid" is a presentation note about the
// finished colouring, not a condition on the digits.

const COLOURS = 'PBWGDROAK';  // Purple, Blue, broWn, Green, golD, Red, Orange, grAy, blacK
const UNSHADED = 10;          // one code past the nine colours

// Outside badges, transcribed from the coloured clue squares drawn beside the
// grid; each entry is "<sum><colour letter>". Listed in reading order along the
// line: left-to-right for a row, top-to-bottom for a column, so the badge
// furthest from the grid is the first run.
//
// That direction is fixed by the badges themselves, not chosen. Each line's
// colour set restricts where a colour may sit: rows 4-6 use only {G,D,K,W} and
// column 8 is the only line using K, so row 4's black run lies in R4C8, while D
// appears only in columns 4-6 and G only in columns 1-3. Row 4's badges are
// 9G, 20D, 5K, 8W; taking them from the badge nearest the grid instead would
// demand a D run to the right of column 8, which no column admits.
const ROW_BADGES = [
  '11R 9O 1A 11W',    // R1
  '1R 5A 13W',        // R2
  '19R 18W',          // R3
  '9G 20D 5K 8W',     // R4
  '7G 3D 8D 8W',      // R5
  '9G 13D 8W',        // R6
  '24P 1B 2B 10W',    // R7
  '15P 17B 5W',       // R8
  '6P 4B 5B 24W',     // R9
];
const COL_BADGES = [
  '5R 9R 2G 14P',     // C1
  '8R 22G 15P',       // C2
  '2R 7R 1G 16P',     // C3
  '12D 14B',          // C4
  '9O 2W 4D 5D 8B',   // C5
  '4A 4W 23D 2B 5B',  // C6
  '2A 6W 8W',         // C7
  '13W 5K 27W',       // C8
  '45W',              // C9
];

const parseBadges = text => text.split(' ').map(badge => ({
  total: parseInt(badge, 10),
  shade: COLOURS.indexOf(badge.slice(-1)) + 1,
}));

const shape = new Shape('9x9', UNSHADED);
const graph = cellGraph(shape);
const shading = graph.makeOverlay('VS');

// One machine per line, scanning shade, digit, shade, digit, ... so each cell's
// shade is read just before the digit it contributes.
//   done  - runs of this line's badge list already completed
//   sum   - partial total of the run currently open (0 when none is open)
//   gap   - an unshaded cell has been seen since the last run closed
//   inRun - null while a shade cell is expected; on a digit cell it says
//           whether that cell belongs to the open run
// A branch dies as soon as the scan departs from the badge list: a shade that
// is not the next expected colour, a run interrupted before reaching its total,
// a run overshooting it, or two same-coloured runs meeting with no unshaded cell
// between them. Accepting only with every run closed is "all shaded runs are
// given" - any extra or missing run leaves the machine mid-list.
function japaneseSums(badges) {
  const runs = parseBadges(badges);
  return NFA.encodeSpec({
    startState: { done: 0, sum: 0, gap: true, inRun: null },
    transition: (s, v) => {
      if (s.inRun === null) {
        if (v === UNSHADED) {
          if (s.sum > 0) return undefined;
          return { done: s.done, sum: 0, gap: true, inRun: false };
        }
        if (s.done === runs.length) return undefined;
        if (v !== runs[s.done].shade) return undefined;
        const starting = s.sum === 0;
        if (starting && s.done > 0 && runs[s.done - 1].shade === v && !s.gap) {
          return undefined;
        }
        return { done: s.done, sum: s.sum, gap: s.gap, inRun: true };
      }
      if (!s.inRun) return { done: s.done, sum: s.sum, gap: s.gap, inRun: null };
      const sum = s.sum + v;
      const total = runs[s.done].total;
      if (sum > total) return undefined;
      if (sum === total) return { done: s.done + 1, sum: 0, gap: false, inRun: null };
      return { done: s.done, sum, gap: s.gap, inRun: null };
    },
    accept: s => s.inRun === null && s.sum === 0 && s.done === runs.length,
  }, shape);
}

const scan = cells => cells.flatMap(cell => [shading.at(cell), cell]);

return [
  shape,
  shading.toVar('shading'),
  // The widened alphabet exists only to give the shading overlay its tenth
  // state; playable cells keep the digits 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  new Thermo('R9C1', 'R9C2', 'R9C3', 'R8C3', 'R8C2', 'R8C1', 'R7C1', 'R7C2', 'R7C3'),

  ...ROW_BADGES.map((badges, i) =>
    new NFA(japaneseSums(badges), `japanese sums R${i + 1}`, ...scan(graph.row(i + 1)))),
  ...COL_BADGES.map((badges, i) =>
    new NFA(japaneseSums(badges), `japanese sums C${i + 1}`, ...scan(graph.column(i + 1)))),
];
