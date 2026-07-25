// Title: Unique under the Fog
// Author: Visumation
// Video: https://www.youtube.com/watch?v=d4-5GOt4Tuc
// Source: https://sudokupad.app/4fimlq2cm2

// Normal sudoku rules apply (standard rows/columns/3x3 boxes).
// Purple Renban (RB) lines: each is a non-repeating set of consecutive digits.
// Cyan Region Sum (RS) lines: box borders split each line into segments with
// an equal sum.
// Green German Whisper (GW) lines: neighbouring digits differ by >= 5.
// Pink line (P, called "red" in the rules text): neighbouring digits
// alternate parity.
// Black dot: the two digits are in a 1:2 ratio. White dot: the two digits
// are consecutive.
// Grey-shaded cells contain an even digit.
// "Each constraint type may contain no repeated digits anywhere in this
// puzzle" -- within each of the seven listed rule types (RB, RS, GW, P,
// black dot, white dot, grey square), no digit repeats across every
// instance of that type, even across separate lines/dots. Encoded below as
// one AllDifferent per type (with >1 instance) over the union of its cells.
// The puzzle also has fog-of-war reveal state (foglight/triggereffect in the
// source payload); that is solving UI, not a final-grid rule, and is not
// encoded.

// RB (Renban) lines -- purple. Cell order from lines[2],[3],[4] wayPoints.
const renbanLines = [
  ['R1C3', 'R2C3', 'R3C3'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R1C7', 'R2C7', 'R3C7'],
];

// RS (Region Sum) lines -- cyan. Cell order from lines[0],[1] wayPoints.
const regionSumLines = [
  ['R8C3', 'R7C3', 'R6C3', 'R6C4', 'R6C5'],
  ['R5C3', 'R4C3', 'R3C4', 'R3C5'],
];

// GW (German Whisper) lines -- green. Cell order from lines[5],[6] wayPoints.
const whisperLines = [
  ['R5C1', 'R6C1', 'R7C1'],
  ['R1C6', 'R2C6', 'R3C6'],
];

// P (alternating parity) lines -- pink. Cell order from lines[7],[8],[9]
// wayPoints. No native alternating-parity class exists; Pair applies its
// relation between consecutive cells of the given list, which matches the
// "neighbouring digits" wording.
const parityLines = [
  ['R9C1', 'R8C1', 'R8C2'],
  ['R2C9', 'R3C9'],
  ['R8C5', 'R7C5', 'R8C4'],
];
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

// Kropki dots -- overlays[0..3]; fill/background colour carries the meaning
// (black fill = ratio dot, white fill = consecutive dot).
const blackDots = [
  ['R4C9', 'R5C9'],
  ['R8C7', 'R9C7'],
  ['R7C8', 'R7C9'],
];
const whiteDots = [
  ['R4C5', 'R5C5'],
];

// Grey-square cells (underlays at R1C8, R6C5) contain an even digit.
const evenCells = ['R1C8', 'R6C5'];

return [
  new Shape('9x9'),

  ...renbanLines.map(cells => new Renban(...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...parityLines.map(
    (cells, i) => new Pair(parityKey, `parity${i}`, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  // Cross-type uniqueness (see header): one AllDifferent per rule type over
  // the union of that type's cells -- covers every type with more than one
  // instance (the single white-dot pair needs none; WhiteDot already forces
  // its two cells apart).
  new AllDifferent(...renbanLines.flat()),
  new AllDifferent(...regionSumLines.flat()),
  new AllDifferent(...whisperLines.flat()),
  new AllDifferent(...parityLines.flat()),
  new AllDifferent(...blackDots.flat()),
  new AllDifferent(...evenCells),
];
