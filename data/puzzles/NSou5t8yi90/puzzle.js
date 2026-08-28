// Title: Dropsies
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=NSou5t8yi90
// Source: https://cracking-the-cryptic.web.app/sudoku/GHQFrF6Dqq

// Rules encoded here:
//  - Normal sudoku: rows, columns and 3x3 boxes each hold 1-9 once (the
//    payload's 9 drawn regions are exactly the standard 3x3 boxes, so no
//    Jigsaw/NoBoxes override is needed).
//  - Killer sudoku: each drawn cage's digits sum to its printed total and
//    hold no repeat.
//  - Dropsies twist ("each killer cage is incomplete having dropped one cell
//    somewhere adjacent to it... even after a dropped cell is included there
//    still cannot be a repeated digit... No cell can be dropped from more
//    than one cage"): every cage's total and no-repeat rule really covers
//    its drawn cells plus exactly one more cell orthogonally adjacent to the
//    drawn shape -- "adjacent" read as orthogonal, matching how the drawn
//    cage shapes are themselves built (orthogonally connected cells). A
//    candidate drop cell is restricted to cells the payload draws in no
//    cage at all: "killer sudoku rules apply" makes cages non-overlapping
//    regions (the 16 printed cages here never overlap each other), so a
//    cell already printed inside a different cage cannot also be this
//    cage's hidden extra member.
//    Which free cell is the real drop, per cage, is left to the solver: a
//    boolean flag per (cage, candidate) pair, exactly one "chosen" per
//    cage, both drives that cage's total/no-repeat and, where two cages
//    could reach the same free cell, keeps their flags from both landing on
//    it (the "no cell dropped from more than one cage" rule).
//  Nothing else is drawn: no lines, dots, or givens in the payload.

const graph = cellGraph('9x9');

// Cages: [total, printed cells], transcribed from the drawn cage outlines.
const cageClues = [
  [10, ['R1C1', 'R2C1', 'R1C2']],
  [43, ['R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4']],
  [4, ['R1C5']],
  [12, ['R1C8', 'R1C9']],
  [20, ['R4C9', 'R5C9']],
  [15, ['R7C8']],
  [10, ['R8C8']],
  [8, ['R9C8', 'R9C9']],
  [20, ['R7C6', 'R8C6', 'R9C6']],
  [36, ['R8C4', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1']],
  [11, ['R5C1', 'R6C1', 'R6C2']],
  [14, ['R6C4', 'R6C5']],
  [22, ['R4C4', 'R4C5']],
  [7, ['R4C6', 'R5C6']],
  [15, ['R3C6']],
  [14, ['R9C3']],
];

const printedCells = new Set(cageClues.flatMap(([, cells]) => cells));

// Every free (unprinted) cell orthogonally adjacent to a cage's drawn shape:
// a candidate for that cage's dropped cell.
const dropCandidates = cageClues.map(([, cells]) => {
  const shape = new Set(cells);
  const candidates = new Set();
  for (const cell of cells) {
    for (const n of graph.neighbours(cell)) {
      if (!shape.has(n) && !printedCells.has(n)) candidates.add(n);
    }
  }
  return [...candidates];
});

// One boolean flag per (cage, candidate) pair: 2 means "this candidate is
// the cage's dropped cell", 1 means it is not.
const totalFlags = dropCandidates.reduce((n, c) => n + c.length, 0);
const flagVar = new Var('DF', 'drop flags', totalFlags);
let flagCursor = 0;
const flagsByCage = dropCandidates.map(cands => {
  const pairs = cands.map((cell, k) => ({ cell, flag: flagVar.cell(flagCursor + k + 1) }));
  flagCursor += cands.length;
  return pairs;
});

// Which flags could claim each free cell -- more than one cage's flag on
// the same cell is exactly the forbidden double drop.
const claimsByCell = new Map();
for (const pairs of flagsByCage) {
  for (const { cell, flag } of pairs) {
    if (!claimsByCell.has(cell)) claimsByCell.set(cell, []);
    claimsByCell.get(cell).push(flag);
  }
}
const sharedCellFlags = [...claimsByCell.values()].filter(flags => flags.length > 1);
const slackVar = new Var('DS', 'drop exclusivity slack', sharedCellFlags.length);

return [
  new Shape('9x9'),
  flagVar,
  slackVar,

  // Every flag cell is boolean-valued: 2 = "on", 1 = "off". The 60 flags are
  // a flat Var list, so a same-sized (6x10) rectangular grid graph -- whose
  // overlay prefix is chosen to name the same cells the Var itself uses --
  // stands in as the Replicate locator.
  cellGraph(6, 10).makeOverlay('VDF').makeReplicate(new Given(flagVar.cell(1), 1, 2)),
  // Same for the slack cells; 17 has no rectangular factoring within ISS's
  // 16-per-side grid cap, so this stays a plain per-cell loop.
  ...slackVar.cells().map(cell => new Given(cell, 1, 2)),

  ...cageClues.flatMap(([total, cells], i) => {
    const pairs = flagsByCage[i];
    return [
      // Exactly one candidate's flag is 2: each flag contributes 1 to the
      // sum, the chosen one contributes an extra 1, so the sum equals
      // candidateCount + 1 only when exactly one flag is 2.
      new Sum(pairs.length + 1, ...pairs.map(p => p.flag)),
      // A chosen candidate's value is folded into the cage's total and
      // no-repeat; an unchosen candidate constrains nothing here.
      ...pairs.map(({ cell, flag }) => new Or([
        new Given(flag, 1),
        new And([new Given(flag, 2), new Cage(total, ...cells, cell)]),
      ])),
    ];
  }),

  // For a free cell reachable by more than one cage, at most one of the
  // competing flags may be "on": flags + slack sum to (competitors + 2)
  // only when 0 or 1 of the flags is chosen (slack in {1, 2}); 2+ chosen
  // would need slack <= 0, outside its domain.
  ...sharedCellFlags.map((flags, i) => new Sum(
    flags.length + 2, ...flags, slackVar.cell(i + 1))),
];
