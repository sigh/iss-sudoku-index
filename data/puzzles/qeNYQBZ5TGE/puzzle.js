// Title: Is Zipper A Zodiac Sign?
// Author: gdc
// Video: https://www.youtube.com/watch?v=qeNYQBZ5TGE
// Source: https://sudokupad.app/urcfy6f7yx

// Normal 9x9 sudoku rules apply. The grid divides into orthogonally connected,
// 180-degree symmetric galaxies, one for each large circled centre below; every
// cell belongs to one galaxy and digits do not repeat within a galaxy. Numbered
// centres give their galaxy's digit sum. Purple centres marked Z are zipper
// galaxies: opposite cells sum to the centre digit. Fog and FOGLIGHT are UI-only
// reveal data and impose no completed-grid rule.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const cellIndex = new Map(cells.map((cell, i) => [cell, i]));
const neighbours = cells.map(cell => graph.neighbours(cell).map(n => cellIndex.get(n)));

// Transcribed from the large circles. `at` is the cell under a cell-centred
// circle, or the two cells straddled by an edge-centred circle. Purple Z centres
// additionally carry zipper: true; `sum` is null when no total is printed.
const centres = [
  { at: ['R1C6'], sum: null },
  { at: ['R1C2', 'R2C2'], sum: null },
  { at: ['R2C5'], sum: null },
  { at: ['R2C7'], sum: null },
  { at: ['R3C3'], sum: 45, zipper: true },
  { at: ['R4C1'], sum: null },
  { at: ['R4C5'], sum: 24, zipper: true },
  { at: ['R4C9'], sum: null, zipper: true },
  { at: ['R5C5'], sum: 12, zipper: true },
  { at: ['R5C8'], sum: 28, zipper: true },
  { at: ['R6C6'], sum: 15, zipper: true },
  { at: ['R7C1', 'R7C2'], sum: null },
  { at: ['R7C3'], sum: null },
  { at: ['R8C5'], sum: null },
  { at: ['R8C7'], sum: null },
  { at: ['R8C8', 'R8C9'], sum: null },
  { at: ['R9C3'], sum: null },
  { at: ['R9C9'], sum: null },
];

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

// The galaxy outlines are not drawn. This search uses only the marked centres,
// rotational symmetry, connectivity, and the complete-cover rule; digit clues
// do not participate. It finds the two geometry-legal divisions, so the final
// encoding keeps both readings as an explicit disjunction.
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
search(start, divisions, 3);
if (divisions.length !== 2) throw new Error(`expected two galaxy divisions, found ${divisions.length}`);

function divisionRules(owner) {
  const galaxies = centres.map((centre, k) => cells.filter((cell, i) => owner[i] === k));
  const galaxyDigits = centres.flatMap((centre, k) => {
    if (centre.sum !== null) return [new Cage(centre.sum, ...galaxies[k])];
    return galaxies[k].length > 1 ? [new AllDifferent(...galaxies[k])] : [];
  });
  // A zipper centre is cell-centred. Pair each cell with its rotational image
  // and arrange the pairs around that centre, with its centre cell in the middle.
  const zippers = centres.flatMap((centre, k) => {
    if (!centre.zipper) return [];
    const centreIndex = cellIndex.get(centre.at[0]);
    const left = galaxies[k].map(cellIndex.get.bind(cellIndex)).filter(i => i < mirror[k][i]);
    return [new Zipper(...left.map(i => cells[i]), cells[centreIndex], ...left.reverse().map(i => cells[mirror[k][i]]))];
  });
  return [...galaxyDigits, ...zippers];
}

return [shape, new Or(divisions.map(division => new And(divisionRules(division))))];
