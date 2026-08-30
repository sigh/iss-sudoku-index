// Title: Between Stars
// Author: Laura Soler
// Video: https://www.youtube.com/watch?v=SNAh_k16Aos
// Source: https://cracking-the-cryptic.web.app/sudoku/NHpMRLJHpP

// Standard 9x9 sudoku (default rows/cols/boxes) plus the two given digits.
// The source payload carries no rules text at all -- no metadata object of
// any kind. Eighteen outside-lane numbers (one left of each row, one above
// each column) are drawn with no arrow, shaft, star, or other in-cell mark
// to tie them to a rule, so no reading (star count, digit sum, position, or
// otherwise) is recoverable from the payload. Omitted entirely.

return [
  new Shape('9x9'),

  new Given('R5C4', 1),
  new Given('R5C6', 2),
];
