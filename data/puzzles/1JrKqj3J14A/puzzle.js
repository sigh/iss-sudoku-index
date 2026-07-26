// Title: Lost Village
// Author: .proxz14
// Video: https://www.youtube.com/watch?v=1JrKqj3J14A
// Source: https://sudokupad.app/cm62bq81c2
//
// Normal sudoku rules apply. A white dot between two cells means those
// digits are consecutive (WhiteDot). The grid has 31 cages, each one of
// four unlabelled types; the type of every cage is something to deduce:
//   Killer  : digits sum to exactly the corner value V.       (exactly one)
//   Suspect : digits sum to V +/- 1.
//   Framed  : digits sum to V +/- 2.
//   Innocent: digits sum at least 10 away from V.
// Digits in a cage never repeat, regardless of its type. Each of the 4
// types appears at least once, and there is exactly one killer cage.
// The fog reveal is UI only and is not modelled; the one exception is a
// real logical fact the rules state outright: cages fully uncovered at
// the same stage share the same border colour, and the fog never
// uncovers two same-type cages at once (including the two starting
// cages) -- so cages sharing a colour must have pairwise different
// types. That is encoded below as an AllDifferent over each colour
// group's type Var. Two cages carry no border colour (drawn plain, i.e.
// each was revealed alone); no claim is made about them.

// Cage table: cells, corner value, and border-colour group letter, as
// drawn. Every cage is drawn twice -- a plain outline plus a coloured
// duplicate over the same cells for its fog-reveal stage -- so this list
// is already de-duplicated to one row per cage. Group '-' = no colour.
const CAGES = [
  { cells: ['R1C1', 'R1C2'], value: 18, group: 'A' },
  { cells: ['R1C3', 'R1C4'], value: 16, group: 'A' },
  { cells: ['R1C5'], value: 8, group: 'B' },
  { cells: ['R1C7', 'R1C8', 'R1C9'], value: 25, group: 'C' },
  { cells: ['R2C1', 'R2C2', 'R2C3'], value: 15, group: 'D' },
  { cells: ['R2C4', 'R3C4'], value: 18, group: '-' },
  { cells: ['R2C5', 'R2C6', 'R2C7', 'R3C5'], value: 9, group: 'E' },
  { cells: ['R2C8', 'R2C9'], value: 10, group: 'F' },
  { cells: ['R3C1', 'R3C2'], value: 6, group: 'G' },
  { cells: ['R3C3'], value: 3, group: 'H' },
  { cells: ['R3C6', 'R3C7'], value: 13, group: 'I' },
  { cells: ['R3C9', 'R4C9', 'R5C7', 'R5C8', 'R5C9'], value: 16, group: 'J' },
  { cells: ['R4C1', 'R4C2', 'R4C3'], value: 6, group: 'K' },
  { cells: ['R4C5', 'R4C6', 'R5C5', 'R5C6'], value: 31, group: 'L' },
  { cells: ['R4C7', 'R4C8'], value: 17, group: 'K' },
  { cells: ['R5C1'], value: 7, group: 'I' },
  { cells: ['R5C2', 'R5C3'], value: 12, group: 'J' },
  { cells: ['R5C4', 'R6C4', 'R6C5', 'R6C6'], value: 8, group: 'L' },
  { cells: ['R6C1', 'R6C2', 'R6C3'], value: 22, group: 'M' },
  { cells: ['R6C7', 'R6C8', 'R6C9'], value: 22, group: 'M' },
  { cells: ['R7C1', 'R7C2'], value: 11, group: 'B' },
  { cells: ['R7C3', 'R8C3', 'R9C3'], value: 9, group: 'N' },
  { cells: ['R7C4', 'R8C4', 'R9C4'], value: 9, group: '-' },
  { cells: ['R7C5', 'R7C6', 'R8C5'], value: 10, group: 'D' },
  { cells: ['R7C7', 'R8C6', 'R8C7', 'R9C7'], value: 21, group: 'G' },
  { cells: ['R7C8', 'R8C8'], value: 4, group: 'C' },
  { cells: ['R7C9'], value: 3, group: 'E' },
  { cells: ['R8C1', 'R9C1', 'R9C2'], value: 17, group: 'F' },
  { cells: ['R8C9'], value: 5, group: 'N' },
  { cells: ['R9C5', 'R9C6'], value: 14, group: 'H' },
  { cells: ['R9C8', 'R9C9'], value: 24, group: 'G' },
];

// White dots (edge overlays: white fill, black border, rounded), between
// R5C5/R5C6, R3C7/R4C7, and R7C1/R8C1.
const WHITE_DOTS = [
  ['R5C5', 'R5C6'],
  ['R3C7', 'R4C7'],
  ['R7C1', 'R8C1'],
];

// Type var: 1=Killer 2=Suspect 3=Framed 4=Innocent. One NFA per cage reads
// the cage's own cells (accumulating their sum) then its type Var, and
// accepts only the (sum, type) combination the rule defines for that type
// -- this is what ties the discovered type to the cage's actual digits.
// `done` caps the automaton at exactly cageSize+1 reads; without it the
// compiler treats the state as reachable indefinitely and blows its limit.
function cageTypeNFA(cageSize, target) {
  return NFA.encodeSpec({
    startState: { sum: 0, i: 0, done: false },
    transition: (state, value) => {
      if (state.done) return undefined;
      if (state.i < cageSize) {
        return { sum: state.sum + value, i: state.i + 1, done: false };
      }
      const diff = state.sum - target;
      let ok = false;
      if (value === 1) ok = diff === 0;
      else if (value === 2) ok = Math.abs(diff) === 1;
      else if (value === 3) ok = Math.abs(diff) === 2;
      else if (value === 4) ok = Math.abs(diff) >= 10;
      if (!ok) return undefined;
      return { sum: state.sum, i: state.i + 1, done: true };
    },
    accept: state => state.done === true,
  }, 9);
}

// A single-cell cage's type only relates two cells (its one cell and its
// type Var), so that case is a Pair, not a one-cell-long NFA.
function cageTypePair(target) {
  return Pair.fnToKey((cellValue, type) => {
    const diff = cellValue - target;
    if (type === 1) return diff === 0;
    if (type === 2) return Math.abs(diff) === 1;
    if (type === 3) return Math.abs(diff) === 2;
    if (type === 4) return Math.abs(diff) >= 10;
    return false;
  }, 9);
}

const typeVar = new Var('VT', 'cage type', CAGES.length);
const typeCell = i => typeVar.cell(i + 1);

const cageConstraints = CAGES.flatMap((cage, i) => [
  // "Digits in a cage ... can't repeat" -- true of every type.
  ...(cage.cells.length > 1 ? [new AllDifferent(...cage.cells)] : []),
  cage.cells.length === 1
    ? new Pair(cageTypePair(cage.value), 'cage type', cage.cells[0], typeCell(i))
    : new NFA(cageTypeNFA(cage.cells.length, cage.value), 'cage type',
      ...cage.cells, typeCell(i)),
]);

// Restrict every type Var to the 4 defined types.
const typeDomains = typeVar.cells().map(v => new Given(v, 1, 2, 3, 4));

// Colour groups: cages fully uncovered at the same stage never share a
// type (see header). One AllDifferent per colour, over that colour's
// cages' type Vars.
const groupLetters = [...new Set(CAGES.map(c => c.group).filter(g => g !== '-'))];
const groupConstraints = groupLetters.map(letter => {
  const cells = CAGES
    .map((c, i) => (c.group === letter ? typeCell(i) : null))
    .filter(Boolean);
  return new AllDifferent(...cells);
});

const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  typeVar,
  ...typeDomains,
  ...whiteDots,
  ...cageConstraints,
  ...groupConstraints,
  // Exactly one killer cage; every other type appears at least once.
  new ContainExact('1', ...typeVar.cells()),
  new ContainAtLeast('2_3_4', ...typeVar.cells()),
];
