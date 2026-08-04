// Title: Transmission
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=aPT8H962E1I
// Source: https://app.crackingthecryptic.com/sudoku/489fDJPD78

// Normal sudoku rules apply. Cells a knight's move apart cannot repeat a
// digit (AntiKnight, global). Two thermometers require strictly increasing
// digits from the bulb (Thermo, bulb cell first). Six purple lines each hold
// a set of non-repeating consecutive digits in any order (Renban).
//
// The purple line R5C7-R6C7-R7C7-R6C8 is drawn as a closed diamond back to
// R5C7; Renban constrains its cell set jointly, so the 4 distinct cells are
// passed once, with no repeated closing cell.
//
// Two entries in the source's line list carry a colour/thickness but no
// coordinates and resolve to no cells; there is nothing to encode from them.

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Thermometers: bulb cell first, from the coloured circle overlay marking
  // each bulb.
  new Thermo('R2C4', 'R3C5', 'R4C6'),
  new Thermo('R4C3', 'R3C4', 'R2C5', 'R3C6', 'R4C5', 'R5C4'),

  // Purple (renban) lines.
  new Renban('R3C3', 'R4C4', 'R5C5'),
  new Renban('R5C6', 'R4C7'),
  new Renban('R2C7', 'R2C8', 'R2C9'),
  new Renban('R2C6', 'R1C7'),
  new Renban('R5C7', 'R6C7', 'R7C7', 'R6C8'),
  new Renban('R7C6', 'R8C6', 'R9C6'),
];
