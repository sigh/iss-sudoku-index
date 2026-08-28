// Title: hny 2022
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=9RRo3eaM6kQ
// Source: https://tinyurl.com/ywcc57sb

// Normal sudoku: rows, columns, boxes and killer cages all hold distinct
// digits (the ruleset explicitly adds "cages" to the no-repeat list).
//
// Nine killer cages print no total. Each cage sums to either 20 or 22, and
// each colour/shape group of three cages (the h cages, the n cages, the y
// cages -- grouped by shading colour, matching the cage cell sets exactly)
// contains at least one 20-cage and at least one 22-cage.
//
// A black dot is a 2:1 ratio, a white dot is consecutive; not every eligible
// pair is dotted, so absence of a dot implies nothing (the ruleset says so
// directly: "not all dots are shown").
//
// A thin outlined rectangle drawn across one edge of each cage traces part
// of the letter shape already given by the cage boundary and carries no
// printed value or rules-text meaning; it is not encoded.

const hCages = [
  ['R1C2', 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R4C4', 'R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R7C8', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];
const nCages = [
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C2'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6', 'R9C6'],
];
const yCages = [
  ['R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
];

// Each dotted edge, from the ruleset's black-dot/white-dot legend.
const blackDots = [
  ['R2C1', 'R3C1'], ['R1C1', 'R2C1'], ['R2C8', 'R2C9'], ['R1C8', 'R2C8'],
  ['R6C8', 'R7C8'], ['R8C6', 'R8C5'], ['R8C7', 'R8C6'], ['R3C6', 'R2C6'],
  ['R5C3', 'R5C4'], ['R5C3', 'R6C3'],
];
const whiteDots = [
  ['R7C8', 'R8C8'], ['R3C8', 'R3C9'], ['R3C8', 'R3C7'], ['R6C1', 'R7C1'],
  ['R4C7', 'R4C8'], ['R1C5', 'R1C6'], ['R1C7', 'R1C6'], ['R9C4', 'R9C3'],
  ['R9C4', 'R9C5'], ['R4C7', 'R5C7'], ['R6C4', 'R7C4'], ['R7C4', 'R7C3'],
  ['R2C6', 'R1C6'],
];

// Each h/n/y cage gets a flag Var (1 => this cage totals 20, 2 => it totals
// 22), tied to the cage's actual sum via an Or of the two alternatives. The
// group-level "at least one 20 and at least one 22" rule then reduces to a
// numeric check on the three flags: summed, three 20-flags read 3 and three
// 22-flags read 6, while every mixed combination reads 4 or 5. Requiring the
// flag sum to land on 4 or 5 is exactly "not all three cages share a total".
function letterGroup(prefix, label, cages) {
  const flags = new Var(prefix, label, cages.length);
  const flagCells = flags.cells();
  const perCage = cages.map((cells, i) => {
    const flag = flagCells[i];
    return [
      new AllDifferent(...cells),
      new Given(flag, 1, 2),
      new Or([
        new And([new Given(flag, 1), new Sum(20, ...cells)]),
        new And([new Given(flag, 2), new Sum(22, ...cells)]),
      ]),
    ];
  }).flat();
  return [
    flags,
    ...perCage,
    new Or([new Sum(4, ...flagCells), new Sum(5, ...flagCells)]),
  ];
}

return [
  new Shape('9x9'),

  ...letterGroup('H', 'h-cage total flags (1=20, 2=22)', hCages),
  ...letterGroup('N', 'n-cage total flags (1=20, 2=22)', nCages),
  ...letterGroup('Y', 'y-cage total flags (1=20, 2=22)', yCages),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
