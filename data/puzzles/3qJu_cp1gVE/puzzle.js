// Title: Dynamic Nebula
// Author: gdc
// Video: https://www.youtube.com/watch?v=3qJu_cp1gVE
// Source: https://sudokupad.app/b1sckx3s0b

// Normal 9x9 sudoku rules apply and the grid starts empty.
// Spiral Galaxies: the grid divides into "galaxies" of orthogonally connected
// cells, each 180-degree rotationally symmetric about its own centre. All
// galaxy centres are marked with a square and every cell lies in exactly one
// galaxy. Digits do not repeat within a galaxy, and where the square carries a
// number the galaxy's digits sum to it; a square reading ">0" gives no total.
// A circled digit counts the cells of the galaxy containing it.
// Fog is solving UI -- it hides cells until they are deduced and places no
// condition on the finished grid -- so it is not encoded.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();

// The 26 drawn squares. `at` is the cells the square is painted on: one cell
// for a square in a cell's middle, and the two cells it straddles for a square
// on a shared edge -- so the square's own position is the midpoint of `at`.
// `sum` is the number written on the square, null where it reads ">0".
const squares = [
  { at: ['R1C1', 'R2C1'], sum: 4 },
  { at: ['R1C2', 'R1C3'], sum: null },
  { at: ['R1C5', 'R1C6'], sum: 10 },
  { at: ['R2C4'], sum: 21 },
  { at: ['R2C6'], sum: null },
  { at: ['R2C7'], sum: 39 },
  { at: ['R2C8', 'R3C8'], sum: 14 },
  { at: ['R3C1', 'R3C2'], sum: null },
  { at: ['R4C2', 'R4C3'], sum: 18 },
  { at: ['R4C7'], sum: null },
  { at: ['R4C8', 'R4C9'], sum: 35 },
  { at: ['R5C1'], sum: null },
  { at: ['R5C3', 'R5C4'], sum: 37 },
  { at: ['R5C5', 'R6C5'], sum: 29 },
  { at: ['R5C9'], sum: null },
  { at: ['R6C6'], sum: null },
  { at: ['R7C1', 'R7C2'], sum: null },
  { at: ['R7C3'], sum: null },
  { at: ['R7C6'], sum: null },
  { at: ['R7C8', 'R7C9'], sum: null },
  { at: ['R8C1', 'R9C1'], sum: 13 },
  { at: ['R8C3', 'R9C3'], sum: null },
  { at: ['R8C7', 'R9C7'], sum: null },
  { at: ['R8C9', 'R9C9'], sum: null },
  { at: ['R9C4'], sum: null },
  { at: ['R9C6'], sum: null },
];

// The 5 drawn circles.
const circles = ['R3C3', 'R3C5', 'R4C8', 'R6C2', 'R6C7'];

// --- galaxy shapes, derived from the squares -------------------------------
//
// The division itself is not drawn, so it is worked out here from the square
// positions and the stated galaxy geometry alone (symmetry about the square,
// orthogonal connectivity, one galaxy per square, every cell used exactly
// once). No digit clue takes part. The search below returns every division
// that satisfies that geometry; it returns exactly one, and the guard after it
// fails loudly if that ever stops holding, so the digit rules further down are
// applied to concrete regions.

const cellIndex = new Map(cells.map((cell, i) => [cell, i]));
const neighbours = cells.map(
  cell => graph.neighbours(cell).map(n => cellIndex.get(n)));

// min+max of the square's own rows/cols is twice the square's midpoint, so
// subtracting a cell's row/col from it reflects that cell through the square.
function reflector(at) {
  const points = at.map(parseCellId);
  const rows = points.map(p => p.row);
  const cols = points.map(p => p.col);
  const rowSum = Math.min(...rows) + Math.max(...rows);
  const colSum = Math.min(...cols) + Math.max(...cols);
  return (cell) => {
    const { row, col } = parseCellId(cell);
    const r = rowSum - row;
    const c = colSum - col;
    const inGrid = r >= 1 && r <= 9 && c >= 1 && c <= 9;
    return inGrid ? cellIndex.get(makeCellId(r, c)) : -1;
  };
}

// mirror[k][i] is cell i reflected through square k, or -1 if that lands
// outside the grid (which rules cell i out of galaxy k).
const mirror = squares.map(square => {
  const reflect = reflector(square.at);
  return cells.map(reflect);
});
// A galaxy contains its own centre, so the cells the square is painted on are
// pinned to it.
const anchors = squares.map(square => square.at.map(cell => cellIndex.get(cell)));

// `candidates[i]` is the set of squares whose galaxy could still own cell i.
// Both prunings below only ever discard an ownership that no legal division
// could have used, so a run that leaves every set a singleton has found a
// division, and one that empties a set has refuted the branch.
function propagate(candidates) {
  for (; ;) {
    let changed = false;
    for (let k = 0; k < squares.length; ++k) {
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
      // the square through cells that are themselves candidates for k.
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
  (cell, i) => new Set(squares.map((square, k) => k).filter(k => mirror[k][i] >= 0)));
anchors.forEach((cellIds, k) => cellIds.forEach(i => { start[i] = new Set([k]); }));

const divisions = [];
search(start, divisions, 2);
if (divisions.length !== 1) {
  throw new Error(
    `expected the squares to force one galaxy division, found ${divisions.length}`);
}
const owner = divisions[0];
const galaxies = squares.map((square, k) => cells.filter((cell, i) => owner[i] === k));

// --- digit rules over those galaxies ---------------------------------------

// A totalled square is a Cage (distinct and summing); an untotalled one keeps
// only the no-repeat half. Single-cell galaxies need neither.
const galaxyDigits = squares.flatMap((square, k) => {
  if (square.sum !== null) return [new Cage(square.sum, ...galaxies[k])];
  if (galaxies[k].length > 1) return [new AllDifferent(...galaxies[k])];
  return [];
});

const circleCounts = circles.map(
  cell => new Given(cell, galaxies[owner[cellIndex.get(cell)]].length));

return [
  shape,
  ...galaxyDigits,
  ...circleCounts,
];
