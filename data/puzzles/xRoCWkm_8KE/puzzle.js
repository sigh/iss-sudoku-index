// Title: The 98% Sudoku
// Author: Bismuth
// Video: https://www.youtube.com/watch?v=xRoCWkm_8KE
// Source: https://cracking-the-cryptic.web.app/sudoku/FRgj24r4N9

// Rules encoded here:
//   * Normal sudoku.
//   * Each circle is the centre of a "galaxy": an orthogonally connected,
//     180-degree rotationally symmetric group of cells -- the standard
//     reading of "galaxy" in this puzzle genre (Tentai Show / Spiral
//     Galaxies), which the rules text assumes without re-stating (it names
//     the circles only as the galaxies' "centers" and never itself defines
//     what a galaxy is).
//   * Every cell belongs to exactly one galaxy; digits do not repeat within
//     a galaxy; the number by each circle is the sum of that galaxy's
//     digits.
//   * Galaxies treat the grid as a torus: row 9 is adjacent to row 1 and
//     column 9 is adjacent to column 1, both for the 180-degree rotation and
//     for the adjacency that makes a galaxy one connected piece.
// Nothing is omitted.
//
// Model: ISS's ConnectedValues hardcodes plain rectangular adjacency with no
// notion of wraparound, so it cannot certify a galaxy connected on the torus
// directly. Each galaxy whose
// size isn't already forced to one adjacent pair gets its own small
// rectangular Var patch that *unrolls* its own torus neighbourhood: every
// cell within reach of the galaxy is placed at its nearest continuous
// (unwrapped) offset from the galaxy's centre, so ordinary non-wrapping
// adjacency within that small patch matches true torus adjacency among
// those cells. The patch holds one IN/OUT flag per candidate cell;
// ConnectedValues on IN then proves the real galaxy is one connected piece.
//
// A galaxy whose sum forces exactly two cells (from the min/max reachable
// sum for its size, filtered by the parity its dot type requires -- 180
// rotation pairs every other cell, so only a dot sitting on a cell's own
// centre can pair a cell with itself, giving an odd total; an edge-centred
// dot pairs cells only with each other, giving an even total) is already
// pinned to the single adjacent pair straddling it: that goes straight to a
// Sum on the two real cells, no patch needed -- two orthogonally adjacent
// cells already share a row or column, so no extra all-different is needed
// either.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const IN = 1, OUT = 2;
const mod = (a, m) => ((a % m) + m) % m;

// Circle centres and sums, transcribed from the drawn dots and their nearest
// printed number (positions doubled to half-cell units: cell RrCc's centre
// is (2r-1, 2c-1), so an even coordinate names an edge midpoint, and 0/18 on
// an axis is the torus seam on that axis).
const GALAXIES = [
  { r: 4, c: 1, value: 22 },     // edge(R2C1,R3C1)
  { r: 9, c: 4, value: 6 },      // edge(R5C2,R5C3)
  { r: 11, c: 4, value: 26 },    // edge(R6C2,R6C3)
  { r: 7, c: 6, value: 44 },     // edge(R4C3,R4C4)
  { r: 13, c: 4, value: 14 },    // edge(R7C2,R7C3)
  { r: 16, c: 3, value: 12 },    // edge(R8C2,R9C2)
  { r: 17, c: 0, value: 39 },    // edge(R9C9,R9C1) -- wraps
  { r: 0, c: 5, value: 10 },     // edge(R9C3,R1C3) -- wraps
  { r: 2, c: 7, value: 19 },     // edge(R1C4,R2C4)
  { r: 5, c: 12, value: 21 },    // edge(R3C6,R3C7)
  { r: 1, c: 13, value: 17 },    // R1C7
  { r: 9, c: 11, value: 21 },    // R5C6
  { r: 10, c: 13, value: 5 },    // edge(R5C7,R6C7)
  { r: 14, c: 7, value: 5 },     // edge(R7C4,R8C4)
  { r: 15, c: 9, value: 19 },    // R8C5
  { r: 17, c: 11, value: 45 },   // R9C6
  { r: 13, c: 17, value: 10 },   // R7C9
  { r: 11, c: 16, value: 9 },    // edge(R6C8,R6C9)
  { r: 8, c: 17, value: 35 },    // edge(R4C9,R5C9)
  { r: 3, c: 16, value: 14 },    // edge(R2C8,R2C9)
  { r: 18, c: 15, value: 12 },   // edge(R9C8,R1C8) -- wraps
];

// Cell counts a galaxy of this dot type could have with this sum: with n
// distinct digits the sum lies between 1+..+n and 9+..+(10-n), and rotation
// parity (see header) restricts n's parity by dot type.
const possibleSizes = (g) => {
  const rOdd = g.r % 2 === 1, cOdd = g.c % 2 === 1;
  const parity = (rOdd && cOdd) ? 'odd' : 'even';   // no corner dots occur here
  return DIGITS.filter(n => {
    if (parity === 'odd' && n % 2 === 0) return false;
    if (parity === 'even' && n % 2 === 1) return false;
    const minSum = n * (n + 1) / 2, maxSum = n * (19 - n) / 2;
    return g.value >= minSum && g.value <= maxSum;
  });
};

// Torus half-coordinate Manhattan distance, wrapped at circumference 18
// (9 cells x 2 half-units).
const torusHalfDist = (a, b) => {
  const diff = Math.abs(a - b) % 18;
  return Math.min(diff, 18 - diff);
};

// The unique adjacent real-cell pair straddling an edge-centred dot forced
// to size 2 (see header).
const pinnedPairCells = (g) => {
  if (g.r % 2 === 0) {
    const row1 = mod(g.r / 2 - 1, 9) + 1;
    const row2 = mod(row1, 9) + 1;
    const col = (g.c + 1) / 2;
    return [makeCellId(row1, col), makeCellId(row2, col)];
  }
  const col1 = mod(g.c / 2 - 1, 9) + 1;
  const col2 = mod(col1, 9) + 1;
  const row = (g.r + 1) / 2;
  return [makeCellId(row, col1), makeCellId(row, col2)];
};

// Torus 180-degree rotation image of a real cell about g's centre, in real
// (row, col) space.
const rotateImage = (row, col, g) => {
  const chr = 2 * row - 1, chc = 2 * col - 1;
  const ir = mod(2 * g.r - chr, 18);
  const ic = mod(2 * g.c - chc, 18);
  return { row: (ir + 1) / 2, col: (ic + 1) / 2 };
};

// The candidate cells a galaxy could reach: real cells within torus
// half-distance <= (max possible size - 1) of the centre. A cell at
// half-distance d drags its rotational image along, and a connected path
// between the two needs at least d+1 cells.
const zoneOf = (g, limit) => {
  const zone = [];
  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 9; col++) {
      const chr = 2 * row - 1, chc = 2 * col - 1;
      if (torusHalfDist(chr, g.r) + torusHalfDist(chc, g.c) <= limit) {
        zone.push({ row, col });
      }
    }
  }
  return zone;
};

// This real cell's position nearest the centre on the real number line
// (choosing among the cell's three torus pre-images, +/-9 rows/cols): the
// *unwrapped* local coordinate a non-wrapping rectangular patch can use.
const unwrapLocal = (row, col, g) => {
  const chr = 2 * row - 1, chc = 2 * col - 1;
  const nearest = (half, centre) => {
    let best = half, bestD = Infinity;
    for (const k of [-1, 0, 1]) {
      const cand = half + 18 * k;
      const d = Math.abs(cand - centre);
      if (d < bestD) { bestD = d; best = cand; }
    }
    return best;
  };
  return {
    localRow: (nearest(chr, g.r) + 1) / 2,
    localCol: (nearest(chc, g.c) + 1) / 2,
  };
};

const pinned = [];
const big = [];
GALAXIES.forEach((g) => {
  const sizes = possibleSizes(g);
  if (sizes.length === 1 && sizes[0] === 2) {
    pinned.push(g);
  } else {
    big.push({ g, limit: Math.max(...sizes) - 1 });
  }
});

// Pinned galaxies: a plain Sum on the forced pair (see header for why no
// extra AllDifferent is needed).
const pinnedSums = pinned.map((g) => {
  const [a, b] = pinnedPairCells(g);
  return new Sum(g.value, a, b);
});
const pinnedCellSet = new Set(pinned.flatMap(pinnedPairCells));

// One uppercase-letter Var prefix per big galaxy (A..Q, 17 letters).
const LETTERS = 'ABCDEFGHIJKLMNOPQ';

// Per-galaxy: zone (candidate real cells), local unwrapped bounding patch,
// a real-cell -> patch-cell lookup (`patchCell`), and the reverse position ->
// real-cell map used only to give every patch cell a domain below.
const galaxyInfo = big.map(({ g, limit }, i) => {
  const zone = zoneOf(g, limit);
  const local = new Map(zone.map(({ row, col }) => {
    const { localRow, localCol } = unwrapLocal(row, col, g);
    return [`${row},${col}`, { localRow, localCol }];
  }));
  const rows = [...local.values()].map((p) => p.localRow);
  const cols = [...local.values()].map((p) => p.localCol);
  const minRow = Math.min(...rows), maxRow = Math.max(...rows);
  const minCol = Math.min(...cols), maxCol = Math.max(...cols);
  const height = maxRow - minRow + 1, width = maxCol - minCol + 1;
  const prefix = LETTERS[i];
  const patch = new Var(prefix, `galaxy ${i + 1}`, `${height}x${width}`);
  const posToCell = (row, col) => {
    const p = local.get(`${row},${col}`);
    return { r: p.localRow - minRow + 1, c: p.localCol - minCol + 1 };
  };
  const patchCell = (row, col) => {
    const { r, c } = posToCell(row, col);
    return patch.cell(r, c);
  };
  const realAtPos = new Map();
  for (const { row, col } of zone) {
    const { r, c } = posToCell(row, col);
    realAtPos.set(`${r},${c}`, { row, col });
  }
  return { g, zone, patch, patchCell, realAtPos, height, width };
});

// Every patch cell needs an explicit IN/OUT domain: candidate (zone) cells
// get both values, cells in the bounding rectangle but outside the
// torus-distance zone can never belong to the galaxy and are fixed OUT.
const patchDomains = galaxyInfo.flatMap(({ patch, realAtPos, height, width }) => {
  const givens = [];
  for (let r = 1; r <= height; r++) {
    for (let c = 1; c <= width; c++) {
      const isZone = realAtPos.has(`${r},${c}`);
      givens.push(isZone
        ? new Given(patch.cell(r, c), IN, OUT)
        : new Given(patch.cell(r, c), OUT));
    }
  }
  return givens;
});

// 180-degree symmetry within each galaxy's own patch: a candidate cell is IN
// exactly when its rotational image is (plain equality, since each patch
// carries only this one galaxy's binary flag). Skip the self-paired centre
// cell of an odd (cell-centred) galaxy.
const symmetry = galaxyInfo.flatMap(({ g, zone, patchCell }) => zone.flatMap(({ row, col }) => {
  const image = rotateImage(row, col, g);
  if (image.row === row && image.col === col) return [];
  if (image.row < row || (image.row === row && image.col < col)) return [];
  return [new SameValues(2, patchCell(row, col), patchCell(image.row, image.col))];
}));

// Connectivity: IN cells of each galaxy's own patch form one connected
// piece. The patch's plain rectangular adjacency already matches true torus
// adjacency among its cells (see header), and this also forces IN
// non-empty, so every galaxy actually owns cells.
const connectivity = galaxyInfo.map(({ patch }) => new ConnectedValues('V' + patch.prefix, IN));

// Digit content: one small machine per galaxy scans its zone as
// (flag, digit) pairs, accumulating the set of digits on IN cells as a
// bitmask; `reading` is true while the next value read is the digit for the
// flag cell just seen.
const digitsOfMask = (mask) => DIGITS.filter((d) => mask & (1 << (d - 1)));
const galaxyContents = galaxyInfo.map(({ g, zone, patchCell }) => {
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === IN };
      }
      if (!state.inGalaxy) {
        return { mask: state.mask, reading: false, inGalaxy: false };
      }
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;   // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      return digits.length > 0 &&
        digits.reduce((a, b) => a + b, 0) === g.value;
    },
  }, 9);
  return new NFA(machine, 'galaxy-contents',
    ...zone.flatMap(({ row, col }) => [patchCell(row, col), makeCellId(row, col)]));
});

// Partition: every real cell not already in a pinned pair belongs to
// exactly one big galaxy. One shared machine counts how many of the listed
// flags are IN (capped at 2) and accepts only an exact count of 1.
const exactlyOneMachine = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => Math.min(count + (value === IN ? 1 : 0), 2),
  accept: (count) => count === 1,
}, 9);
const partition = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    if (pinnedCellSet.has(makeCellId(row, col))) continue;
    const flags = galaxyInfo.flatMap(({ zone, patchCell }) =>
      zone.some((z) => z.row === row && z.col === col) ? [patchCell(row, col)] : []);
    partition.push(new NFA(exactlyOneMachine, 'galaxy-partition', ...flags));
  }
}

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new Given('R5C1', 3),
  new Given('R5C9', 4),
  new Given('R9C5', 6),
  ...pinnedSums,
  ...galaxyInfo.map(({ patch }) => patch),
  ...patchDomains,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...partition,
];
