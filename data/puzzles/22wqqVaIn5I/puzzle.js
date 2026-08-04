// Title: Advent Calendar
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=22wqqVaIn5I
// Source: https://app.crackingthecryptic.com/sudoku/h7GLR6J69b
//
// Normal sudoku, digits 0-8 (not 1-9). 24 hidden, undrawn cages partition
// (part of) the grid: 23 triominoes and 1 pentomino (which one is unknown),
// none overlapping. Each cage has a distinct total 1-24, printed as a red
// clue on one of its own cells -- so the clue's own numeral is both the
// cage's id and its required sum; the solver must discover each cage's
// shape. Digits may repeat inside a cage (no AllDifferent). A digit placed
// on one of the three central "snowball" cells (R5C4/R5C5/R5C6, the only
// drawn feature inside the central box) counts double toward its cage's
// total. Kropki dots are drawn positively only ("not all ... are given"):
// no negative constraint for undrawn edges.
//
// Two label overlays hold "which cage owns this cell" (0 = no cage), split
// because a single overlay caps at 16 states (MAX_SIZE) and there are 24
// cages + a "no cage" sentinel: VA carries cages with totals 1-15 at their
// own value, VB carries cages 16-24 remapped to 1-9 (value = total - 15).
// A cage's shape and size are never enumerated: ConnectedValues proves its
// cells are one connected region, ContainExact fixes the region to exactly
// 3 (or 5) cells of that label anywhere on the grid, and the marker cell is
// pinned into it by Given -- together these leave no cell free to carry a
// spurious extra copy of a cage's label, so "no cage" cells are forced to 0
// on both overlays without saying so directly (verified against small
// fixtures before use here).

const puzzleShape = new Shape('9x9', '0-15');
const graph = cellGraph('9x9');
const allCells = graph.cells();

// Real playable digits are 0-8; the rest of the 0-15 range that the widened
// Shape adds is auxiliary state for the two cage-label overlays below.
const digitDomain = graph.makeReplicate(
  new Given(allCells[0], 0, 1, 2, 3, 4, 5, 6, 7, 8));

// Cage clues: total (also the cage's id, 1-24, all distinct) and the grid
// cell carrying its red numeral, transcribed from the drawn red-text clues.
const cageClues = [
  { total: 19, marker: 'R1C1' }, { total: 3, marker: 'R1C3' },
  { total: 12, marker: 'R1C5' }, { total: 11, marker: 'R1C7' },
  { total: 13, marker: 'R1C9' },
  { total: 2, marker: 'R3C1' }, { total: 14, marker: 'R3C3' },
  { total: 20, marker: 'R3C5' }, { total: 5, marker: 'R3C7' },
  { total: 21, marker: 'R3C9' },
  { total: 16, marker: 'R5C1' }, { total: 17, marker: 'R5C3' },
  { total: 10, marker: 'R5C7' }, { total: 7, marker: 'R5C9' },
  { total: 18, marker: 'R7C1' }, { total: 23, marker: 'R7C3' },
  { total: 8, marker: 'R7C5' }, { total: 6, marker: 'R7C7' },
  { total: 4, marker: 'R7C9' },
  { total: 9, marker: 'R9C1' }, { total: 1, marker: 'R9C3' },
  { total: 15, marker: 'R9C5' }, { total: 22, marker: 'R9C7' },
  { total: 24, marker: 'R9C9' },
];

// The only drawn feature inside the central box (R4-6,C4-6): three plain
// circle underlays at R5C4/R5C5/R5C6 -- read as the rules' "large snowball"
// cells. A digit here counts double toward whichever cage claims the cell.
// Modelled by scanning each such cell's (label, digit) visit twice in every
// cage-sum NFA below, instead of a separate widened "doubled value" layer.
const snowballCells = ['R5C4', 'R5C5', 'R5C6'];

// VA: cages with totals 1-15, at their own value (0 = not one of these).
// VB: cages with totals 16-24, remapped to 1-9 (0 = not one of these).
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

function cageLayer(total) {
  return total <= 15
    ? { overlay: va, prefix: 'VA', labelValue: total }
    : { overlay: vb, prefix: 'VB', labelValue: total - 15 };
}

// VB only ever needs 0-9; without this it would carry 10-15 as spurious
// free state (nothing else constrains those values), which would multiply
// solutions found by the uniqueness search without meaning anything.
const vbDomain = vb.makeReplicate(
  new Given(vb.cells()[0], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9));

// A cell cannot belong to a group-A cage and a group-B cage at once.
const notBothKey = Pair.fnToKey((a, b) => a === 0 || b === 0, puzzleShape);
const layerExclusivity = allCells.map(cell =>
  new Pair(notBothKey, 'one cage layer per cell', va.at(cell), vb.at(cell)));

// One flag per cage: 3 = triomino, 5 = pentomino. Exactly one cage (unknown
// which) is the pentomino; ContainExact('5', ...) below pins that count to
// exactly one, so the other 23 are forced to 3 by the flags' own {3,5} domain.
const sizeFlags = new Var('Z', 'cage size (3 or 5 cells)', 24);
const sizeFlagDomain = sizeFlags.cells().map((cell, i) =>
  new Given(sizeFlags.cell(i + 1), 3, 5));
const exactlyOnePentomino = new ContainExact('5', ...sizeFlags.cells());

// Cage-sum NFA: scans (label, digit) pairs over every grid cell in fixed
// order, plus one extra repeat visit per snowball cell (so a snowball cell
// belonging to this cage is counted twice = doubled). `matches` remembers
// whether the label just read equals this cage's own label; the sum only
// grows on a digit symbol read right after a matching label, and is capped
// dead the moment it exceeds the target (sums never decrease, so that
// branch could never recover). Verified against accept/reject fixtures
// (including the doubling trick) before use here.
const cageVisits = [...allCells, ...snowballCells];
function cageSumNFA(labelValue, total) {
  return NFA.encodeSpec({
    startState: { phase: 0, matches: false, sum: 0 },
    transition({ phase, matches, sum }, value) {
      if (phase === 0) {
        return { phase: 1, matches: value === labelValue, sum };
      }
      const newSum = matches ? sum + value : sum;
      if (newSum > total) return [];
      return { phase: 0, matches: false, sum: newSum };
    },
    accept({ phase, sum }) {
      return phase === 0 && sum === total;
    },
  }, puzzleShape);
}

function cageConstraints({ total, marker }, index) {
  const { overlay, prefix, labelValue } = cageLayer(total);
  const sizeFlag = sizeFlags.cell(index + 1);
  const interleaved = cageVisits.flatMap(cell => [overlay.at(cell), cell]);
  return [
    new Given(overlay.at(marker), labelValue),
    new ConnectedValues(prefix, labelValue),
    new Or([
      new And([
        new Given(sizeFlag, 3),
        new ContainExact(Array(3).fill(labelValue).join('_'), ...overlay.cells()),
      ]),
      new And([
        new Given(sizeFlag, 5),
        new ContainExact(Array(5).fill(labelValue).join('_'), ...overlay.cells()),
      ]),
    ]),
    new NFA(cageSumNFA(labelValue, total), `cage ${total} sum`, ...interleaved),
  ];
}

// Dot clues, by shared edge, transcribed from the drawn edge marks (black
// fill = ratio, white fill with a black border = consecutive). "Not all
// ... are given" (rules text) means these are positive-only: no constraint
// for an undrawn edge.
const blackDotEdges = [
  ['R2C1', 'R2C2'], ['R7C1', 'R8C1'], ['R9C5', 'R9C6'], ['R6C2', 'R6C3'],
  ['R6C3', 'R6C4'], ['R3C4', 'R3C5'], ['R1C5', 'R1C6'], ['R7C8', 'R8C8'],
];
const whiteDotEdges = [
  ['R1C4', 'R2C4'], ['R1C6', 'R2C6'], ['R9C7', 'R9C8'], ['R3C2', 'R3C3'],
  ['R8C4', 'R8C5'],
];

return [
  puzzleShape,
  digitDomain,
  va.toVar('cage group A (totals 1-15)'),
  vb.toVar('cage group B (totals 16-24, -15)'),
  vbDomain,
  ...layerExclusivity,
  sizeFlags,
  ...sizeFlagDomain,
  exactlyOnePentomino,
  ...cageClues.flatMap(cageConstraints),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
];
