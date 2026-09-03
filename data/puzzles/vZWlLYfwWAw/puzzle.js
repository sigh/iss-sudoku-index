// Title: Trace Amounts
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=vZWlLYfwWAw
// Source: https://sudokupad.app/j8w1vml1mn

// Normal 6x6 sudoku: every row, column and 2-row-by-3-column box holds 1-6
// once. Two digits are given.
//
// The grid contains a set of non-overlapping cages, all with the same sum, and
// digits do not repeat inside a cage. The cages are only partially drawn: each
// drawn fragment is a single continuous run of one cage's outline that fades
// out at both ends. A fragment therefore reports two kinds of fact about that
// one cage -- the cells it runs alongside on the cage side of the border, and
// the cells it shuts out on the far side -- and says nothing about where that
// outline goes once the fragment has faded.
//
// Everything is encoded: the disjunction below runs over every cage layout the
// fragments allow, with the no-repeat and equal-sum rules applied inside each
// branch, so no cage layout is picked here.
//
// Two readings are committed to, both forced by what the fragments draw rather
// than assumed away:
//   * A cage is orthogonally connected. Nothing else bounds how far a cage may
//     reach, and each fragment is drawn as one connected run of outline.
//   * Only cages carrying a fragment are modelled. The rules put no floor on
//     how many cages the grid holds, so any extra cage may be dropped from a
//     legal set and leave it legal: dropping one keeps the remaining sums
//     equal, keeps them non-overlapping, and touches no fragment. The two
//     readings therefore admit exactly the same digits.

const graph = cellGraph('6x6');
const NUM_VALUES = 6;

// The seven drawn fragments, read off the fading dashed runs in the source.
// `inside` are cells on the cage side of the border the run draws; `outside`
// are the cells it separates off. A run that turns a corner pins the cell
// diagonally inside the turn too: at a re-entrant corner the outline can only
// wrap that way if the diagonal cell is in the cage (R3C4, fragment 2).
const TRACES = [
  // Down the grid's left edge, spanning R2 and R3.
  { inside: ['R2C1', 'R3C1'], outside: [] },
  // Up the C3|C4 border in R2, turning west along the R2|R3 border in C3.
  { inside: ['R2C4', 'R3C4', 'R3C3'], outside: ['R2C3'] },
  // Down the C4|C5 border, spanning R3 and R4.
  { inside: ['R3C4', 'R4C4'], outside: ['R3C5', 'R4C5'] },
  // East along the R3|R4 border in C6, turning down the C5|C6 border
  // through R4 and on into R5.
  { inside: ['R4C6', 'R5C6'], outside: ['R3C6', 'R4C5', 'R5C5'] },
  // Down the grid's left edge in R6, turning east along the grid's bottom
  // edge in C1.
  { inside: ['R6C1'], outside: [] },
  // East along the R5|R6 border, spanning C2 and C3.
  { inside: ['R6C2', 'R6C3'], outside: ['R5C2', 'R5C3'] },
  // East along the R5|R6 border, spanning C5 and C6.
  { inside: ['R6C5', 'R6C6'], outside: ['R5C5', 'R5C6'] },
];

const rowMajor = (cells) => graph.cells().filter(c => cells.has(c));
const union = (sets) => new Set(sets.flatMap(s => [...s]));
const meets = (a, b) => [...a].some(c => b.has(c));

// Fragments sharing a cell are fragments of the same cage, because cages do
// not overlap. Merge them into groups; a group is one cage's known content.
const groups = [];
for (const trace of TRACES) {
  const inside = new Set(trace.inside);
  const hit = groups.filter(g => meets(g.inside, inside));
  const merged = {
    inside: union([inside, ...hit.map(g => g.inside)]),
    outside: union([new Set(trace.outside), ...hit.map(g => g.outside)]),
  };
  groups.splice(0, groups.length, ...groups.filter(g => !hit.includes(g)), merged);
}

// Two groups are known to be different cages when one holds a cell the other's
// fragments shut out. Everything a different cage holds is then also shut out.
const distinct = groups.map(
  g => groups.filter(h => h !== g && (meets(g.inside, h.outside) || meets(h.inside, g.outside))));
const excluded = groups.map(
  (g, i) => union([g.outside, ...distinct[i].map(h => h.inside)]));

// Cage size and total are bounded by the rules, not by the drawing: k distinct
// digits from 1-6 total at least 1+..+k and at most 6+..+(7-k).
const minTotal = (k) => k * (k + 1) / 2;
const maxTotal = (k) => k * (2 * NUM_VALUES - k + 1) / 2;

// A group whose every neighbour is already shut out is a whole cage, so its
// size caps the shared total, which in turn caps every cage's size.
const closedSizes = groups
  .filter((g, i) => [...g.inside].every(
    c => graph.neighbours(c).every(n => g.inside.has(n) || excluded[i].has(n))))
  .map(g => g.inside.size);
const maxCageTotal = Math.min(maxTotal(NUM_VALUES), ...closedSizes.map(maxTotal));
const maxCageSize = [...Array(NUM_VALUES).keys()]
  .map(i => i + 1).filter(k => minTotal(k) <= maxCageTotal).pop();

// Every connected cage of at most maxCageSize cells that contains `core` and
// avoids `banned`, grown one cell at a time from the core's frontier.
const cageOptions = (core, banned) => {
  const seen = new Set();
  const found = [];
  const visit = (cells) => {
    const id = rowMajor(cells).join('~');
    if (seen.has(id)) return;
    seen.add(id);
    found.push(rowMajor(cells));
    if (cells.size >= maxCageSize) return;
    for (const c of cells) {
      for (const n of graph.neighbours(c)) {
        if (!cells.has(n) && !banned.has(n)) visit(new Set([...cells, n]));
      }
    }
  };
  // A disconnected core cannot be one connected cage.
  const reached = new Set([[...core][0]]);
  for (const c of reached) {
    for (const n of graph.neighbours(c)) if (core.has(n)) reached.add(n);
  }
  if (reached.size === core.size) visit(core);
  return found;
};

// Group the fragments' groups into cages every way the drawing allows, then
// give each resulting cage every cell set it could be.
const partitions = (items) => {
  if (!items.length) return [[]];
  const [first, ...rest] = items;
  return partitions(rest).flatMap(
    p => [[[first], ...p], ...p.map((blk, i) => p.map((b, j) => j === i ? [first, ...b] : b))]);
};

const layouts = [];
for (const partition of partitions(groups.map((g, i) => i))) {
  const blocks = partition.map(blk => ({
    core: union(blk.map(i => groups[i].inside)),
    banned: union(blk.map(i => groups[i].outside)),
    split: blk.some(i => blk.some(j => distinct[i].includes(groups[j]))),
  }));
  if (blocks.some(b => b.split || b.core.size > maxCageSize || meets(b.core, b.banned))) continue;
  const options = blocks.map(b => cageOptions(b.core, b.banned));
  const extend = (i, used, chosen) => {
    if (i === options.length) return layouts.push(chosen);
    for (const cage of options[i]) {
      if (cage.some(c => used.has(c))) continue;
      extend(i + 1, new Set([...used, ...cage]), [...chosen, cage]);
    }
  };
  extend(0, new Set(), []);
}

return [
  new Shape('6x6'),

  new Given('R1C1', 4),
  new Given('R5C5', 6),

  // One branch per allowed layout: no repeats within each cage (a 0 total on
  // Cage means "no total given"), and one shared total across them all.
  new Or(layouts.map(layout => new And([
    ...layout.map(cage => new Cage(0, ...cage)),
    new EqualSum(...layout),
  ]))),
];
