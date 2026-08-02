// Title: Is Zipper A Zodiac Sign?
// Author: gdc
// Video: https://www.youtube.com/watch?v=qeNYQBZ5TGE
// Source: https://sudokupad.app/urcfy6f7yx

// Normal 9x9 sudoku rules apply. The grid divides into galaxies: orthogonally
// connected groups of cells with 180 degree rotational symmetry about their
// centres, each centre marked by one large circle. Every cell is in exactly one
// galaxy, galaxies do not overlap, and digits may not repeat in a galaxy. A
// number orbiting a centre is the sum of all digits in that galaxy. A "Z"
// orbiting a centre marks a zipper galaxy, where each digit and the cell
// rotationally opposite to it sum to the circled digit.
//
// Fog of war and the FOGLIGHT cage govern what is revealed while solving; they
// place no rule on the completed grid and are not encoded.
//
// The galaxy outlines are not drawn, so the division is part of the solve. The
// script enumerates every division the centres, symmetry, connectivity and
// complete coverage allow, then returns the disjunction over all of them, so no
// division is picked out of band.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const cellIndex = new Map(cells.map((cell, i) => [cell, i]));
const neighbours = cells.map(cell => graph.neighbours(cell).map(n => cellIndex.get(n)));

// Transcribed from the large circles and the small circles orbiting them.
// `at` is the cell under a cell-centred circle, or the two cells straddled by an
// edge-centred circle. `sum` is the orbiting number, or null where none is
// printed; `zipper` marks the six centres whose orbiting circle holds a "Z"
// (drawn in purple, unlike the plain grey centres).
const centres = [
  { at: ['R1C6'], sum: null },
  { at: ['R1C2', 'R2C2'], sum: 14 },
  { at: ['R2C5'], sum: null },
  { at: ['R2C7'], sum: null },
  { at: ['R3C3'], sum: 45, zipper: true },
  { at: ['R4C1'], sum: 35 },
  { at: ['R4C5'], sum: 24, zipper: true },
  { at: ['R4C9'], sum: null, zipper: true },
  { at: ['R5C5'], sum: 12, zipper: true },
  { at: ['R5C8'], sum: 28, zipper: true },
  { at: ['R6C6'], sum: 15, zipper: true },
  { at: ['R7C1', 'R7C2'], sum: null },
  { at: ['R7C3'], sum: 35 },
  { at: ['R8C5'], sum: 25 },
  { at: ['R8C7'], sum: null },
  { at: ['R8C8', 'R8C9'], sum: null },
  { at: ['R9C3'], sum: null },
  { at: ['R9C9'], sum: null },
];

// Rotation by 180 degrees about a centre. An edge-centred circle sits on the
// midpoint of its two cells, so the reflected coordinates stay integral either
// way. Returns -1 when the image leaves the grid, which bars the cell from that
// galaxy.
function reflector(at) {
  const points = at.map(parseCellId);
  const rowSum = Math.min(...points.map(p => p.row)) + Math.max(...points.map(p => p.row));
  const colSum = Math.min(...points.map(p => p.col)) + Math.max(...points.map(p => p.col));
  return cell => {
    const { row, col } = parseCellId(cell);
    const r = rowSum - row;
    const c = colSum - col;
    return r >= 1 && r <= 9 && c >= 1 && c <= 9 ? cellIndex.get(makeCellId(r, c)) : -1;
  };
}

const mirror = centres.map(centre => {
  const reflect = reflector(centre.at);
  return cells.map(reflect);
});
const anchors = centres.map(centre => centre.at.map(cell => cellIndex.get(cell)));

// Candidate-set narrowing for the division search. It uses only the geometry
// rules -- symmetry about the marked centre, orthogonal connectivity back to
// that centre, and every cell landing in some galaxy -- and never a digit clue,
// so the enumeration below cannot be biased by the numbers.
function propagate(candidates) {
  for (;;) {
    let changed = false;
    for (let k = 0; k < centres.length; ++k) {
      for (let i = 0; i < candidates.length; ++i) {
        if (!candidates[i].has(k)) continue;
        const m = mirror[k][i];
        if (m < 0 || !candidates[m].has(k)) {
          candidates[i].delete(k);
          changed = true;
        }
      }
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
    if (candidates[i].size > 1 && (pick < 0 || candidates[i].size < candidates[pick].size)) pick = i;
  }
  // Every cell is down to one owner, and propagate() has just re-checked
  // symmetry and connectivity against those singletons, so this is a legal
  // division.
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

const start = cells.map((cell, i) => new Set(centres.map((centre, k) => k).filter(k => mirror[k][i] >= 0)));
anchors.forEach((ids, k) => ids.forEach(i => { start[i] = new Set([k]); }));
const divisions = [];
// The cap only guards against an unbounded search; hitting it would mean legal
// divisions were dropped and the disjunction below is no longer the whole rule.
const DIVISION_LIMIT = 64;
search(start, divisions, DIVISION_LIMIT);
if (divisions.length === 0 || divisions.length >= DIVISION_LIMIT) {
  throw new Error(`galaxy enumeration produced ${divisions.length} divisions`);
}

function divisionRules(owner) {
  const galaxies = centres.map((centre, k) => cells.filter((cell, i) => owner[i] === k));
  // Cage already forbids repeats, so a galaxy with a printed total needs no
  // separate all-different.
  const galaxyDigits = centres.flatMap((centre, k) => {
    if (centre.sum !== null) return [new Cage(centre.sum, ...galaxies[k])];
    return galaxies[k].length > 1 ? [new AllDifferent(...galaxies[k])] : [];
  });
  // Every zipper centre is cell-centred, so its galaxy has odd size: the centre
  // cell plus rotational pairs. Laying the pairs out as one line with the centre
  // cell in the middle makes Zipper's "for odd length lines, the centre digit is
  // the sum" read each pair against the circled digit.
  const zippers = centres.flatMap((centre, k) => {
    if (!centre.zipper) return [];
    const centreIndex = cellIndex.get(centre.at[0]);
    const left = galaxies[k].map(cellIndex.get.bind(cellIndex)).filter(i => i < mirror[k][i]);
    const right = [...left].reverse().map(i => cells[mirror[k][i]]);
    return [new Zipper(...left.map(i => cells[i]), cells[centreIndex], ...right)];
  });
  return [...galaxyDigits, ...zippers];
}

return [shape, new Or(divisions.map(division => new And(divisionRules(division))))];
