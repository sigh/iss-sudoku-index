// Title: The Omen
// Author: Stephane Bura
// Video: https://www.youtube.com/watch?v=9LikcBUb9iw
// Source: https://cracking-the-cryptic.web.app/sudoku/nQF4rm9m9N

// Normal sudoku rules apply.
// Some cells carry short compass-direction arrow stubs, drawn in grey or red.
// Reading: if such a cell's digit is N, then for every arrow drawn from it,
// walk N cells outward in that arrow's direction (starting with the
// immediate neighbour, excluding the origin cell) and sum those N digits.
// Every arrow of the same colour at that cell must produce the same sum
// (this is checked pairwise against one representative arrow of that
// colour). At a cell carrying both colours, the shared grey sum and the
// shared red sum must differ from each other. "All the possible arrows are
// present" is read as a completeness disclaimer -- every arrow that matters
// is drawn -- not as a rule that every compass direction is always shown.
// This is encoded as a disjunction over the cell's own digit N (bounded by
// how far each of its arrows can actually reach before the grid edge),
// with the same-colour sums tied by a plain linear Sum and the cross-colour
// difference enumerated as a disjunction of the (bounded, small) integer
// gaps the two sums could differ by.

// Arrow directions + colours transcribed from the drawn stub endpoints
// (each arrow is a short segment from the cell centre; its direction was
// read off by snapping to the 8 compass headings).
const ARROWS = {
  R1C3: [['D', 'grey'], ['DR', 'grey']],
  R2C9: [['L', 'grey'], ['D', 'grey']],
  R3C5: [['U', 'grey'], ['D', 'grey'], ['L', 'red'], ['DR', 'red']],
  R3C7: [['U', 'grey'], ['L', 'grey'], ['DR', 'grey'], ['D', 'red'], ['R', 'red']],
  R3C8: [['L', 'grey'], ['D', 'grey']],
  R4C3: [['D', 'grey'], ['R', 'grey'], ['DL', 'red'], ['UR', 'red']],
  R4C7: [['U', 'grey'], ['DL', 'grey']],
  R5C2: [['U', 'grey'], ['R', 'grey']],
  R5C6: [['UL', 'grey'], ['U', 'grey'], ['D', 'red'], ['DL', 'red'], ['R', 'red']],
  R5C8: [['U', 'grey'], ['UL', 'grey'], ['D', 'grey'], ['L', 'red'], ['DL', 'red']],
  R6C1: [['U', 'grey'], ['R', 'grey']],
  R6C4: [['U', 'grey'], ['R', 'grey'], ['D', 'grey'], ['L', 'red'], ['DL', 'red']],
  R6C8: [['UL', 'grey'], ['D', 'grey'], ['DL', 'red'], ['R', 'red']],
  R7C1: [['U', 'grey'], ['R', 'grey']],
  R7C6: [['U', 'grey'], ['UR', 'grey'], ['D', 'grey'], ['UL', 'red'], ['R', 'red'], ['DR', 'red']],
  R8C2: [['U', 'grey'], ['R', 'grey']],
  R8C3: [['U', 'grey'], ['R', 'grey']],
  R9C1: [['U', 'grey'], ['R', 'grey']],
  R9C2: [['U', 'grey'], ['R', 'grey']],
  R9C3: [['L', 'grey'], ['U', 'grey'], ['UR', 'grey']],
  R9C4: [['U', 'grey'], ['UR', 'grey']],
  R9C5: [['U', 'grey'], ['L', 'grey']],
  R9C7: [['U', 'grey'], ['L', 'grey']],
  R9C9: [['U', 'grey'], ['L', 'grey']],
};

const DIRS = {
  U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1],
  UL: [-1, -1], UR: [-1, 1], DL: [1, -1], DR: [1, 1],
};

const graph = cellGraph('9x9');

// Cells strictly beyond `cell` in direction `dirName`, ordered by distance.
function fullRay(cell, dirName) {
  const [dr, dc] = DIRS[dirName];
  return graph.ray(cell, dr, dc).slice(1);
}

function sumCells(coeff, cells) {
  return cells.map(c => [c, coeff]);
}

const cellConstraints = [];

for (const [cell, arrowList] of Object.entries(ARROWS)) {
  const byColor = {};
  for (const [dir, color] of arrowList) {
    (byColor[color] = byColor[color] || []).push(dir);
  }
  const colors = Object.keys(byColor);

  // N (the cell's own digit) must leave enough room for every one of its
  // arrows to reach N cells before the grid edge.
  let maxN = 9;
  for (const [dir] of arrowList) {
    maxN = Math.min(maxN, fullRay(cell, dir).length);
  }

  const nBranches = [];
  for (let n = 1; n <= maxN; n++) {
    const parts = [new Given(cell, n)];
    const repRay = {};

    for (const color of colors) {
      const dirs = byColor[color];
      const rays = dirs.map(d => fullRay(cell, d).slice(0, n));
      repRay[color] = rays[0];
      // All arrows of this colour at this cell sum to the same total.
      if (rays.length > 1) {
        parts.push(new EqualSum(...rays));
      }
    }

    if (colors.length === 2) {
      const [ca, cb] = colors;
      const a = repRay[ca];
      const b = repRay[cb];
      // Different colours must total to different sums. Both totals lie in
      // [n, 9n], so their difference lies in [-8n, 8n]; enumerate every
      // nonzero gap as an alternative (no single ISS Var can hold a range
      // this wide, so this avoids materializing one).
      const maxDiff = 8 * n;
      const diffBranches = [];
      for (let d = -maxDiff; d <= maxDiff; d++) {
        if (d === 0) continue;
        diffBranches.push(new Sum(d, ...sumCells(1, a), ...sumCells(-1, b)));
      }
      parts.push(new Or(diffBranches));
    }

    nBranches.push(new And(parts));
  }

  cellConstraints.push(new Or(nBranches));
}

return [
  new Shape('9x9'),
  ...cellConstraints,
];
