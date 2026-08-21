// Title: Monopoly Sudoku
// Author: Trevor Nicholas
// Video: https://www.youtube.com/watch?v=iG9dyK8RoD0
// Source: https://sudokupad.app/MONOPOLYSUDOKU

// Rules encoded here (all of them; nothing omitted):
//
//  - Normal sudoku, 9x9 with the default boxes. One given, R3C3=9.
//  - Killer cages: three 2x2 cages summing to 20 / 30 / 10.
//  - Arrow ("Pass Go, Collect $200!"): the digits on the arrow multiply to
//    200. The arrow covers the four cells its drawn line runs through,
//    R9C9-R8C8-R7C7-R6C6.
//  - Properties: each of the nine colour/utility groups holds a run of
//    consecutive digits in any order, and no two groups hold the same group of
//    digits.
//  - Chance: the three "?" digits, in some order, give the row, the column and
//    the digit of one hidden grid cell.
//  - Railroads: the four RR cells pair up into two tracks; a track is a
//    1-cell-wide path between its two RR cells whose digits read as a
//    palindrome, tracks may not touch themselves or each other orthogonally,
//    and may not pass through a property, cage or Chance cell.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');

const given = new Given('R3C3', 9);

// Cages: the payload's three cell-bearing cage entries. Their totals are
// written "|20"/"|30"/"|10"; the leading pipe has no meaning in the source
// format and the numeral is the corner total the rules refer to.
const cages = [
  new Cage(20, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(30, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(10, 'R7C2', 'R7C3', 'R8C2', 'R8C3'),
];

// Arrow: the cells the drawn line runs through. Its waypoints are
// (8.3,8.3)-(7.5,7.5)-(6.5,6.5)-(5.5,5.5) in cell units, so it starts inside
// R9C9 and passes through the centres of R8C8, R7C7 and R6C6. The circle drawn
// at R9C9 is the "Pass Go" token, not an arrow bulb holding the total: this
// rule states its own target (200) instead of pointing at a circled digit, so
// nothing takes R9C9 off the line.
const arrowCells = ['R9C9', 'R8C8', 'R7C7', 'R6C6'];
// 200 = 2^3 * 5^2, so each of the four digits must divide 200 and therefore
// lies in {1,2,4,5,8}. Only 5 carries a factor of 5, so exactly two cells hold
// 5 (three 5s would need 125 to divide 200), and the other two multiply to 8:
// either {1,8} or {2,4}. "Multiply to 200" is therefore exactly these two
// multisets.
const arrow = new Or([
  new ContainExact('1_5_5_8', ...arrowCells),
  new ContainExact('2_4_5_5', ...arrowCells),
]);

// Property groups, transcribed from the coloured bars drawn on the inward edge
// of each perimeter cell (six three-cell colour groups, two two-cell colour
// groups and the two-cell grey Utilities group).
const properties3 = [
  ['R1C2', 'R1C3', 'R1C4'],   // red
  ['R9C2', 'R9C3', 'R9C4'],   // light blue
  ['R2C9', 'R3C9', 'R4C9'],   // green
  ['R1C1', 'R2C1', 'R4C1'],   // orange
  ['R6C1', 'R7C1', 'R9C1'],   // pink
  ['R1C6', 'R1C7', 'R1C9'],   // yellow
];
const properties2 = [
  ['R9C7', 'R9C8'],           // brown
  ['R6C9', 'R8C9'],           // dark blue
  ['R1C8', 'R8C1'],           // utilities (grey)
];

// "Each set contains a different group of digits": a run of consecutive digits
// is fixed by its smallest digit, so each group gets a helper Var holding that
// minimum, tied to the group's digit sum (sum = n*min + n*(n-1)/2), and equal
// sized groups are made all-different on it. Groups of different sizes can
// never hold the same digits, so they need no link.
const minOf3 = new Var('MA', 'smallest digit of each 3-cell property group', properties3.length);
const minOf2 = new Var('MB', 'smallest digit of each 2-cell property group', properties2.length);
const propertyRules = [
  minOf3,
  minOf2,
  ...properties3.flatMap((cells, i) => {
    const m = minOf3.cell(i + 1);
    return [
      new Renban(...cells),
      new Given(m, 1, 2, 3, 4, 5, 6, 7),
      new Sum(3, ...cells, [m, -3]),
    ];
  }),
  ...properties2.flatMap((cells, i) => {
    const m = minOf2.cell(i + 1);
    return [
      new Renban(...cells),
      new Given(m, 1, 2, 3, 4, 5, 6, 7, 8),
      new Sum(1, ...cells, [m, -2]),
    ];
  }),
  new AllDifferent(...minOf3.cells()),
  new AllDifferent(...minOf2.cells()),
];

// Chance: the three "?" cells, from the drawn "?" overlays.
const chanceCells = ['R3C1', 'R7C9', 'R9C6'];
// Three helper Vars take the roles (row, column, digit). "In some combination"
// means the roles are a permutation of the three Chance digits, i.e. the two
// triples hold the same values with the same multiplicities.
const chanceRoles = new Var('CH', 'Chance digits in role order: row, column, digit', 3);
const [roleRow, roleCol, roleDigit] = chanceRoles.cells();
const chanceAddresses = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    chanceAddresses.push(new And([
      new Given(roleRow, r),
      new Given(roleCol, c),
      new SameValues(2, makeCellId(r, c), roleDigit),
    ]));
  }
}
const chance = [
  chanceRoles,
  new SameValues(2, ...chanceRoles.cells(), ...chanceCells),
  // The addressed cell holds the digit-role value; ISS has no (row, column)
  // dereference, so the address is a disjunction over all 81 grid cells.
  new Or(chanceAddresses),
];

// Railroads. The four RR cells come from the drawn "RR" overlays.
const railroadCells = ['R1C5', 'R5C1', 'R5C9', 'R9C5'];
// A track may not enter a property, cage or Chance cell, so the cells a track
// may use are the rest of the grid, derived from the clue lists above.
const trackBlocked = new Set([
  ...properties3.flat(), ...properties2.flat(),
  ...cages.flatMap(cage => cage.cells),
  ...chanceCells,
]);
const trackable = new Set();
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (!trackBlocked.has(cell)) trackable.add(cell);
  }
}

// Two cells may hold the same digit only if they share no row, column or box.
const sameDigitPossible = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  if (p.row === q.row || p.col === q.col) return false;
  const boxOf = (x) => `${Math.floor((x.row - 1) / 3)},${Math.floor((x.col - 1) / 3)}`;
  return boxOf(p) !== boxOf(q);
};

// All tracks from `start` to `end`: simple paths through `trackable` that avoid
// `excluded` (the other pair's RR cells) and never touch themselves, i.e. no
// path cell is orthogonally adjacent to a non-consecutive path cell.
// Palindromic routes only: a route pairing two cells of the same row, column or
// box can never satisfy its palindrome, so dropping it removes an alternative
// that is empty rather than one that is merely unlikely.
const enumerateTracks = (start, end, excluded) => {
  const found = [];
  const path = [start];
  const onPath = new Set(path);
  const extend = () => {
    const last = path[path.length - 1];
    if (last === end) {
      const n = path.length;
      for (let i = 0; i < n >> 1; i++) {
        if (!sameDigitPossible(path[i], path[n - 1 - i])) return;
      }
      found.push([...path]);
      return;
    }
    for (const next of graph.neighbours(last)) {
      if (!trackable.has(next) || onPath.has(next) || excluded.has(next)) continue;
      if (graph.neighbours(next).some(
        n => n !== last && onPath.has(n))) continue;
      path.push(next);
      onPath.add(next);
      extend();
      path.pop();
      onPath.delete(next);
    }
  };
  extend();
  return found;
};

const touches = (trackA, trackB) => {
  const cellsB = new Set(trackB);
  return trackA.some(
    a => cellsB.has(a) || graph.neighbours(a).some(n => cellsB.has(n)));
};

// Every way of pairing the four RR cells into two tracks. The rules do not say
// which RR cell pairs with which, so all three pairings are live and the
// encoding is the disjunction over them.
const pairings = [
  [[railroadCells[0], railroadCells[1]], [railroadCells[2], railroadCells[3]]],
  [[railroadCells[0], railroadCells[2]], [railroadCells[1], railroadCells[3]]],
  [[railroadCells[0], railroadCells[3]], [railroadCells[1], railroadCells[2]]],
];
const trackLayouts = pairings.flatMap(([pairA, pairB]) => {
  const tracksA = enumerateTracks(pairA[0], pairA[1], new Set(pairB));
  const tracksB = enumerateTracks(pairB[0], pairB[1], new Set(pairA));
  return tracksA.flatMap(
    a => tracksB.filter(b => !touches(a, b)).map(
      b => new And([new Palindrome(...a), new Palindrome(...b)])));
});
const railroads = new Or(trackLayouts);

return [
  shape,
  given,
  ...cages,
  arrow,
  ...propertyRules,
  ...chance,
  railroads,
];
