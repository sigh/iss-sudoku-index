// Title: Jan 6, 2023: CHAOS CONSTRUCTION
// Author: clover!
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/2gxnd8qw
//
// No rules text is present in the source payload (metadata carries no rules
// string, and no external rules source was retrieved). The payload draws only
// 12 given digits and 7 unlabelled "circle_L" cell markers -- no cages, walls,
// lines, or box/region geometry of any kind.
//
// Standard 2x3 boxes are arithmetically impossible with the givens: R1C5=3
// and R2C6=3 both fall in the top-right 2x3 box, so a fixed default-box
// reading is unsatisfiable and is not used (NoBoxes below). No alternative
// region geometry is drawn or stated, so no region/box rule is encoded at
// all. The 7 circle markers' meaning cannot be recovered from the drawn
// geometry alone and are also omitted.

return [
  new Shape('6x6'),
  new NoBoxes(),

  // Givens, decoded from the payload's `number` map (Penpa point-index
  // coordinates, 2-cell margin, nx0=10).
  new Given('R1C1', 1),
  new Given('R1C3', 2),
  new Given('R1C5', 3),
  new Given('R2C2', 5),
  new Given('R2C4', 4),
  new Given('R2C6', 3),
  new Given('R5C2', 2),
  new Given('R5C4', 3),
  new Given('R5C6', 1),
  new Given('R6C1', 3),
  new Given('R6C3', 4),
  new Given('R6C5', 6),
];
