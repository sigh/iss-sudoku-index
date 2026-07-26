// Title: Red-Yellow-Green
// Author: Sumanta (Anu)
// Video: https://www.youtube.com/watch?v=DFhDPAYrRGw
// Source: https://sudokupad.app/uz0380wkfg

// Normal Sudoku rules apply. Thermometers increase strictly from bulb to tip.
// Green lines: neighbouring digits differ by >= 5 (repeats allowed on the
// line, which is Whisper's default behaviour). Purple lines: the covered
// cells hold a set of consecutive digits, in any order (Renban). The blue
// line is decoration only and is intentionally not encoded.

return [
  new Shape('9x9'),

  new Given('R1C3', 7),
  new Given('R5C1', 1),
  new Given('R5C9', 2),
  new Given('R9C9', 9),

  // Thermometers: 16 total, drawn as 8 "V" shapes -- two 2-cell arms sharing
  // a bulb cell each (payload `thermometer` entries; bulb listed first).
  ...[
    ['R4C3', 'R3C2'], ['R4C3', 'R3C4'],
    ['R2C3', 'R1C2'], ['R2C3', 'R1C4'],
    ['R7C3', 'R6C2'], ['R7C3', 'R6C4'],
    ['R9C3', 'R8C2'], ['R9C3', 'R8C4'],
    ['R7C7', 'R6C6'], ['R7C7', 'R6C8'],
    ['R9C7', 'R8C6'], ['R9C7', 'R8C8'],
    ['R4C7', 'R3C6'], ['R4C7', 'R3C8'],
    ['R2C7', 'R1C6'], ['R2C7', 'R1C8'],
  ].map(cells => new Thermo(...cells)),

  // Green lines (payload `line` entries with outlineC #8AC977 or #7AC96B --
  // two shades of green, read as one rule since the rules text names only
  // a single green-line rule): adjacent digits differ by >= 5.
  ...[
    ['R4C2', 'R5C3'], ['R4C4', 'R5C3'],
    ['R5C2', 'R6C3'], ['R5C4', 'R6C3'],
    ['R4C6', 'R5C7'], ['R4C8', 'R5C7'],
    ['R7C6', 'R8C7'], ['R7C8', 'R8C7'],
    ['R3C3', 'R2C4'], ['R5C6', 'R6C7'],
    ['R7C2', 'R8C3'],
  ].map(cells => new Whisper(5, ...cells)),

  // Purple lines (payload `line` entries with outlineC #C47DC9): consecutive
  // digits, any order.
  ...[
    ['R2C2', 'R3C3'],
    ['R7C4', 'R8C3'],
    ['R2C6', 'R3C7', 'R2C8'],
  ].map(cells => new Renban(...cells)),

  // Blue line (R5C8-R6C7, outlineC #7271C9) is explicitly decoration only
  // per the rules text; no constraint encoded.
];
