// Title: Killer Cat Sudoku
// Author: Stuart Emmerson
// Video: https://www.youtube.com/watch?v=L0EL4j5uofg
// Source: https://app.crackingthecryptic.com/sudoku/gpDj4f2NFf

// Rules: Normal sudoku rules apply. Digits increase along thermometers from
// the bulb to the end(s) -- some thermometers here have one bulb and
// several arms. Marked cages sum to 9. Three further, unmarked
// ("invisible") 2-cell cages, each also summing to 9, sit somewhere in box 2
// (the top-middle 3x3 box) -- which two cells make up each of those cages is
// left for the solver to find, not given.
//
// The payload draws twelve lines. Nine are ordinary single-arm
// thermometers, each with its own grey circle bulb overlay sitting at a
// drawn path endpoint. The remaining three lines (raw order #6, #7, #8) all
// pass through R6C5, where a tenth grey circle overlay sits -- identical in
// size, fill and border colour to the nine genuine bulb overlays, unlike
// the two off-grid, uncoloured circle overlays elsewhere in the payload
// (centres (9.5,9.5) and (-0.5,-0.5), both outside the 9x9 board and left
// unencoded as inert export artefacts). Unlike every genuine single-arm
// bulb, the R6C5 overlay sits at an interior point of all three of its
// lines, never at one of their drawn endpoints -- which is exactly the
// "mark on the path splits it into separate clues" case (as when an arrow
// bulb splits a shaft into arms): R6C5 is one shared bulb, and each of its
// three drawn strokes is two arms of the same thermometer, split at the
// mark. That six-armed bulb is the concrete referent of the rule text's
// "end(s)" (plural).
const givens = [
  new Given('R1C1', 9),
  new Given('R5C5', 9),
  new Given('R9C9', 9),
];

// Nine single-arm thermometers. Cell order is bulb-first; each bulb cell is
// confirmed against the payload's own grey circle overlay, which sits at
// the true bulb end even where the drawn line's waypoint order happens to
// list the tip first -- four of the nine lines are drawn tip-first, so
// their listed order is reversed here to put the overlay-confirmed bulb
// first.
const singleArmThermos = [
  ['R3C4', 'R2C3', 'R1C2', 'R2C2', 'R3C2'],
  ['R3C8', 'R2C8', 'R1C8', 'R2C7', 'R3C6'],
  ['R5C4', 'R4C4'],
  ['R5C6', 'R4C6'],
  ['R4C2', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R9C5', 'R8C5'],
  ['R9C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9'],
  ['R6C9', 'R5C9', 'R4C8'],
];

// The six-armed thermometer sharing bulb R6C5. Each arm is one of the two
// halves of a drawn line (raw #6: R6C2-R6C8; raw #7: R7C2-R8C6; raw #8:
// R7C8-R8C4), split at R6C5, listed bulb-first.
const sharedBulbArms = [
  ['R6C5', 'R6C4', 'R6C3', 'R6C2'],
  ['R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R6C5', 'R6C4', 'R7C3', 'R7C2'],
  ['R6C5', 'R7C5', 'R8C6'],
  ['R6C5', 'R6C6', 'R7C7', 'R7C8'],
  ['R6C5', 'R7C5', 'R8C4'],
];

const thermos = [...singleArmThermos, ...sharedBulbArms].map(
  (cells) => new Thermo(...cells)
);

// Three marked (drawn, killer-style) cages, each summing to 9.
// Cell lists transcribed from the puzzle's drawn cage outlines.
const markedCages = [
  new Cage(9, 'R5C2', 'R5C3'),
  new Cage(9, 'R5C7', 'R5C8'),
  new Cage(9, 'R7C8', 'R8C8', 'R9C8'),
];

// Three invisible 2-cell cages summing to 9, somewhere in box 2. Box 2's
// nine cells hold 1-9 once each (default box AllDifferent), and the only
// digit pairs summing to 9 are {1,8}, {2,7}, {3,6}, {4,5}: since each value
// occupies exactly one cell, two cells with Sum==9 always hold one of these
// four canonical pairs, and any two DIFFERENT such cell-pairs are
// automatically vertex-disjoint (sharing a cell would force the same value
// into two different box cells). So "three 2-cell cages sum to 9" reduces
// to: at least 3 of box 2's internally-adjacent cell pairs have Sum==9 --
// with disjointness of the three cages already guaranteed by the box's own
// AllDifferent, not something this encoding has to add.
//
// Every marked cage in this payload is a connected (orthogonally-adjacent)
// group of cells, so "cage" is read the same way here: an invisible cage
// pairs two ADJACENT cells, not any two cells that happen to sum to 9
// (which box 2's AllDifferent would already guarantee for four fixed pairs
// regardless of position, making a non-adjacency reading vacuous -- it
// would hold in every grid and add no constraint at all).
//
// The specific pairing is left for the solver: which 3 of box 2's 12
// internal adjacent-cell edges realize the invisible cages is not stated in
// the source and is not resolved here. Instead this asserts the existence
// claim directly -- at least one of box 2's edge-disjoint 3-edge selections
// has Sum==9 on all three edges -- computed from box 2's own grid geometry,
// not hand-picked.
function box2InvisibleCagesConstraint() {
  const box2Cells = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 4; c <= 6; c++) {
      box2Cells.push(makeCellId(r, c));
    }
  }
  const cellIndex = (id) => box2Cells.indexOf(id);

  // The 12 orthogonally-adjacent cell pairs within box 2's 3x3 layout.
  const edges = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 4; c <= 6; c++) {
      if (c < 6) edges.push([makeCellId(r, c), makeCellId(r, c + 1)]);
      if (r < 3) edges.push([makeCellId(r, c), makeCellId(r + 1, c)]);
    }
  }
  const shareCell = (e1, e2) =>
    e1[0] === e2[0] || e1[0] === e2[1] || e1[1] === e2[0] || e1[1] === e2[1];

  // Every set of 3 pairwise cell-disjoint edges among the 12.
  const matchings = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      if (shareCell(edges[i], edges[j])) continue;
      for (let k = j + 1; k < edges.length; k++) {
        if (shareCell(edges[i], edges[k]) || shareCell(edges[j], edges[k])) continue;
        matchings.push([edges[i], edges[j], edges[k]]);
      }
    }
  }

  return new Or(
    matchings.map(
      (m) => new And(m.map(([a, b]) => new Sum(9, a, b)))
    )
  );
}

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  ...markedCages,
  box2InvisibleCagesConstraint(),
];
