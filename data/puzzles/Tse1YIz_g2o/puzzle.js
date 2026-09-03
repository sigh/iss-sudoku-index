// Title: What's Literally Eating Gilbert Grape?
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=Tse1YIz_g2o
// Source: https://app.crackingthecryptic.com/sudoku/qnjrtqbr7j

// Normal sudoku. Every cell is either a zombie or a human, carried in the VZ
// overlay as HUMAN or ZOMBIE. No 2x2 area of cells is all zombies or all
// humans. A cell is infected (becomes a zombie) when it is orthogonally
// adjacent to a zombie with a higher digit, or when it holds 9 and is
// orthogonally adjacent to a zombie holding 1. The circled cell R3C5 is
// patient zero and is a zombie; the infections of all other zombies trace back
// to patient zero.
//
// Omitted: the "trace back to patient zero" rule is encoded only by its local
// consequence -- every zombie other than patient zero has an orthogonally
// adjacent zombie that infects it. The global half is not encoded: because a 1
// infects a 9, the infection relation has cycles, so a set of zombies that each
// infect the next around a cycle satisfies the local condition while reaching
// nothing back to R3C5.

const HUMAN = 1;
const ZOMBIE = 2;

// The single overlay in the source is a white circle on R3C5.
const PATIENT_ZERO = 'R3C5';

// Given digits, row by row from the printed grid ('.' = empty).
const givenRows = [
  '.........',
  '.........',
  '.........',
  '.........',
  '..6..3.2.',
  '958726341',
  '785942613',
  '.........',
  '.........',
];

const graph = cellGraph('9x9');
const infection = graph.makeOverlay('VZ');

const givens = givenRows.flatMap((row, r) => [...row].flatMap(
  (ch, c) => ch === '.' ? [] : [new Given(makeCellId(r + 1, c + 1), +ch)]));

// Each cell is one of exactly two states; the overlay otherwise inherits the
// grid's 1-9 range.
const stateDomain = infection.makeReplicate(
  new Given(infection.cells()[0], HUMAN, ZOMBIE));

// No 2x2 area is all zombies or all humans, i.e. each 2x2 holds both states.
const noMonochrome2x2 = graph.cells()
  .map(topLeft => graph.block(topLeft, 2, 2))
  .filter(block => block !== null)
  .map(block => new ContainAtLeast(
    `${HUMAN}_${ZOMBIE}`, ...infection.at(block)));

// A zombie holding `source` infects an orthogonal neighbour holding `target`.
const infects = (source, target) =>
  source > target || (source === 1 && target === 9);

// Scan of [own digit, own state, (neighbour digit, neighbour state) ...] over a
// cell and its orthogonal neighbours. The state carries the cell's own digit,
// whether the cell is a zombie, whether an infecting zombie neighbour has been
// seen yet, and the neighbour digit read but not yet paired with its state.
// Accepting on `found === zombie` enforces both halves at once: a human has no
// infecting zombie neighbour (the infection rules), and a zombie has one (the
// local consequence of tracing back to patient zero).
const infectionSpec = NFA.encodeSpec({
  startState: { phase: 'ownDigit' },
  transition: (s, value) => {
    switch (s.phase) {
      case 'ownDigit':
        return { phase: 'ownState', digit: value };
      case 'ownState':
        if (value !== HUMAN && value !== ZOMBIE) return undefined;
        return {
          phase: 'nbrDigit', digit: s.digit,
          zombie: value === ZOMBIE, found: false,
        };
      case 'nbrDigit':
        return {
          phase: 'nbrState', digit: s.digit, zombie: s.zombie,
          found: s.found, nbrDigit: value,
        };
      case 'nbrState':
        if (value !== HUMAN && value !== ZOMBIE) return undefined;
        return {
          phase: 'nbrDigit', digit: s.digit, zombie: s.zombie,
          found: s.found || (value === ZOMBIE && infects(s.nbrDigit, s.digit)),
        };
    }
  },
  accept: s => s.phase === 'nbrDigit' && s.found === s.zombie,
}, 9);

// Patient zero is exempt: it is a zombie with no infector, and the infection
// rules place no condition on a cell that is already a zombie.
const infectionRules = graph.cells()
  .filter(cell => cell !== PATIENT_ZERO)
  .map(cell => new NFA(
    infectionSpec, 'infection', cell, infection.at(cell),
    ...graph.neighbours(cell).flatMap(n => [n, infection.at(n)])));

return [
  new Shape('9x9'),
  ...givens,
  infection.toVar('zombie'),
  stateDomain,
  new Given(infection.at(PATIENT_ZERO), ZOMBIE),
  ...noMonochrome2x2,
  ...infectionRules,
];
