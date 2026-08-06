// Title: Galactic Skirmish
// Author: AnalyticalNinja & Clocksmith
// Video: https://www.youtube.com/watch?v=8SIWtnp0kIU
// Source: https://app.crackingthecryptic.com/sudoku/m7Grm47T9H

// Normal sudoku rules apply. 18 dots mark the 180-degree rotational-symmetry
// centres of "galaxies" of orthogonally connected cells that partition the
// whole grid, one galaxy per dot. Each row, column, and 3x3 box holds exactly
// 2 stars, every galaxy holds exactly 1 star, and no two stars are a king's
// move apart. Digits cannot repeat within a galaxy; a galaxy carrying a
// number clue sums to it, excluding the star cell's own digit.
//
// The galaxy division itself is not drawn -- only the 18 dot positions and
// 14 sum clues are. It is derived below from geometry alone: a galaxy
// contains the cell(s) its own dot touches, is orthogonally connected, is
// 180-degree symmetric about its dot, and the 18 galaxies cover the grid.
// That geometry alone (no digit or star information) is checked below to
// force a unique division -- the same genre convention and search shape as
// 3qJu_cp1gVE (Dynamic Nebula).

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const cells = graph.cells();
const cellIndex = new Map(cells.map((cell, i) => [cell, i]));
const neighbours = cells.map(
  cell => graph.neighbours(cell).map(n => cellIndex.get(n)));

// The 18 dot centres, transcribed from the drawn overlay circles
// (`overlays[0..17].center` in the source payload; [row, col], continuous,
// 0-indexed).
const dotCenters = [
  [2.5, 0.5], [2, 2], [0.5, 3], [1, 5.5], [2.5, 4.5], [0.5, 7.5], [2.5, 7],
  [2.5, 8.5], [5.5, 8], [5, 5.5], [5, 3], [5, 1], [7, 1.5], [8, 2.5],
  [8.5, 4.5], [6.5, 6], [8, 7], [8, 8.5],
];

// A dot sitting at a cell centre, an edge midpoint, or a corner touches 1, 2,
// or 4 cells respectively; that touched set is always inside its own galaxy
// (a galaxy contains its own symmetry centre), anchoring the search below.
function touchedCells([rowVal, colVal]) {
  const rowFrac = rowVal % 1 !== 0;
  const colFrac = colVal % 1 !== 0;
  if (rowFrac && colFrac) {
    return [makeCellId(Math.floor(rowVal) + 1, Math.floor(colVal) + 1)];
  }
  if (!rowFrac && colFrac) {
    const c = Math.floor(colVal) + 1;
    return [makeCellId(rowVal, c), makeCellId(rowVal + 1, c)];
  }
  if (rowFrac && !colFrac) {
    const r = Math.floor(rowVal) + 1;
    return [makeCellId(r, colVal), makeCellId(r, colVal + 1)];
  }
  return [
    makeCellId(rowVal, colVal), makeCellId(rowVal, colVal + 1),
    makeCellId(rowVal + 1, colVal), makeCellId(rowVal + 1, colVal + 1),
  ];
}
const dots = dotCenters.map(center => ({ center, anchor: touchedCells(center) }));

// Reflecting a cell 180 degrees about a dot: the touched-cell min+max row/col
// is twice the dot's own row/col, so subtracting a cell's row/col from that
// reflects it through the dot.
function reflector(center) {
  const twiceRow = 2 * center[0] + 1;
  const twiceCol = 2 * center[1] + 1;
  return (cell) => {
    const { row, col } = parseCellId(cell);
    const r = twiceRow - row, c = twiceCol - col;
    if (r < 1 || r > 9 || c < 1 || c > 9) return -1;
    return cellIndex.get(makeCellId(r, c));
  };
}

// mirror[k][i]: cell i reflected through dot k's centre, or -1 off-grid
// (which rules cell i out of galaxy k).
const mirror = dots.map(dot => {
  const reflect = reflector(dot.center);
  return cells.map(reflect);
});
const anchors = dots.map(dot => dot.anchor.map(cell => cellIndex.get(cell)));

// `candidates[i]` is the set of dots whose galaxy could still own cell i. Both
// prunings below only ever discard an ownership that no legal division could
// have used, so a run that leaves every set a singleton has found a division,
// and one that empties a set has refuted the branch. (Same shape as the
// validated search in 3qJu_cp1gVE.)
function propagate(candidates) {
  for (; ;) {
    let changed = false;
    for (let k = 0; k < dots.length; ++k) {
      // Symmetry: cell i can belong to galaxy k only if its mirror image does.
      for (let i = 0; i < candidates.length; ++i) {
        if (!candidates[i].has(k)) continue;
        const m = mirror[k][i];
        if (m < 0 || !candidates[m].has(k)) {
          candidates[i].delete(k);
          changed = true;
        }
      }
      // Connectivity: cell i can belong to galaxy k only if it still reaches
      // the dot through cells that are themselves candidates for k.
      if (anchors[k].some(i => !candidates[i].has(k))) return false;
      const queue = [...anchors[k]];
      const seen = new Set(queue);
      for (let q = 0; q < queue.length; ++q) {
        for (const n of neighbours[queue[q]]) {
          if (candidates[n].has(k) && !seen.has(n)) {
            seen.add(n);
            queue.push(n);
          }
        }
      }
      for (let i = 0; i < candidates.length; ++i) {
        if (candidates[i].has(k) && !seen.has(i)) {
          candidates[i].delete(k);
          changed = true;
        }
      }
    }
    if (candidates.some(set => set.size === 0)) return false;
    if (!changed) return true;
  }
}

function search(candidates, found, limit) {
  if (found.length >= limit || !propagate(candidates)) return;
  let pick = -1;
  for (let i = 0; i < candidates.length; ++i) {
    if (candidates[i].size > 1 &&
      (pick < 0 || candidates[i].size < candidates[pick].size)) pick = i;
  }
  if (pick < 0) {
    found.push(candidates.map(set => [...set][0]));
    return;
  }
  for (const k of candidates[pick]) {
    const branch = candidates.map(set => new Set(set));
    branch[pick] = new Set([k]);
    search(branch, found, limit);
  }
}

const start = cells.map(
  (cell, i) => new Set(dots.map((d, k) => k).filter(k => mirror[k][i] >= 0)));
anchors.forEach((idxs, k) => idxs.forEach(i => { start[i] = new Set([k]); }));

const divisions = [];
search(start, divisions, 2);
if (divisions.length !== 1) {
  throw new Error(
    `expected the 18 dots to force one galaxy division, found ${divisions.length}`);
}
const owner = divisions[0];
const galaxies = dots.map((dot, k) => cells.filter((cell, i) => owner[i] === k));

// --- clues over those galaxies ---------------------------------------------

// The 14 drawn number clues (`overlays[18..31]` in the source payload), one
// cell each; each clue belongs to whichever computed galaxy contains its cell.
const sumClues = [
  ['R2C1', 16], ['R7C3', 16], ['R2C6', 6], ['R2C8', 28], ['R4C9', 30],
  ['R5C7', 15], ['R4C6', 37], ['R4C4', 29], ['R5C3', 22], ['R6C1', 30],
  ['R7C5', 31], ['R8C8', 23], ['R9C6', 9], ['R9C1', 22],
];
function galaxyOf(cell) {
  const k = galaxies.findIndex(g => g.includes(cell));
  if (k < 0) throw new Error(`cell ${cell} not covered by any computed galaxy`);
  return k;
}
const sumByGalaxy = new Map(sumClues.map(([cell, sum]) => [galaxyOf(cell), sum]));
if (sumByGalaxy.size !== sumClues.length) {
  throw new Error('two number clues landed in the same computed galaxy');
}

// "Digits can't repeat within a galaxy": AllDifferent over every multi-cell
// galaxy; a single-cell galaxy needs no separate rule.
const galaxyAllDifferent = galaxies
  .filter(g => g.length > 1)
  .map(g => new AllDifferent(...g));

// --- stars -------------------------------------------------------------

const NOT_STAR = 1, STAR = 2;
const stars = graph.makeOverlay('VS');
// Every star-flag cell shares the same {NOT_STAR, STAR} domain: one Given
// template, replicated over the whole overlay.
const starDomain = stars.makeReplicate(
  new Given(stars.cells()[0], NOT_STAR, STAR));

// Exactly 2 stars per row/column/box, exactly 1 per galaxy.
const starCounts = [
  ...stars.rows().map(row => new ContainExact('2_2', ...row)),
  ...stars.columns().map(col => new ContainExact('2_2', ...col)),
  ...stars.boxes().map(box => new ContainExact('2_2', ...box)),
  ...galaxies.map(g => new ContainExact('2', ...stars.at(g))),
];

// No two stars a king's move apart: one Pair template per relative offset
// (the 4 offsets below cover every unordered king-move pair once),
// replicated over every cell for which that offset stays on the grid.
const notBothStarKey = Pair.fnToKey(
  (a, b) => !(a === STAR && b === STAR), geometry);
// graph.step(cell, dr, dc) is the native helper for one fixed offset
// direction; kingNeighbours() returns all 8 directions at once and cannot be
// grouped by offset for Replicate below. And the overlay's own convenience
// replicate helper always anchors at the overlay's first cell, which cannot
// serve as the template's own-offset anchor here, so Replicate is
// constructed directly below instead.
const KING_OFFSETS = [[0, 1], [1, -1], [1, 0], [1, 1]];
const kingNoTwoStars = KING_OFFSETS.map(([dr, dc]) => {
  const originsGrid = cells.filter(cell => graph.step(cell, dr, dc) !== null);
  const originsVar = stars.at(originsGrid);
  const targetGrid = graph.step(originsGrid[0], dr, dc);
  const template = new Pair(
    notBothStarKey, '', stars.at(originsGrid[0]), stars.at(targetGrid));
  return new Replicate(
    [template],
    Replicate.encodeTargetCells(originsVar, originsVar[0], stars),
    originsVar[0]);
});

// Galaxy sum, excluding the star cell's digit: an NFA scans a galaxy's cells
// as interleaved (digit, star-flag) pairs and accumulates the digit only when
// the flag reads NOT_STAR, rejecting as soon as the running sum would exceed
// the target (sums only ever increase, so that branch can never recover).
function galaxySumMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { phase: 'flag', sum: state.sum, digit: value };
      }
      const sum = state.sum + (value === NOT_STAR ? state.digit : 0);
      if (sum > target) return undefined;
      return { phase: 'digit', sum };
    },
    accept: state => state.phase === 'digit' && state.sum === target,
  }, geometry.numValues);
}
const galaxySums = [...sumByGalaxy.entries()].map(([k, target]) => {
  const stream = galaxies[k].flatMap(cell => [cell, stars.at(cell)]);
  return new NFA(galaxySumMachine(target), 'galaxy-sum-excl-star', ...stream);
});

return [
  shape,
  stars.toVar('stars'),
  starDomain,
  ...starCounts,
  ...kingNoTwoStars,
  ...galaxyAllDifferent,
  ...galaxySums,
];
