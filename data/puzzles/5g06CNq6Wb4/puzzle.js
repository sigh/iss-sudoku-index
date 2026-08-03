// Title: Stack 'em Up, Knock 'em Down
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=5g06CNq6Wb4
// Source: https://sudokupad.app/ivybocixpa

// Normal sudoku. Kropki: white dots (WhiteDot, consecutive) and black dots
// (BlackDot, 1:2 ratio); "not all dots are necessarily given" means only
// that no negative Kropki inference applies -- absence of a dot implies
// nothing, so no StrictKropki-style constraint is added.
// JENGA blocks are killer cages (distinct digits). A block with a numeric
// total sums to that number. A block whose total is replaced by one of the
// letters J/E/N/G/A shares its (solver-found) total with every other block
// carrying that same letter, and the letters' totals increase alphabetically:
// A < E < G < J < N (all strict, per the rules' own "A is less than E").
// Two blocks are drawn "fallen" -- rotated 45 degrees over a 2x2 footprint --
// and the rules note that such a block's cage (and any dot on it) covers only
// the two cells on its diagonal. Per the fixed SudokuPad/f-puzzles overlay
// convention (`angle` rotates a glyph/shape clockwise, degrees, y-down
// canvas), rotating each footprint's plain horizontal 2-cell block 45
// degrees clockwise swings it onto the top-left-to-bottom-right diagonal;
// this also matches the "A" total text, itself rotated 45 degrees and
// anchored over the footprint's top row (i.e. at its top-left corner), and
// the rule that a total is written "in the top left corner of the block".
// One fallen block's diagonal also carries a black Kropki dot, drawn as a
// free-floating `circle` overlay rather than through the normal `ratio` tool
// (see note at `blackDotKey` below for why).

const whiteDots = [
  ['R1C3', 'R1C4'], ['R1C7', 'R1C8'], ['R2C3', 'R2C4'], ['R3C7', 'R3C6'],
  ['R4C4', 'R4C5'], ['R5C6', 'R5C5'], ['R5C9', 'R6C9'], ['R6C3', 'R6C2'],
  ['R8C3', 'R8C4'], ['R7C4', 'R7C3'], ['R9C3', 'R9C4'], ['R7C5', 'R7C6'],
]; // fpuzzles `difference` array (Kropki consecutive)

const blackDots = [
  ['R7C9', 'R8C9'], ['R8C6', 'R8C5'], ['R5C3', 'R5C4'], ['R6C5', 'R6C4'],
  ['R1C6', 'R1C5'], ['R4C6', 'R4C7'], ['R3C4', 'R3C5'],
]; // fpuzzles `ratio` array (Kropki 1:2)

// JENGA blocks with a numeric total (from the `cage` array's numeric values).
const numberCages = [
  [5, ['R1C7', 'R1C8']],
  [5, ['R9C3', 'R9C4']],
  [5, ['R2C6', 'R2C7']],
  [9, ['R4C6', 'R4C7']],
  [11, ['R5C5', 'R5C6']],
];

// JENGA blocks with a letter total, grouped by letter (from the `cage`
// array's letter values). The last "A" entry is the fallen block at the
// R8C1/R8C2/R9C1/R9C2 footprint; its total is a `text` overlay reading "A"
// (see header note for the diagonal derivation), not a `cage` entry.
const letterCages = {
  A: [
    ['R8C3', 'R8C4', 'R8C5', 'R8C6'],
    ['R6C2', 'R6C3', 'R6C4', 'R6C5'],
    ['R5C1', 'R5C2'],
    ['R5C3', 'R5C4'],
    ['R8C1', 'R9C2'],
  ],
  E: [
    ['R9C5', 'R9C6'],
    ['R7C5', 'R7C6'],
    ['R2C2', 'R2C3', 'R2C4'],
  ],
  G: [
    ['R7C3', 'R7C4'],
    ['R6C7', 'R6C8'],
    ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
    ['R4C4', 'R4C5'],
  ],
  J: [
    ['R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ],
  N: [
    ['R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ],
};

// The other fallen block (R8C7/R8C8/R9C7/R9C8 footprint): no total appears
// anywhere in the payload for it, so it is a real block (still
// all-different) with no sum. Diagonal derived the same way as the "A"
// fallen block above. It also carries a solid black dot (fill/outline
// #000000, sized like the puzzle's other Kropki dots, unlike the much wider
// cage-outline `rectangle` overlays) drawn at the footprint's centre: a
// black Kropki dot the standard 2-cell `ratio` tool cannot place, since its
// two cells are diagonal rather than orthogonally adjacent, so the author
// drew it as a free `circle` overlay instead. `BlackDot`/`WhiteDot` validate
// grid adjacency and reject a diagonal pair, so it is encoded with `Pair`
// and the same 2:1 ratio relation instead.
const blankFallenCage = ['R8C7', 'R9C8'];
const blackDotKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);

// A JENGA letter's total can reach 30 (a 4-cell cage's max distinct sum),
// past ISS's Var/Shape value cap of 16, so the letter ordering cannot be
// held in an auxiliary Var. Instead, scan cellsA (adding) then cellsB
// (subtracting) and accept iff the running difference ends negative --
// i.e. sum(cellsA) < sum(cellsB) -- without ever materializing either sum.
function lessThanBySum(name, cellsA, cellsB) {
  const spec = NFA.encodeSpec({
    startState: { diff: 0, secondGroup: false },
    transition: ({ diff, secondGroup }, value) => {
      if (value === SEGMENT_BREAK) return { diff, secondGroup: true };
      return { diff: diff + (secondGroup ? -value : value), secondGroup };
    },
    accept: ({ diff }) => diff < 0,
    maxDepth: cellsA.length + cellsB.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(spec, name, cellsA, cellsB);
}

// One representative cage per letter (the smallest, to keep the ordering
// NFAs' state count down) -- any cage of that letter works equally, since
// `letterEquality` below ties every same-letter cage to the same total.
const letterReps = Object.fromEntries(
  Object.entries(letterCages).map(([letter, cages]) =>
    [letter, [...cages].sort((a, b) => a.length - b.length)[0]]));

const letterCageAllDifferent = Object.values(letterCages).flat()
  .map(cells => new AllDifferent(...cells));

// Every cage sharing a letter must have the same total.
const letterEquality = Object.values(letterCages)
  .filter(cages => cages.length > 1)
  .map(cages => new EqualSum(...cages));

const letterOrder = ['A', 'E', 'G', 'J', 'N'];
const letterOrdering = letterOrder.slice(1).map((letter, i) => lessThanBySum(
  `${letterOrder[i]}_lt_${letter}`,
  letterReps[letterOrder[i]],
  letterReps[letter]));

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...numberCages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...letterCageAllDifferent,
  ...letterEquality,
  ...letterOrdering,
  new AllDifferent(...blankFallenCage),
  new Pair(blackDotKey, 'fallen block diagonal ratio', ...blankFallenCage),
];
