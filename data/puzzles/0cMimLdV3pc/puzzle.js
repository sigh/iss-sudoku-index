// Title: Year of the Rabbit 2023
// Author: Morisenseiisgod
// Video: https://www.youtube.com/watch?v=0cMimLdV3pc
// Source: https://app.crackingthecryptic.com/sudoku/RdMFQGFqdn

// Normal sudoku rules apply (default 3x3 boxes).
//
// Modular lines (red, #E6261F): any 3 consecutive digits along a red line
// must show all 3 remainders mod 3 -- Modular(3).
//
// Outside diagonal clues (little-killer style): each arrow outside the grid
// gives the sum of the digits on the diagonal ray it points along, and
// digits may repeat there (stated explicitly in the rules text, and native
// to LittleKiller's semantics).
//
// Grey circles (3 unlabelled cells) sum to a factor of 2023; the grey line
// (5 cells) sums to a multiple of 8. Neither total is printed -- the rules
// say the solver must deduce it -- so each is encoded as a disjunction over
// every total the cell count can reach: grey circles range 3-27, and of
// 2023's factors {1, 7, 17, 119, 289, 2023} only 7 and 17 fall in range;
// the grey line ranges 5-45, reaching multiples of 8 at 8/16/24/32/40.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Red short modular line -- lines[1] (#E6261F), row 7.
const redLineShort = ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'];

// Red long modular line -- lines[2] (#E6261F), closed 27-cell loop, walked
// in the payload's own stroke order. 27 is a multiple of 3, so Modular(3)'s
// position-mod-3 periodic encoding already covers the wrap-around windows
// without repeating the start cell.
const redLineLong = [
  'R4C5', 'R3C5', 'R2C5', 'R1C5', 'R2C4', 'R3C4', 'R4C4', 'R5C3', 'R6C3',
  'R7C2', 'R8C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C8',
  'R6C7', 'R5C7', 'R4C6', 'R3C7', 'R3C8', 'R3C9', 'R2C8', 'R2C7', 'R3C6',
];

// Grey line -- lines[0] (#CFCFCF), the 5-cell "U" crossing the short red
// line at R7C4 and R7C6.
const greyLine = ['R7C4', 'R8C4', 'R8C5', 'R8C6', 'R7C6'];

// Grey circles -- overlays[0..2] (#CFCFCF, no text), not on any line.
const greyCircles = ['R5C4', 'R5C6', 'R6C5'];

return [
  new Shape('9x9'),

  new Modular(3, ...redLineShort),
  new Modular(3, ...redLineLong),

  new Or([new Sum(7, ...greyCircles), new Sum(17, ...greyCircles)]),
  new Or([8, 16, 24, 32, 40].map(total => new Sum(total, ...greyLine))),

  // "22" -- arrows[0]/overlays[3], enters the top edge between C6/C7,
  // running down-left.
  LittleKiller.fromCells(22, graph.ray('R1C6', 1, -1), geometry),
  // "23" -- arrows[2]/overlays[4], enters the bottom edge between C6/C7,
  // running up-right.
  LittleKiller.fromCells(23, graph.ray('R9C7', -1, 1), geometry),
  // "20" -- arrows[3]/overlays[5], enters the bottom-left grid corner,
  // running up-right along the full anti-diagonal.
  LittleKiller.fromCells(20, graph.ray('R9C1', -1, 1), geometry),
  // "1" -- arrows[1]/overlays[6], enters the top edge between C8/C9,
  // running down-right; that ray leaves the grid after one cell, and
  // LittleKiller's own cellMap excludes length-1 diagonals, so the sum
  // reduces to a Given on that single cell.
  new Given('R1C9', 1),
];
