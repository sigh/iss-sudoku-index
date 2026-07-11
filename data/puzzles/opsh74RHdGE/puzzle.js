// Title: Nakatomi Plaza
// Author: yttrio
// Video: https://www.youtube.com/watch?v=opsh74RHdGE
// Source: https://sudokupad.app/fks6snev4c

// Ten outside cells hold unknown skyscraper-count digits (never given): each
// is modeled as an off-grid Var (domain 1-6) rather than enlarging the grid.
// OC1-OC5 are left-side row clues (rows 1,2,4,5,6; row 3 has none), OC6-OC8
// are top-side column clues (columns 4,5,6), OC9-OC10 are bottom-side column
// clues (columns 4,5). No clue exists on the right side or for row 3.
// new Var('OC', ..., 10) creates grid-external cells VOC1..VOC10.
const OC = {
  R1: 'VOC1', R2: 'VOC2', R4: 'VOC3', R5: 'VOC4', R6: 'VOC5',
  T4: 'VOC6', T5: 'VOC7', T6: 'VOC8',
  B4: 'VOC9', B5: 'VOC10',
};

function col(c, rows) {
  return rows.map(r => makeCellId(r, c));
}
function row(r, cols) {
  return cols.map(c => makeCellId(r, c));
}
const INC = [1, 2, 3, 4, 5, 6];
const DEC = [6, 5, 4, 3, 2, 1];

// Skyscraper: the clue cell's own value is the count of cells visible from
// its side (a cell is visible only if strictly greater than every prior
// cell). The clue is read first so the NFA knows its target before scanning.
function skyscraper(clueCell, orderedCells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, maxSeen: 0, count: 0 };
      const { target, maxSeen, count } = state;
      if (value > maxSeen) return { target, maxSeen: value, count: count + 1 };
      return { target, maxSeen, count };
    },
    accept: (state) => !!state && state.count === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 6), name, clueCell, ...orderedCells);
}

const constraints = [
  new Shape('6x6'),

  // Ten outside skyscraper-clue cells (unknown digits, domain 1-6 default).
  new Var('OC', 'outside skyscraper clues', 10),

  // "Digits may not repeat in cages": four irregular 6-cell no-repeat
  // groups, each mixing outside clue cells with main-grid cells (the
  // colored silhouette outlines in the source).
  new AllDifferent(OC.R1, ...row(1, [1, 2, 3, 4]), OC.R2),
  new AllDifferent(OC.T4, OC.T5, OC.T6, ...row(1, [5, 6]), makeCellId(2, 5)),
  new AllDifferent(OC.R4, OC.R5, ...row(5, [1, 2, 3]), OC.R6),
  new AllDifferent(...row(5, [4, 5]), ...row(6, [4, 5]), OC.B4, OC.B5),

  // Skyscrapers: left clues look rightward across the full row; top clues
  // look downward across the full column; bottom clues look upward.
  skyscraper(OC.R1, row(1, INC), 'Skyscraper left R1'),
  skyscraper(OC.R2, row(2, INC), 'Skyscraper left R2'),
  skyscraper(OC.R4, row(4, INC), 'Skyscraper left R4'),
  skyscraper(OC.R5, row(5, INC), 'Skyscraper left R5'),
  skyscraper(OC.R6, row(6, INC), 'Skyscraper left R6'),
  skyscraper(OC.T4, col(4, INC), 'Skyscraper top C4'),
  skyscraper(OC.T5, col(5, INC), 'Skyscraper top C5'),
  skyscraper(OC.T6, col(6, INC), 'Skyscraper top C6'),
  skyscraper(OC.B4, col(4, DEC), 'Skyscraper bottom C4'),
  skyscraper(OC.B5, col(5, DEC), 'Skyscraper bottom C5'),
];

return constraints;
