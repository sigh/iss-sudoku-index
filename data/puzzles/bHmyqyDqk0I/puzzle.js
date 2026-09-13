// Title: Mexican Standoff
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=bHmyqyDqk0I
// Source: https://sudokupad.app/db1522df7f

// Normal Killer Sudoku rules apply (standard 3x3 boxes, digits do not repeat
// in a cage, no cage prints a total). Every cell also takes one of three
// colours A/B/C: each cage is monochrome, each colour's cells form one
// orthogonally-connected region, and no 2x2 block of the grid is
// monochrome. The colour of six cells is given (drawn underlays). Every
// cage's own (unprinted) digit total is pairwise distinct from every other
// cage's total, and cages sharing a colour share their total's remainder
// mod 3 (the only reading an all-different killer cage of size > 3 can
// satisfy, since a shared *digit* remainder mod 3 admits at most 3 distinct
// digits). The three cages whose corner shows a colour letter instead of a
// number total to the count of grid cells holding that colour.
//
// Three of the 81 cells (R7C8, R9C7, R9C8) are drawn in no cage at all --
// real geometry, not an omission -- so they carry no cage-total or
// same-colour-cage constraint; they still participate in every global rule
// (Sudoku, colouring, connectivity, no-2x2).

const graph = cellGraph('9x9');

// [...cells] per drawn cage, transcribed from the puzzle's cage geometry.
// `label` is the colour letter drawn in the three cages whose corner shows
// A/B/C instead of a printed total; null for the other 22.
const cages = [
  { label: null, cells: ['R6C1'] },
  { label: null, cells: ['R6C5', 'R7C5', 'R8C5'] },
  { label: null, cells: ['R5C5', 'R5C6'] },
  { label: null, cells: ['R5C7', 'R6C7', 'R7C7'] },
  { label: null, cells: ['R7C3', 'R8C3'] },
  { label: null, cells: ['R6C6'] },
  { label: null, cells: ['R1C9'] },
  { label: null, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6'] },
  { label: null, cells: ['R3C3', 'R3C4', 'R4C2', 'R4C3'] },
  { label: null, cells: ['R5C2'] },
  { label: null, cells: ['R3C2'] },
  { label: null, cells: ['R2C2', 'R2C3', 'R2C4', 'R2C5'] },
  { label: null, cells: ['R3C5', 'R4C5'] },
  { label: null, cells: ['R4C4', 'R5C4'] },
  { label: null, cells: ['R5C3'] },
  { label: null, cells: ['R4C6'] },
  { label: null, cells: ['R2C7', 'R2C8', 'R3C6', 'R3C7', 'R4C7', 'R4C8', 'R5C8', 'R6C8'] },
  { label: null, cells: ['R7C1', 'R7C2', 'R8C1'] },
  { label: null, cells: ['R8C2', 'R9C1', 'R9C2', 'R9C3'] },
  { label: null, cells: ['R8C7', 'R8C8'] },
  { label: null, cells: ['R6C9', 'R7C9', 'R8C9', 'R9C9'] },
  { label: null, cells: ['R2C9', 'R3C8', 'R3C9', 'R4C9', 'R5C9'] },
  { label: 'A', cells: ['R2C1', 'R3C1', 'R4C1', 'R5C1'] },
  { label: 'B', cells: ['R6C2', 'R6C3', 'R6C4'] },
  { label: 'C', cells: ['R7C4', 'R7C6', 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6'] },
];

// Colour underlays (payload `underlays`, text A/B/C on a rounded-rect at the
// named cell): the colour of these six cells is given.
const COLOR_A = 1, COLOR_B = 2, COLOR_C = 3;
const colorLetterValue = { A: COLOR_A, B: COLOR_B, C: COLOR_C };
const givenColorCells = [
  ['R1C9', 'A'], ['R2C1', 'A'],
  ['R4C6', 'B'], ['R6C2', 'B'],
  ['R3C2', 'C'], ['R7C4', 'C'],
];

const eqKey = Pair.fnToKey((a, b) => a === b, 9);
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);

// -- Colour layer ---------------------------------------------------------
// One Var per grid cell holding A/B/C.
const color = graph.makeOverlay('VCOL');
const colorAt = cell => color.at(cell);
const colorDomain = color.makeReplicate(
  new Given(colorAt('R1C1'), COLOR_A, COLOR_B, COLOR_C));

const colorGivens = givenColorCells.map(([cell, letter]) =>
  new Given(colorAt(cell), colorLetterValue[letter]));

// Each colour's cells form one connected region. The three single-value
// sets on one layer are automatically disjoint (a cell holds one colour),
// and each is non-empty because of the givens above.
const colorConnectivity = [COLOR_A, COLOR_B, COLOR_C]
  .map(v => new ConnectedValues('VCOL', v));

// No 2x2 block of the grid is one solid colour. "Not all four equal" is
// "some edge of a path spanning the four cells differs" -- nw-ne, ne-se,
// se-sw already span all four, so a fourth pair (sw-nw) would be redundant.
const no2x2 = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const [nw, ne, sw, se] = colorAt(graph.block(makeCellId(r, c), 2, 2));
    no2x2.push(new Or([
      new Pair(neqKey, '2x2 nw-ne', nw, ne),
      new Pair(neqKey, '2x2 ne-se', ne, se),
      new Pair(neqKey, '2x2 se-sw', se, sw),
    ]));
  }
}

// Each cage is one solid colour: SameValues with one set per cell (set size
// 1) over the cage's colour cells forces them all equal. Singletons need no
// constraint.
const cageMonochrome = cages
  .filter(({ cells }) => cells.length > 1)
  .map(({ cells }) => new SameValues(cells.length, ...colorAt(cells)));

// -- Cage digit rules -------------------------------------------------------
const cageAllDifferent = cages.map(({ cells }) => new AllDifferent(...cells));

// -- Cage total bookkeeping: hi/lo/residue -----------------------------------
// A cage total can reach 45 (the 9-cell cage forces exactly 45, by
// pigeonhole over 9 distinct digits 1-9), past both the 9-value grid domain
// and the 16-value Shape cap, so per "Aggregate Cage-Total Comparisons" the
// total is split base-9 into two digits (hi, lo with total = 9*hi + lo) held
// on their own Var cells, plus a third digit for the total's remainder mod
// 3. One NFA per cage reads the cage's own cells (accumulating their sum)
// then its own hi/lo/residue cells, rejecting any hi/lo/residue value that
// isn't the true floor(sum/9), sum%9, sum%3 (each shifted +1, since Var
// cells have no zero value) -- so each is a pure function of the cage's
// digits and cannot multiply the solution count. Comparing two totals for
// equality/distinctness then reduces to comparing (hi, lo) pairs, and
// same-remainder to comparing residue cells directly -- no cage total is
// ever materialized as a single value.
const hi = new Var('HI', 'cage total hi digit (total = 9*(hi-1) + (lo-1))', cages.length);
const lo = new Var('LO', 'cage total lo digit', cages.length);
const res = new Var('RES', 'cage total mod 3, shifted +1', cages.length);

function cageTotalSpec(n) {
  return NFA.encodeSpec({
    startState: { idx: 0, sum: 0 },
    transition: ({ idx, sum }, value) => {
      if (idx < n) return { idx: idx + 1, sum: sum + value };
      if (idx === n) return (value - 1) === Math.floor(sum / 9) ? { idx: idx + 1, sum } : undefined;
      if (idx === n + 1) return (value - 1) === (sum % 9) ? { idx: idx + 1, sum } : undefined;
      if (idx === n + 2) return (value - 1) === (sum % 3) ? { idx: idx + 1, sum } : undefined;
      return undefined;
    },
    accept: ({ idx }) => idx === n + 3,
    maxDepth: n + 3,
  }, 9);
}

const cageTotalNFAs = cages.map(({ cells }, i) =>
  new NFA(cageTotalSpec(cells.length), 'cage total (hi, lo, mod3)',
    ...cells, hi.cell(i + 1), lo.cell(i + 1), res.cell(i + 1)));

// Every cage total is pairwise distinct: two totals agree iff both their hi
// and lo digits agree, so distinctness is "hi differs, or lo differs".
const cageTotalsDistinct = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    cageTotalsDistinct.push(new Or([
      new Pair(neqKey, 'total hi differs', hi.cell(i + 1), hi.cell(j + 1)),
      new Pair(neqKey, 'total lo differs', lo.cell(i + 1), lo.cell(j + 1)),
    ]));
  }
}

// Cages sharing a colour share their total's remainder mod 3: for every
// pair, either their (representative) colours differ, or their residues
// agree. A cage's first cell stands in for its colour since cageMonochrome
// already forces every cell in the cage to agree.
const cageColorRep = cages.map(({ cells }) => colorAt(cells[0]));
const cageResidueByColor = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    cageResidueByColor.push(new Or([
      new Pair(neqKey, 'cage colours differ', cageColorRep[i], cageColorRep[j]),
      new Pair(eqKey, 'same-colour cages: same total mod 3', res.cell(i + 1), res.cell(j + 1)),
    ]));
  }
}

// -- Lettered cages: total equals the count of that colour on the grid ------
// One indicator overlay per colour: INDx cell is TRUE iff the paired grid
// cell's colour is x, else FALSE -- a deterministic function of the colour
// layer (the Pair below), so it cannot multiply the solution count either.
// sum(indicator cells) = 81 (each of the 81 cells contributes FALSE=1) plus
// one extra per TRUE cell, so (count of colour x) = sum(indicator) - 81;
// tying a lettered cage's own digit sum to that count is then the single
// linear equation below.
const FALSE = 1, TRUE = 2;
const allGridCells = graph.cells();
// Overlay prefixes, spelled as plain strings (not built from the letter) so
// there is nothing here shaped like an internal `V<prefix><n>` member id.
const INDICATOR_PREFIX = { A: 'VINDA', B: 'VINDB', C: 'VINDC' };

function makeColorCount(letter, colorValue) {
  const overlay = graph.makeOverlay(INDICATOR_PREFIX[letter]);
  const at = cell => overlay.at(cell);
  const domain = overlay.makeReplicate(new Given(at('R1C1'), FALSE, TRUE));
  const key = Pair.fnToKey((c, ind) => (c === colorValue) === (ind === TRUE), 9);
  const indicatorCells = at(allGridCells);
  const links = allGridCells.map((cell, i) =>
    new Pair(key, `colour ${letter} indicator`, colorAt(cell), indicatorCells[i]));
  return {
    varConstraint: overlay.toVar(`colour ${letter} indicator`),
    indicatorCells,
    domain,
    links,
  };
}

const colorCounts = {
  A: makeColorCount('A', COLOR_A),
  B: makeColorCount('B', COLOR_B),
  C: makeColorCount('C', COLOR_C),
};

const letterCageSums = cages
  .filter(({ label }) => label)
  .map(({ label, cells }) => {
    const { indicatorCells } = colorCounts[label];
    // sum(cage cells) - sum(indicator cells) = -81
    // <=> sum(cage cells) = sum(indicator cells) - 81 = count of colour `label`.
    return new Sum(-81, ...cells, ...indicatorCells.map(c => [c, -1]));
  });

return [
  new Shape('9x9'),
  ...cageAllDifferent,
  color.toVar('colour (A/B/C)'),
  colorDomain,
  ...colorGivens,
  ...colorConnectivity,
  ...no2x2,
  ...cageMonochrome,
  hi, lo, res,
  ...cageTotalNFAs,
  ...cageTotalsDistinct,
  ...cageResidueByColor,
  ...Object.values(colorCounts).flatMap(
    ({ varConstraint, domain, links }) => [varConstraint, domain, ...links]),
  ...letterCageSums,
];
