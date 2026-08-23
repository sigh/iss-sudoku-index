// Title: Monopoly Sudoku
// Author: Trevor Nicholas
// Video: https://www.youtube.com/watch?v=iG9dyK8RoD0
// Source: https://sudokupad.app/MONOPOLYSUDOKU

// Rules encoded here:
//
//  - Normal sudoku, 9x9 with the default boxes. One given, R3C3=9.
//  - Killer cages: three 2x2 cages summing to 20 / 30 / 10.
//  - Arrow ("Pass Go, Collect $200!"): the digits on the arrow multiply to
//    200.
//  - Properties: each of the nine colour/utility groups holds consecutive
//    digits in any order, and each group holds a different group of digits.
//  - Chance: the three "?" digits, in some combination, give the row, the
//    column and the digit of one hidden grid cell.
//
// Omitted, and the reason:
//
//  - Railroads, all but one consequence. The rule is that the four RR cells
//    pair into two tracks; a track is a 1-cell-wide route between its two RR
//    cells, tracks may not touch themselves or each other orthogonally, may
//    not pass through a property, cage or Chance cell, and each track's digits
//    read as a palindrome. The routes are the solver's to find, and a
//    palindrome along a route whose cells, length and orientation are all
//    unknown has no representation here: it equates the digits at positions k
//    and N+1-k of that route, a pairing of two cells selected by their
//    positions. What is encoded instead is the one consequence that needs no
//    route: a palindrome starts and ends with its two RR cells, so those two
//    cells hold equal digits. Which RR cell pairs with which is not stated, so
//    all three pairings are disjoined.

const shape = new Shape('9x9');

const given = new Given('R3C3', 9);

// Cages: the source's three cell-bearing cage entries, whose totals are
// written "|20"/"|30"/"|10". The leading pipe has no meaning in this drawing
// format; the numeral is the corner total the rules refer to.
const cages = [
  new Cage(20, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(30, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(10, 'R7C2', 'R7C3', 'R8C2', 'R8C3'),
];

// Arrow. The drawn line runs from (8.3, 8.3) in cell units -- inside R9C9,
// and on the ring of the circle drawn there -- through the centres of R8C8,
// R7C7 and R6C6. Whether R9C9 is "on the arrow" is left open by the drawing:
// the circle's stroke spans radius 0.275-0.375 about the cell centre and the
// line's first point is 0.283 from it, so the line can be read either as
// starting inside R9C9 or as starting on the edge of a bulb that the arrow
// then excludes. The rules sentence does not settle it either -- it names its
// own total ("multiply to 200") rather than pointing at a circled digit, so
// the circle carries no total to mark it as a bulb, but nor does it say the
// circled cell counts. Both readings are therefore encoded as a disjunction.
//
// 200 = 2^3 * 5^2, so every digit on the arrow divides 200 and lies in
// {1,2,4,5,8}, and exactly two of them are 5 (only 5 carries a factor of 5,
// and 125 does not divide 200). The remaining cells then multiply to 8: over
// one cell that is 8, over two it is {1,8} or {2,4}. These are all the
// multisets with product 200, so the ContainExact list is the whole rule.
const arrowShaft = ['R8C8', 'R7C7', 'R6C6'];
const arrowWithBulb = ['R9C9', ...arrowShaft];
const arrow = new Or([
  new ContainExact('5_5_8', ...arrowShaft),
  new ContainExact('1_5_5_8', ...arrowWithBulb),
  new ContainExact('2_4_5_5', ...arrowWithBulb),
]);

// Property groups, transcribed from the coloured bars drawn on the grid line
// between each perimeter cell and its inward neighbour (six three-cell colour
// groups, two two-cell colour groups, and the two-cell grey Utilities group).
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

// "Each set contains a different group of digits": a set of consecutive
// digits is fixed by its smallest digit, so each group gets a helper Var
// holding that minimum, tied to the group's digit sum (n consecutive digits
// from m sum to n*m + n*(n-1)/2), and equal-sized groups are made
// all-different on it. Groups of different sizes can never hold the same
// digits, so the two size classes need no link.
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

// Chance: the three "?" cells, from the drawn "?" marks.
const chanceCells = ['R3C1', 'R7C9', 'R9C6'];
// Three helper Vars take the three roles. "In some combination" means the
// roles are the Chance digits in some order, i.e. the two triples hold the
// same values with the same multiplicities -- which stays correct when two
// Chance digits are equal.
const chanceRoles = new Var('CH', 'Chance digits in role order: row, column, digit', 3);
const [roleRow, roleCol, roleDigit] = chanceRoles.cells();
// The addressed cell holds the digit-role value. There is no way here to say
// "the cell at (row Var, column Var)", so the address is a disjunction over
// all 81 grid cells, each branch pinning the two coordinate Vars.
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
  new Or(chanceAddresses),
];

// Railroads, reduced to the palindrome's endpoint consequence (see the
// omission note above). The four RR cells come from the drawn "RR" marks.
const railroadPairings = [
  [['R1C5', 'R5C1'], ['R5C9', 'R9C5']],
  [['R1C5', 'R5C9'], ['R5C1', 'R9C5']],
  [['R1C5', 'R9C5'], ['R5C1', 'R5C9']],
];
const railroads = new Or(railroadPairings.map(
  pairs => new And(pairs.map(pair => new SameValues(2, ...pair)))));

return [
  shape,
  given,
  ...cages,
  arrow,
  ...propertyRules,
  ...chance,
  railroads,
];
