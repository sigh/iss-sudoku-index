// Title: Think Outside The Cage
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=ZpnxS2rPyhM
// Source: https://app.crackingthecryptic.com/sudoku/8ghL89BqQg

// Normal sudoku rules apply (default 9x9 Shape: standard row/column/box
// all-different; the payload's `regions` array is the ordinary 3x3
// partition, so no explicit regions are needed).
// Along the thermometer, digits increase from the bulb end (Thermo).
//
// Omitted: "the white cells must be tiled with one copy each of the twelve
// possible pentominoes", "if a pentomino contains a cell with a small
// number, its cells sum to that number", and "digits in a pentomino may
// repeat if otherwise allowed". All three depend on a solver-discovered
// partition of the 60 white cells (81 minus the 21 drawn grey cells) into
// twelve differently-shaped pentominoes, then reading off which discovered
// piece owns each small-number clue cell. ISS has no primitive that assigns
// a solver-discovered, orthogonally-connected region a specific shape
// identity from a fixed catalogue (one of the twelve free pentominoes, each
// used at most once) -- see blocker filed against YwmEQIWUN6c (same gap:
// partial 60-of-81-cell pentomino partition with per-piece shape identity).

return [
  new Shape('9x9'),
  new Thermo('R1C4', 'R1C5', 'R1C6'),
];
