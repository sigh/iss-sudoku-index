// Title: Poker Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=KW0pDiFVnoc
// Source: https://cracking-the-cryptic.web.app/sudoku/J9rbjm4QnD

// Normal sudoku rules (rows, columns, boxes) apply, encoded by the default
// Shape('9x9') below. Thirteen 5-cell "hands" are drawn on the grid; a
// hand's cells double as poker cards, rank = digit (1 = Ace, 2-9 as
// themselves), suit = the cell's printed symbol (fixed by the art, not a
// solver variable). Digits may repeat within a hand, but the same card
// (same digit and same printed suit) may not repeat within a hand -- cards
// may repeat elsewhere in the grid, so this is scoped per hand, per suit,
// not a whole-hand AllDifferent. A grey chevron straddles the border of
// every adjacent pair of hands: its open (two-legged) end sits against one
// hand, its point against the other, exactly as the two ends of a printed
// ">" sit against the greater and lesser side -- so the open-end hand
// outranks the point-end hand. All thirteen hands are chained by twelve
// such chevrons into one strict total poker-hand order (best to worst).
// Poker ranking (low to high): High Card, One Pair, Two Pair, Three of a
// Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush. Ace
// ranks above 9 for every non-straight comparison (pair/trips/quads rank,
// kickers), but a straight is only 1-2-3-4-5 .. 5-6-7-8-9 -- no wraparound
// through the Ace, matching the rules' 6789A counter-example.

// Hand cells, in the drawn cage order (no provenance ordering is otherwise
// implied -- classification below is order-independent). One entry per
// hand, index 0-12.
const HAND_CELLS = [
  ['R1C1', 'R2C1', 'R3C1', 'R2C2', 'R1C2'],
  ['R4C2', 'R3C2', 'R3C3', 'R1C3', 'R2C3'],
  ['R1C5', 'R2C5', 'R2C4', 'R2C6', 'R3C6'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R1C8'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9', 'R3C8'],
  ['R4C6', 'R4C7', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C3', 'R4C3', 'R4C4', 'R3C4', 'R3C5'],
  ['R5C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1'],
  ['R6C3', 'R7C3', 'R7C2', 'R8C3', 'R9C3'],
  ['R6C4', 'R7C4', 'R7C5', 'R8C5', 'R8C6'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C6', 'R5C6'],
  ['R7C6', 'R7C7', 'R6C7', 'R8C7', 'R8C8'],
  ['R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
];

// Printed suit per hand cell, read off the drawn overlay glyph at that
// cell (each cell in a hand carries exactly one suit symbol).
// H = hearts, D = diamonds, C = clubs, S = spades.
const HAND_SUITS = [
  ['H', 'H', 'H', 'H', 'H'],
  ['S', 'S', 'S', 'S', 'S'],
  ['C', 'H', 'H', 'H', 'H'],
  ['D', 'D', 'C', 'C', 'D'],
  ['D', 'S', 'S', 'S', 'S'],
  ['C', 'H', 'H', 'H', 'H'],
  ['H', 'H', 'C', 'D', 'D'],
  ['D', 'D', 'D', 'D', 'D'],
  ['C', 'C', 'C', 'C', 'C'],
  ['C', 'H', 'H', 'H', 'H'],
  ['H', 'S', 'S', 'S', 'S'],
  ['D', 'C', 'C', 'C', 'H'],
  ['S', 'D', 'D', 'D', 'D'],
];

// Ranking chain read off the twelve drawn chevrons:
// [higherHand, lowerHand] per chevron, in the open-end/point-end sense
// described above. This traces a single path through all 13 hands
// (0 > 1 > 6 > 7 > 8 > 9 > 10 > 11 > 12 > 5 > 4 > 3 > 2), which is the
// geometric fact the twelve chevrons draw, not a solved conclusion.
const CHAIN_EDGES = [
  [0, 1], [1, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 5], [5, 4], [4, 3], [3, 2],
];

const GIVENS = [
  ['R1C4', 2], ['R2C5', 3], ['R2C7', 6], ['R4C6', 7], ['R4C9', 4],
  ['R6C4', 9], ['R7C1', 1], ['R8C7', 5], ['R9C1', 8],
];

// ace-high remap into the 1-9 domain, order-preserving: 2..9 -> 1..8,
// Ace(1) -> 9. Used for every rank comparison except a straight's top card
// (which already excludes the Ace-high wraparound by construction).
const aceHigh = d => d === 1 ? 9 : d - 1;

// Classify a 5-card poker hand from its ascending-sorted digits, given
// whether the hand's suits are fixed all-the-same (isFlush is puzzle art,
// not solver state -- baked in per hand below). Returns [category, ...tiebreak]
// as a flat 6-value tuple: category 1-9 in standard poker order, followed by
// five tiebreak slots whose meaning depends on category (unused trailing
// slots are the constant 1 on both sides of any comparison, so they never
// affect a same-category comparison). Every tiebreak value already has the
// ace-high remap applied except a straight's top card, which is a plain 5-9.
function classifyHand(sorted, isFlush) {
  const counts = {};
  for (const d of sorted) counts[d] = (counts[d] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([d, c]) => ({ d: +d, c }))
    .sort((a, b) => b.c - a.c || aceHigh(b.d) - aceHigh(a.d));
  const isStraight = (new Set(sorted)).size === 5 && (sorted[4] - sorted[0] === 4);
  const shape = groups.map(g => g.c).join(',');
  let cat, t = [1, 1, 1, 1, 1];
  if (isStraight && isFlush) {
    cat = 9; t[0] = sorted[4];
  } else if (shape === '4,1') {
    cat = 8; t[0] = aceHigh(groups[0].d); t[1] = aceHigh(groups[1].d);
  } else if (shape === '3,2') {
    cat = 7; t[0] = aceHigh(groups[0].d); t[1] = aceHigh(groups[1].d);
  } else if (isFlush) {
    cat = 6; t = sorted.slice().sort((a, b) => aceHigh(b) - aceHigh(a)).map(aceHigh);
  } else if (isStraight) {
    cat = 5; t[0] = sorted[4];
  } else if (shape === '3,1,1') {
    cat = 4;
    t[0] = aceHigh(groups[0].d); t[1] = aceHigh(groups[1].d); t[2] = aceHigh(groups[2].d);
  } else if (shape === '2,2,1') {
    cat = 3;
    t[0] = aceHigh(groups[0].d); t[1] = aceHigh(groups[1].d); t[2] = aceHigh(groups[2].d);
  } else if (shape === '2,1,1,1') {
    cat = 2; t[0] = aceHigh(groups[0].d);
    const kick = groups.slice(1).map(g => aceHigh(g.d)).sort((a, b) => b - a);
    t[1] = kick[0]; t[2] = kick[1]; t[3] = kick[2];
  } else {
    cat = 1; t = sorted.slice().sort((a, b) => aceHigh(b) - aceHigh(a)).map(aceHigh);
  }
  return [cat, ...t];
}

// NFA spec reading a hand's 5 cells (canonicalized as a sorted-so-far
// multiset -- state {seen: [...]} -- so cell order never matters, bounding
// the state count to the ~2000 sorted 5-or-fewer-digit multisets) then 6
// more cells (the hand's category + 5 tiebreak Vars): once the 5th card is
// read the state collapses to {remaining: classifyHand(...)}, and each
// further read must match the next value of that fixed tuple or the branch
// dies. This is how the Vars are pinned to the poker classification of the
// hand's own cells.
function buildHandNFASpec(isFlush) {
  return {
    startState: { seen: [] },
    transition: (state, value) => {
      if (state.remaining === undefined) {
        const seen = [...state.seen, value].sort((a, b) => a - b);
        if (seen.length === 5) return { remaining: classifyHand(seen, isFlush) };
        return { seen };
      }
      const rem = state.remaining;
      if (rem.length === 0 || value !== rem[0]) return undefined;
      return { remaining: rem.slice(1) };
    },
    accept: (state) => state.remaining !== undefined && state.remaining.length === 0,
  };
}
const HAND_NFA_FLUSH = NFA.encodeSpec(buildHandNFASpec(true), 9);
const HAND_NFA_NOFLUSH = NFA.encodeSpec(buildHandNFASpec(false), 9);

// One 6-cell Var group per hand: [category, T1..T5] as classified above.
// Prefixes are plain letters (Var requires upper-case A-Z): HA..HM for
// hands 0-12.
const VAR_PREFIX = ['HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH', 'HI', 'HJ', 'HK', 'HL', 'HM'];
const HAND_VARS = VAR_PREFIX.map((prefix, i) => new Var(prefix, `hand ${i} rank`, 6));
const handVarCells = i => HAND_VARS[i].cells();

// A hand's suits are fixed puzzle art, so "all one suit" (and therefore
// "flush/straight-flush is reachable") is a known fact per hand, not
// something the solver decides.
const isFlushHand = i => new Set(HAND_SUITS[i]).size === 1;

const handConstraintGroups = HAND_CELLS.map((cells, i) => {
  const varCells = handVarCells(i);
  const nfa = isFlushHand(i) ? HAND_NFA_FLUSH : HAND_NFA_NOFLUSH;
  // No-duplicate-card: within a hand, cells sharing a printed suit must
  // have different digits (same suit + same digit would repeat a card).
  // Group cells by suit; only a same-suit group of >= 2 cells needs it.
  const bySuit = {};
  HAND_SUITS[i].forEach((s, k) => (bySuit[s] = bySuit[s] || []).push(cells[k]));
  const sameSuitAllDifferent = Object.values(bySuit)
    .filter(group => group.length >= 2)
    .map(group => new AllDifferent(...group));
  return [
    HAND_VARS[i],
    new NFA(nfa, `hand ${i}`, ...cells, ...varCells),
    ...sameSuitAllDifferent,
  ];
});

// Strict lexicographic > over two hands' [category, T1..T5] Var tuples:
// compare category first, and only descend into a tiebreak slot once every
// earlier slot tied. A full tie (all 6 slots equal) correctly has no
// accepting branch, since equal-strength hands cannot satisfy "greater".
const gtKey = Pair.fnToKey((a, b) => a > b, 9);
const eqKey = Pair.fnToKey((a, b) => a === b, 9);
function lexGreaterThan(higherCells, lowerCells, i) {
  i = i || 0;
  const gt = new Pair(gtKey, `rank gt ${i}`, higherCells[i], lowerCells[i]);
  if (i === higherCells.length - 1) return gt;
  const eq = new Pair(eqKey, `rank eq ${i}`, higherCells[i], lowerCells[i]);
  return new Or([gt, new And([eq, lexGreaterThan(higherCells, lowerCells, i + 1)])]);
}
const chainConstraints = CHAIN_EDGES.map(
  ([hi, lo]) => lexGreaterThan(handVarCells(hi), handVarCells(lo)));

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  ...handConstraintGroups.flat(),
  ...chainConstraints,
];
