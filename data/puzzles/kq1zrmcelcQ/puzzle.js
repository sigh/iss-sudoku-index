// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kq1zrmcelcQ
// Source: https://cracking-the-cryptic.web.app/sudoku/qnqj3fJqnq

// Normal 9x9 sudoku: each row, column and 3x3 box holds 1-9 once. There are no
// given digits.
//
// The only other markings are seven thermometers: digits increase along each
// one starting from its bulb. Nothing else is drawn, so nothing else is
// encoded.
//
// Cells transcribed from the seven grey strokes, each listed bulb first - the
// bulb being the solid grey disc sitting on one end of its stroke. Two of the
// strokes are drawn tip first, so their listed order reverses the drawn one
// ("2" and "1" below). Three thermometers are drawn as two overlapping strokes
// meeting in a shared cell (R4C5, R2C7, R8C6) and are listed here as the single
// stems they draw. The disc at R7C6 is the bulb of two stems.
//
// The seven stems draw the numerals 2 0 1 9; the glyph labels below just say
// where on the board each one is.
return [
  new Shape('9x9'),

  // "2", rows 2-4 / columns 2-4
  new Thermo('R4C4', 'R4C3', 'R4C2', 'R3C2', 'R3C3', 'R3C4', 'R2C4', 'R2C3', 'R2C2'),

  // "0", rows 2-4 / columns 5-7: two stems from adjacent bulbs at the top,
  // running down opposite sides of the ring
  new Thermo('R2C5', 'R3C5', 'R4C5', 'R4C6'),
  new Thermo('R2C6', 'R2C7', 'R3C7', 'R4C7'),

  // "1", rows 6-9 / columns 1-2
  new Thermo('R9C2', 'R8C2', 'R7C2', 'R6C2', 'R7C1'),

  // "9", rows 6-9 / columns 5-9
  new Thermo('R7C5', 'R6C5'),
  new Thermo('R7C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Thermo('R7C6', 'R8C6', 'R8C7', 'R8C8'),
];
