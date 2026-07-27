// Title: Killer Caves
// Author: Stephen Mason
// Video: https://www.youtube.com/watch?v=-h37tMyYDwI
// Source: https://sudokupad.app/eaox36rsvw

// Normal sudoku plus the one given.
//
// Killer cages: sum + no-repeat for the seven cages with a stated total.
// The two single-cell "cages" (R9C1, R1C1) add nothing on their own (a
// one-cell cage has no sum/uniqueness content), so no Cage constraint is
// emitted for them -- see the "not encoded" note below.
//
// Cave: a shaded/unshaded overlay Var per cell; the unshaded cells (the
// cave) must form one orthogonally-connected region (ConnectedValues).
// "No enclosed shaded cells" (every shaded cell reaches a grid edge through
// other shaded cells) has no ISS primitive today (ConnectedValues only
// supports a single all-or-nothing connected group, not per-component
// border attachment) and is not encoded -- same limitation already recorded
// for this pipeline's other Cave-family puzzles (e.g. n6-I-bEaWiY,
// NGCS6Bffr_4).
//
// "There is exactly one digit that does not appear anywhere in the cave":
// encoded directly. For each digit 1-9 an aux boolean Var records whether
// that digit occurs on some unshaded cell; exactly one of the nine must be
// false.
//
// NOT ENCODED: "digits that appear in a cage also act as cave clues" (a
// cage cell's own digit, if that cell is unshaded, must equal the total
// size of the connected cave). Taking this at face value -- every cage
// cell is a cave clue, and "all cave clues must be a part of the cave" --
// is arithmetically impossible: R1C1 and R9C1 both belong to a cage
// without a stated total (the two cells that most plausibly *are* meant as
// cave clues, per "the value of cages without a given total must be
// determined by the solver" immediately preceding the cave-clue
// sentence), but they sit in the same column (column 1), so forcing them
// to show the identical cave-size digit is a bare column-uniqueness
// violation -- not a reading that can be right regardless of which other
// cage cells also count. No narrower, textually-forced reading picks out
// a consistent subset, so the whole "digit doubles as a cave-size clue"
// mechanic is omitted rather than guessed at.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// --- Killer cages (from the drawn killer-cage clues). ---------------------
const CAGES = [
  { total: 14, cells: ['R5C7', 'R6C6', 'R6C7', 'R7C7'] },
  { total: 6, cells: ['R9C7', 'R9C8'] },
  { total: 8, cells: ['R9C4', 'R9C5'] },
  { total: 9, cells: ['R8C2', 'R8C3'] },
  { total: 13, cells: ['R4C1', 'R4C2'] },
  { total: 14, cells: ['R1C8', 'R1C9'] },
  { total: 21, cells: ['R1C4', 'R2C4', 'R2C5', 'R3C5', 'R3C6'] },
];
const killerCages = CAGES.map(({ total, cells }) => new Cage(total, ...cells));

// --- Cave shading overlay: UNSHADED (the cave) vs SHADED. -----------------
const UNSHADED = 1, SHADED = 2;
const cave = graph.makeOverlay('VC');
const caveDomain = cave.makeReplicate(
  new Given(cave.cells()[0], UNSHADED, SHADED));

// --- "Exactly one digit never appears on an unshaded cell." --------------
// occurs.cell(d) declares ABSENT/PRESENT for digit d. The NFA reads
// [declaredValue, then (digit, shade) for every grid cell in turn] and
// accepts only when the declared value matches whether d was actually
// found on some unshaded cell.
const ABSENT = 1, PRESENT = 2;
const occurs = new Var('CD', 'digit occurs on an unshaded cell', '9');

const occursSpec = (digit) => NFA.encodeSpec({
  startState: { phase: 'declared' },
  transition: (state, value) => {
    if (state.phase === 'declared') {
      return { phase: 'digit', declared: value, found: false };
    }
    if (state.phase === 'digit') {
      return { phase: 'shade', declared: state.declared, found: state.found, digit: value };
    }
    // phase === 'shade'
    const found = state.found || (state.digit === digit && value === UNSHADED);
    return { phase: 'digit', declared: state.declared, found };
  },
  accept: (state) =>
    state.phase === 'digit' &&
    ((state.found && state.declared === PRESENT) ||
      (!state.found && state.declared === ABSENT)),
}, geometry.numValues);

const digitOccursRules = Array.from({ length: 9 }, (_, i) => i + 1).flatMap(digit => {
  const outCell = occurs.cell(digit);
  return [
    new Given(outCell, ABSENT, PRESENT),
    new NFA(
      occursSpec(digit),
      `cave-occurs-${digit}`,
      outCell,
      ...gridCells.flatMap(cell => [cell, cave.at(cell)]),
    ),
  ];
});
// Exactly one ABSENT(1) and eight PRESENT(2): 1*1 + 8*2 = 17.
const exactlyOneMissing = new Sum(17, ...occurs.cells());

return [
  new Shape('9x9'),
  new Given('R7C4', 8),
  ...killerCages,
  cave.toVar('cave shading'),
  caveDomain,
  new ConnectedValues('VC', UNSHADED),
  occurs,
  ...digitOccursRules,
  exactlyOneMissing,
];
