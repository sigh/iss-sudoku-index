// Title: Friendly Killer
// Author: ryokousha
// Video: https://www.youtube.com/watch?v=5SGSLjLKO_w
// Source: https://app.crackingthecryptic.com/webapp/BNjgbtG62b

// Standard 9x9 sudoku (rows/columns/boxes, no wraparound).
//
// Three killer cages: distinct digits summing to the printed total.
//
// Friendly cells (green): a friendly cell's digit equals its own row number,
// column number, or box number (1-9, boxes numbered in reading order).
// Encoded per cell as a multi-value Given over {row, col, box}, deduplicated
// where two of the three coincide numerically (e.g. R2C6 sits in box 2, so
// its friendly set is {2, 6} rather than three values).

return [
  new Shape('9x9'),

  // Killer cages (cells from the drawn cage outlines, sum from the corner clue).
  new Cage(18, 'R4C5', 'R5C5', 'R6C5', 'R5C4', 'R5C6'),
  new Cage(30, 'R2C8', 'R2C7', 'R3C7', 'R4C7', 'R4C8'),
  new Cage(31, 'R6C3', 'R6C2', 'R7C2', 'R8C2', 'R8C3'),

  // Friendly cells (green underlay cells), value restricted to {row, col, box}.
  new Given('R1C5', 1, 2, 5),   // row1, col5, box2
  new Given('R1C8', 1, 3, 8),   // row1, col8, box3
  new Given('R2C4', 2, 4),      // row2, col4, box2
  new Given('R2C6', 2, 6),      // row2, col6, box2
  new Given('R3C7', 3, 7),      // row3, col7, box3
  new Given('R3C9', 3, 9),      // row3, col9, box3
  new Given('R4C1', 1, 4),      // row4, col1, box4
  new Given('R4C3', 3, 4),      // row4, col3, box4
  new Given('R5C2', 2, 4, 5),   // row5, col2, box4
  new Given('R5C8', 5, 6, 8),   // row5, col8, box6
  new Given('R6C7', 6, 7),      // row6, col7, box6
  new Given('R6C9', 6, 9),      // row6, col9, box6
  new Given('R7C1', 1, 7),      // row7, col1, box7
  new Given('R7C3', 3, 7),      // row7, col3, box7
  new Given('R8C4', 4, 8),      // row8, col4, box8
  new Given('R8C6', 6, 8),      // row8, col6, box8
  new Given('R9C2', 2, 7, 9),   // row9, col2, box7
  new Given('R9C5', 5, 8, 9),   // row9, col5, box8
];
