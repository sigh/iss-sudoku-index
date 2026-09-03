// Title: Snakes on a Plane
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=RJb1n9v_oiE
// Source: https://app.crackingthecryptic.com/sudoku/Dgtf7gGM4L

// Rules encoded below:
//  - Normal sudoku.
//  - The grid is completely covered by 17 killer snakes: one snake of length 9,
//    and two snakes of each length 1 through 8.
//  - A snake is one cell wide and has exactly one bend along its length, except
//    the length-1 and length-2 snakes (which have no bend).  So every snake of
//    length >= 3 is an L: a bend cell with two straight arms at right angles.
//  - Numbers don't repeat within a snake.
//  - The nine numbers printed in cell corners give the total sum of the digits
//    of the snake that occupies that cell.  Those nine killer clues apply to
//    nine differently-sized snakes.
//
// Model.  Each snake is a rooted tree of parent pointers, rooted at its bend
// (at the upper/left cell for a length-2 snake, at the cell itself for a
// length-1 snake), which makes every snake's rooting unique:
//   VD  parent direction of the cell: ROOT, or N/E/S/W towards its parent.
//   VL  number of cells in the cell's own subtree (so VL at a root is the
//       snake's length, and VL at an arm end is 1).
//   VZ  the snake's length, written at its root only; NOT_ROOT elsewhere.
//   VA/VB/VC  the set of digits in the cell's own subtree, as three bitmasks.
// The alphabet is widened to 10 so VZ has a spare NOT_ROOT value; grid digits
// are restricted back to 1-9.

const ROOT = 1, N = 2, E = 3, S = 4, W = 5;   // VD values
const NOT_ROOT = 10;                          // VZ value on a non-root cell
const DIRS = [N, E, S, W];
const STEP = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };
const OPPOSITE = { [N]: S, [E]: W, [S]: N, [W]: E };
const VERTICAL = [N, S], HORIZONTAL = [E, W];

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const parentDir = graph.makeOverlay('VD');
const subtree = graph.makeOverlay('VL');
const snakeLen = graph.makeOverlay('VZ');
// The digit set of a cell's subtree, split over three 8-valued masks of three
// digits each (1-3, 4-6, 7-9); see the no-repeats rule below.
const DIGITS_PER_MASK = 3;
const maskValues = [1, 2, 3, 4, 5, 6, 7, 8];   // a 3-digit mask, offset by 1
const maskGroups = [0, 1, 2].map(group => ({
  group,
  overlay: graph.makeOverlay(['VA', 'VB', 'VC'][group]),
}));
// One cell per killer clue, holding the length of the snake it sits in.
const clueLen = new Var('N', 'clued snake lengths', 9);

// Givens, transcribed from the printed digits.
const givens = {
  R1C3: 2, R1C6: 4, R1C7: 5, R2C2: 1, R2C6: 6, R2C7: 2, R4C9: 2, R5C3: 9,
  R5C7: 3, R5C8: 4, R5C9: 5, R6C4: 9, R6C9: 1, R8C5: 2, R8C7: 9, R9C4: 5,
};
// The nine killer clues, transcribed from the numbers drawn in cell corners:
// cell -> the total of the snake occupying that cell.
const killerClues = {
  R9C1: 5, R9C2: 3, R6C3: 21, R5C4: 18, R1C7: 40,
  R2C7: 45, R2C8: 30, R3C8: 37, R7C6: 41,
};

const step = (cell, dir) => graph.step(cell, ...STEP[dir]);
// The directions in which `cell` has an in-grid neighbour.
const openDirs = (cell) => DIRS.filter(d => step(cell, d) !== null);

// --- Domains.  Digits stay 1-9 in the widened alphabet; a parent pointer must
// point at a real cell; a subtree never holds more than the 9 cells of the
// longest snake.
const digitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...digitValues)),
  subtree.makeReplicate(new Given(subtree.at(gridCells[0]), ...digitValues)),
  ...gridCells.map(cell => new Given(parentDir.at(cell), ROOT, ...openDirs(cell))),
  ...maskGroups.map(({ overlay }) => overlay.makeReplicate(
    new Given(overlay.at(gridCells[0]), ...maskValues))),
];

// --- Snake shape and length, one state machine per cell.  The machine reads
// [VD, VL, VZ] of the cell and then [VD, VL] of each in-grid neighbour in
// `nbrs` order.  A neighbour is a child exactly when its parent pointer points
// back at this cell.  It checks, in one pass:
//   * VZ is VL at a root and NOT_ROOT elsewhere;
//   * VL = 1 + the total of the children's VL (which also forbids pointer
//     cycles, since VL would have to strictly decrease around one);
//   * a non-root cell has at most one child, directly opposite its parent, so
//     every arm runs straight;
//   * a root has at most two children; with two they are at right angles (the
//     single bend); with one, that child is a leaf and lies E or S of the root
//     (a length-2 snake, rooted at its upper/left cell so the rooting is
//     unique); with none the snake is a single cell.
const structureSpec = (nbrs) => NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (state, value) => {
    if (state.phase === 'dir') {
      if (value !== ROOT && !nbrs.includes(value)) return undefined;
      return { phase: 'len', pd: value };
    }
    if (state.phase === 'len') {
      if (value === NOT_ROOT) return undefined;
      return { phase: 'root', pd: state.pd, len: value };
    }
    if (state.phase === 'root') {
      const expected = state.pd === ROOT ? state.len : NOT_ROOT;
      if (value !== expected) return undefined;
      return {
        phase: 'nbrDir', pd: state.pd, rem: state.len - 1,
        i: 0, kids: [], leaf: false,
      };
    }
    if (state.phase === 'nbrDir') {
      if (state.i >= nbrs.length) return undefined;
      const child = value === OPPOSITE[nbrs[state.i]];
      return { ...state, phase: 'nbrLen', child };
    }
    // phase 'nbrLen': the neighbour's subtree size.
    const dir = nbrs[state.i];
    const next = {
      phase: 'nbrDir', pd: state.pd, rem: state.rem,
      i: state.i + 1, kids: state.kids, leaf: state.leaf,
    };
    if (!state.child) return next;
    if (state.pd !== ROOT && dir !== OPPOSITE[state.pd]) return undefined;
    if (state.kids.length === 2) return undefined;
    next.rem = state.rem - value;
    if (next.rem < 0) return undefined;
    next.kids = state.kids.concat([dir]);
    if (state.pd === ROOT && state.kids.length === 0) next.leaf = value === 1;
    return next;
  },
  maxDepth: 3 + 2 * nbrs.length,
  accept: (state) => {
    if (state.phase !== 'nbrDir' || state.rem !== 0) return false;
    if (state.pd !== ROOT) return true;
    if (state.kids.length === 2) {
      return VERTICAL.includes(state.kids[0]) !== VERTICAL.includes(state.kids[1]);
    }
    if (state.kids.length === 1) {
      return state.leaf && (state.kids[0] === E || state.kids[0] === S);
    }
    return true;
  },
}, geometry);

const structure = gridCells.map(cell => {
  const nbrs = openDirs(cell);
  const scan = [parentDir.at(cell), subtree.at(cell), snakeLen.at(cell)];
  for (const dir of nbrs) {
    const nbr = step(cell, dir);
    scan.push(parentDir.at(nbr), subtree.at(nbr));
  }
  return new NFA(structureSpec(nbrs), 'snake-shape', ...scan);
});

// --- Numbers don't repeat within a snake.  Each cell carries the set of digits
// in its own subtree, as a bitmask; a cell's set is its own digit plus its
// children's sets, and those parts must be pairwise disjoint, so a repeat is
// caught where the two branches carrying it meet.  A 9-digit mask needs 512
// values, so it is split over three overlays of three digits each (1-3, 4-6,
// 7-9), one 8-valued mask per overlay; the three are independent, so each is
// accumulated by its own machine.
const maskSpec = (nbrs, group) => NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (value > 9) return undefined;
      const own = Math.floor((value - 1) / DIGITS_PER_MASK) === group
        ? 1 << ((value - 1) % DIGITS_PER_MASK) : 0;
      return { phase: 'mask', acc: own };
    }
    if (state.phase === 'mask') {
      if (value > 8) return undefined;
      return { phase: 'nbrDir', acc: state.acc, target: value - 1, i: 0 };
    }
    if (state.phase === 'nbrDir') {
      if (state.i >= nbrs.length) return undefined;
      return { ...state, phase: 'nbrMask', child: value === OPPOSITE[nbrs[state.i]] };
    }
    // phase 'nbrMask': the neighbour's own subtree mask.
    if (value > 8) return undefined;
    const next = {
      phase: 'nbrDir', acc: state.acc, target: state.target, i: state.i + 1,
    };
    if (!state.child) return next;
    const childMask = value - 1;
    if (state.acc & childMask) return undefined;   // a digit twice in one snake
    next.acc = state.acc | childMask;
    return next;
  },
  maxDepth: 2 + 2 * nbrs.length,
  accept: (state) => state.phase === 'nbrDir' && state.acc === state.target,
}, geometry);

const noRepeats = maskGroups.flatMap(({ group, overlay }) =>
  gridCells.map(cell => {
    const nbrs = openDirs(cell);
    const scan = [cell, overlay.at(cell)];
    for (const dir of nbrs) {
      const nbr = step(cell, dir);
      scan.push(parentDir.at(nbr), overlay.at(nbr));
    }
    return new NFA(maskSpec(nbrs, group), 'snake-digits', ...scan);
  }));

// --- The 17 snake lengths: one 9, and two of each of 1..8.  Every snake writes
// its length at its own root, so counting root values counts snakes.
const lengthMultiset = [9];
for (let len = 1; len <= 8; len++) lengthMultiset.push(len, len);
const lengths = new ContainExact(
  lengthMultiset.sort((a, b) => a - b).join('_'),
  ...snakeLen.at(gridCells));

// --- Every placement of a snake of length `len`: the cells, the parent pointer
// each one must carry, and the cells just beyond the free ends, which must not
// point back in (they would extend the snake).  Every other way of gaining an
// extra child is already rejected by the shape machine above.
const placements = (len) => {
  const out = [];
  for (const root of gridCells) {
    if (len === 1) {
      out.push({
        cells: [root], pointers: [[root, ROOT]],
        blocked: openDirs(root).map(d => [step(root, d), OPPOSITE[d]]),
      });
      continue;
    }
    if (len === 2) {
      // Rooted at the upper/left cell, so E and S only.
      for (const dir of [E, S]) {
        const tail = step(root, dir);
        if (!tail) continue;
        const perpendicular = VERTICAL.includes(dir) ? HORIZONTAL : VERTICAL;
        const beyond = step(tail, dir);
        out.push({
          cells: [root, tail],
          pointers: [[root, ROOT], [tail, OPPOSITE[dir]]],
          blocked: [
            ...perpendicular.map(d => [step(root, d), OPPOSITE[d]]),
            [beyond, OPPOSITE[dir]],
          ].filter(([cell]) => cell !== null),
        });
      }
      continue;
    }
    for (const down of VERTICAL) {
      for (const across of HORIZONTAL) {
        for (let armA = 1; armA <= len - 2; armA++) {
          const armB = len - 1 - armA;
          const cells = [root];
          const pointers = [[root, ROOT]];
          const blocked = [];
          let ok = true;
          for (const [dir, arm] of [[down, armA], [across, armB]]) {
            let cell = root;
            for (let k = 0; k < arm; k++) {
              cell = step(cell, dir);
              if (!cell) { ok = false; break; }
              cells.push(cell);
              pointers.push([cell, OPPOSITE[dir]]);
            }
            if (!ok) break;
            const beyond = step(cell, dir);
            if (beyond) blocked.push([beyond, OPPOSITE[dir]]);
          }
          if (ok) out.push({ cells, pointers, blocked });
        }
      }
    }
  }
  return out;
};

// A snake of `len` distinct digits totals between these bounds, so a clue rules
// out every other length before any search happens.
const minTotal = (len) => len * (len + 1) / 2;
const maxTotal = (len) => len * (19 - len) / 2;

// --- Killer clues.  For each clue, one branch per snake placement that covers
// the clued cell and could reach the clued total: the branch pins the whole
// snake through the parent pointers, and the Cage gives the clued total.  AllDifferent over the nine length cells
// is "nine differently-sized snakes".
const clueEntries = Object.entries(killerClues);
const clueRules = clueEntries.map(([clueCell, total], index) => {
  const branches = [];
  for (let len = 1; len <= 9; len++) {
    if (total < minTotal(len) || total > maxTotal(len)) continue;
    for (const placement of placements(len)) {
      if (!placement.cells.includes(clueCell)) continue;
      branches.push(new And([
        ...placement.pointers.map(
          ([cell, dir]) => new Given(parentDir.at(cell), dir)),
        ...placement.blocked.map(([cell, dir]) => new Given(
          parentDir.at(cell),
          ...[ROOT, ...openDirs(cell)].filter(v => v !== dir))),
        new Cage(total, ...placement.cells),
        new Given(clueLen.cell(index + 1), len),
      ]));
    }
  }
  return new Or(branches);
});

return [
  shape,
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  parentDir.toVar('parent direction'),
  subtree.toVar('subtree size'),
  snakeLen.toVar('snake length at root'),
  ...maskGroups.map(({ group, overlay }) =>
    overlay.toVar(`subtree digits ${group * 3 + 1}-${group * 3 + 3}`)),
  clueLen,
  ...clueLen.cells().map(cell => new Given(cell, ...digitValues)),
  ...domains,
  ...structure,
  ...noRepeats,
  lengths,
  ...clueRules,
  new AllDifferent(...clueLen.cells()),
];
