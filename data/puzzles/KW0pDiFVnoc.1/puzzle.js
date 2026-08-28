// Title: Poker Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=KW0pDiFVnoc
// Source: https://cracking-the-cryptic.web.app/sudoku/R4HpPfGh4g

// Normal sudoku rules apply (Shape('9x9') default row/column/box). 1 is
// treated as a poker ace, ranking low only inside the straight 1-2-3-4-5.
//
// The 13 five-cell cages are poker hands; each cell also carries a fixed
// suit symbol (heart/diamond/club/spade), drawn as an overlay and read from
// the puzzle's own geometry, not chosen by the solver. "Digits MAY repeat in
// a cage but cards may not repeat in a cage": for every pair of a cage's
// cells that share a drawn suit, their digits must differ (AllDifferent over
// each same-suit subgroup). Suits may repeat freely elsewhere in the grid.
//
// A cage's suit composition is fixed geometry, so whether it CAN be a flush
// is known in advance, not solved for: cages 0, 1, 7 and 8 are drawn with
// all five cells the same suit (flush-eligible, and thereby forced
// all-different by the card rule above); the rest mix suits and can never be
// a flush or straight flush. Each cage gets a poker-category variable
// (1=high card, 2=pair, 3=two pair, 4=three of a kind, 5=straight,
// 6=flush, 7=full house, 8=four of a kind, 9=straight flush) restricted to
// its eligible categories and pinned to the one whose defining property the
// cage's digits actually satisfy.
//
// A chevron ("greater-than symbol joining two cages") sits between two
// cage cells; its two-pronged open end touches the higher-ranking cage's
// cell, its point touches the lower-ranking cage's cell (read from the
// drawn line geometry -- the standard ">" convention). The 12 chevrons form
// a single chain touching every cage exactly once:
//   0>1>6>7>8>9>10>11>12>5>4>3>2
//
// Omission: only the category is compared, not the full in-category
// tie-break (pair/kicker value with ace ranking high outside a straight).
// That tie-break is not encoded.

const cages = [
  // label 0..12; cells and each cell's fixed suit (H/D/C/S), from the
  // puzzle's cage geometry and suit overlays.
  {cells: ['R1C1', 'R2C1', 'R3C1', 'R2C2', 'R1C2'],
   suits: ['H', 'H', 'H', 'H', 'H']}, // 0
  {cells: ['R4C2', 'R3C2', 'R3C3', 'R1C3', 'R2C3'],
   suits: ['S', 'S', 'S', 'S', 'S']}, // 1
  {cells: ['R1C5', 'R2C5', 'R2C4', 'R2C6', 'R3C6'],
   suits: ['C', 'H', 'H', 'H', 'H']}, // 2
  {cells: ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R1C8'],
   suits: ['D', 'D', 'C', 'C', 'D']}, // 3
  {cells: ['R4C9', 'R3C9', 'R2C9', 'R1C9', 'R3C8'],
   suits: ['D', 'S', 'S', 'S', 'S']}, // 4
  {cells: ['R4C6', 'R4C7', 'R5C7', 'R5C8', 'R5C9'],
   suits: ['C', 'H', 'H', 'H', 'H']}, // 5
  {cells: ['R5C3', 'R4C3', 'R4C4', 'R3C4', 'R3C5'],
   suits: ['H', 'H', 'C', 'D', 'D']}, // 6
  {cells: ['R5C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1'],
   suits: ['D', 'D', 'D', 'D', 'D']}, // 7
  {cells: ['R6C3', 'R7C3', 'R7C2', 'R8C3', 'R9C3'],
   suits: ['C', 'C', 'C', 'C', 'C']}, // 8
  {cells: ['R6C4', 'R7C4', 'R7C5', 'R8C5', 'R8C6'],
   suits: ['C', 'H', 'H', 'H', 'H']}, // 9
  {cells: ['R4C5', 'R5C5', 'R6C5', 'R6C6', 'R5C6'],
   suits: ['H', 'S', 'S', 'S', 'S']}, // 10
  {cells: ['R7C6', 'R7C7', 'R6C7', 'R8C7', 'R8C8'],
   suits: ['D', 'C', 'C', 'C', 'H']}, // 11
  {cells: ['R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
   suits: ['S', 'D', 'D', 'D', 'D']}, // 12
];

// The chevron chain, read from the drawn "greater than" glyphs: apex end is
// the lower-ranking cage. Order: A > B.
const chainEdges = [
  [0, 1], [1, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 5], [5, 4], [4, 3], [3, 2],
];

// Card uniqueness: within each cage, cells sharing a drawn suit must show
// different digits (their suit already differs, so equal digits would be
// the same card twice).
const cardUniqueness = cages.flatMap(({cells, suits}) => {
  const bySuit = new Map();
  suits.forEach((suit, i) => {
    if (!bySuit.has(suit)) bySuit.set(suit, []);
    bySuit.get(suit).push(cells[i]);
  });
  return Array.from(bySuit.values())
    .filter(group => group.length > 1)
    .map(group => new AllDifferent(...group));
});

// Multiplicity classes over a 5-cell hand (order-independent digit
// histogram), adapted from the same construction as data/scripts'
// Pokerface: a running sorted (digit, count) list, rejecting as soon as any
// partial count exceeds the target pattern's largest group.
const multiplicityMachine = target => NFA.encodeSpec({
  startState: {counts: []},
  transition: ({counts}, value) => {
    const next = counts.map(([digit, count]) => [digit, count]);
    const entry = next.find(([digit]) => digit === value);
    if (entry) entry[1] += 1;
    else next.push([value, 1]);
    next.sort(([a], [b]) => a - b);
    if (next.some(([, count]) => count > target[0])) return undefined;
    return {counts: next};
  },
  accept: ({counts}) => {
    const frequencies = counts.map(([, count]) => count).sort((a, b) => b - a);
    return frequencies.join() === target.join();
  },
  maxDepth: 5,
}, 9);

const pairMachine = multiplicityMachine([2, 1, 1, 1]);
const twoPairMachine = multiplicityMachine([2, 2, 1]);
const tripsMachine = multiplicityMachine([3, 1, 1]);
const fullHouseMachine = multiplicityMachine([3, 2]);
const quadsMachine = multiplicityMachine([4, 1]);

// "Not a straight": a 5-cell all-different run is a straight exactly when
// max - min === 4, so only the running min/max need to be carried.
const notConsecutiveMachine = NFA.encodeSpec({
  startState: {min: null, max: null},
  transition: ({min, max}, value) => ({
    min: min === null ? value : Math.min(min, value),
    max: max === null ? value : Math.max(max, value),
  }),
  accept: ({min, max}) => max - min !== 4,
  maxDepth: 5,
}, 9);

// category[i]: the poker category of cage i.
// 1 high card, 2 pair, 3 two pair, 4 three of a kind, 5 straight,
// 6 flush, 7 full house, 8 four of a kind, 9 straight flush.
const category = new Var('HC', 'poker hand category', cages.length);
const categoryCells = category.cells();

function property(kind, cells, name) {
  if (kind === 'highCard') {
    return new And([
      new AllDifferent(...cells),
      new NFA(notConsecutiveMachine, name, ...cells),
    ]);
  }
  if (kind === 'straight') return new Renban(...cells);
  if (kind === 'flush') return new NFA(notConsecutiveMachine, name, ...cells);
  if (kind === 'straightFlush') return new Renban(...cells);
  return new NFA(
    {pair: pairMachine, twoPair: twoPairMachine, trips: tripsMachine,
     fullHouse: fullHouseMachine, quads: quadsMachine}[kind],
    name, ...cells);
}

// category[i] = k only when the property that defines category k holds for
// that cage's digits ("if not k, then no constraint here" via Or). Because
// the listed properties are mutually exclusive and exhaustive over the
// cage's eligible category set, this pins category[i] to the one true value.
const categoryRules = cages.flatMap(({cells, suits}, index) => {
  const isFlushEligible = suits.every(s => s === suits[0]);
  const options = isFlushEligible
    ? [[6, 'flush'], [9, 'straightFlush']]
    : [[1, 'highCard'], [2, 'pair'], [3, 'twoPair'], [4, 'trips'],
       [5, 'straight'], [7, 'fullHouse'], [8, 'quads']];
  const allowedValues = options.map(([k]) => k);
  return options.map(([k, kind]) =>
    new Or([
      new Given(categoryCells[index], ...allowedValues.filter(v => v !== k)),
      property(kind, cells, `cage${index}-${kind}`),
    ]));
});

// Chevron chain: cage A's category must be at least cage B's. This is a
// relaxation of "A's hand beats B's hand": a true win is either a strictly
// higher category, or an equal category won on the (unencoded) in-category
// tie-break. Using ">=" here, rather than ">", keeps every truly-valid grid
// accepted; it only stops enforcing the order between two cages left tied
// on category.
const gtKey = Pair.fnToKey((a, b) => a >= b, 9);
const chevrons = chainEdges.map(([a, b], i) =>
  new Pair(gtKey, `chevron${i}`, categoryCells[a], categoryCells[b]));

return [
  new Shape('9x9'),
  new Given('R1C4', 2),
  new Given('R2C5', 3),
  new Given('R2C7', 6),
  new Given('R4C6', 7),
  new Given('R4C9', 4),
  new Given('R6C4', 9),
  new Given('R7C1', 1),
  new Given('R8C7', 5),
  new Given('R9C1', 8),
  category,
  ...cardUniqueness,
  ...categoryRules,
  ...chevrons,
];
