// Title: Penthouse
// Author: Marty Sears & Lorena
// Video: https://www.youtube.com/watch?v=YZYVTbPixiI
// Source: https://sudokupad.app/rpdtjt36r7?setting-nogrid=1&setting-hidebgimage=0&setting-digitoutlines=0

// SUDOKU: standard row/column/box all-different (default 9x9 Shape; boxes
// are the standard aligned 3x3 blocks -- drawn explicitly as the "marked"
// boxes the rules refer to, and already the solver default).
// FOG: solving UI only; the final grid carries no fog rule.
// PENTHOUSE: the grid is tiled by 18 fixed, non-overlapping regions --
// 5 tetrominoes and 12 pentominoes (one of every free tetromino/pentomino
// shape, confirmed by classification below) plus a 1-cell region ("Ocho"
// the cat). Region outlines are drawn (thick black line) and reconstructed
// here from that outline geometry -- they are fixed puzzle data, not a
// placement the solver searches for. Digits do not repeat within a region
// (Cage/AllDifferent below). Some regions show their digit total (Cage
// sum). "No two characters have the same total" is NOT encoded: a region's
// total ranges 1-35 (a pentomino's max is 9+8+7+6+5), but ISS's Var
// alphabet caps at 16 values, so no single aux cell can hold it.
// PHOTOS: photos around the grid each show one character with one digit's
// value and cell position. Decoded (where the drawn shape, digit position,
// and digit orientation were unambiguous) into the Givens below. A few
// photos could not be reliably resolved and are omitted.

const regions = [
  { cells: ['R2C3', 'R3C3', 'R3C4', 'R3C5', 'R4C5'] },                          // Z-pentomino
  { cells: ['R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4'] },                          // V-pentomino
  { cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4'], sum: 32 },                 // Y-pentomino
  { cells: ['R2C5', 'R2C6', 'R3C6', 'R3C7', 'R4C7'] },                          // W-pentomino
  { cells: ['R1C6', 'R1C7', 'R2C7', 'R2C8'], sum: 10 },                         // S-tetromino
  { cells: ['R1C8', 'R1C9', 'R2C9', 'R3C8', 'R3C9'] },                          // U-pentomino
  { cells: ['R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9'], sum: 28 },                 // P-pentomino
  { cells: ['R4C6', 'R5C6', 'R6C5', 'R6C6', 'R6C7'], sum: 27 },                 // T-pentomino
  { cells: ['R7C6', 'R7C7', 'R8C7', 'R8C8', 'R8C9'] },                          // N-pentomino
  { cells: ['R6C8', 'R6C9', 'R7C8', 'R7C9'] },                                  // O-tetromino
  { cells: ['R7C5', 'R8C5', 'R8C6', 'R9C4', 'R9C5'] },                          // F-pentomino
  { cells: ['R9C6', 'R9C7', 'R9C8', 'R9C9'], sum: 14 },                         // I-tetromino
  { cells: ['R5C4', 'R6C3', 'R6C4', 'R7C4'], sum: 11 },                         // T-tetromino
  { cells: ['R5C2', 'R5C3', 'R6C2', 'R7C2'], sum: 12 },                         // L-tetromino
  { cells: ['R7C3', 'R8C2', 'R8C3', 'R8C4', 'R9C3'], sum: 23 },                 // X-pentomino
  { cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'] },                          // L-pentomino
  { cells: ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'] },                          // I-pentomino
  { cells: ['R5C5'] },                                                          // Ocho, the cat (1 cell)
];

return [
  new Shape('9x9'),

  // Photo givens: one decoded digit per resolved character. Several photos
  // (V-pentomino, N-pentomino, W-pentomino, I-pentomino, O-tetromino,
  // T-tetromino) could not be reliably resolved to one cell/value and are
  // omitted.
  new Given('R8C4', 1), // X-pentomino (right arm)
  new Given('R1C8', 9), // U-pentomino
  new Given('R5C2', 6), // L-tetromino (corner)
  new Given('R1C5', 6), // Y-pentomino
  new Given('R9C6', 6), // I-tetromino
  new Given('R1C7', 4), // S-tetromino
  new Given('R5C5', 8), // Ocho, the cat

  ...regions.filter(r => r.cells.length > 1).map(r =>
    r.sum != null ? new Cage(r.sum, ...r.cells) : new AllDifferent(...r.cells)
  ),
];
