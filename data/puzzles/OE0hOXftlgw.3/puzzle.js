// Title: 8/23: Split an Arrow in Twain!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=OE0hOXftlgw
// Source: https://tinyurl.com/33k96jt8

// Normal sudoku rules, 12 killer cages (distinct + sum), and 12 arrows
// (sum of arm cells equals the bulb cell). No given digits.
return [
  new Shape('9x9'),

  // Killer cages: cells and totals as drawn.
  new Cage(7, 'R6C6', 'R6C7', 'R7C6'),
  new Cage(6, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(8, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(8, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(16, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(16, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(18, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(14, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(14, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(10, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(16, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(18, 'R1C4', 'R1C5', 'R1C6'),

  // Arrows: bulb cell first, then arm cells, following each arrow's drawn
  // path from its circle. Eight of the twelve arrows
  // (R1C6.., R1C2.., R4C1.., R8C1.., R9C4.., R9C8.., R6C9.., R2C9..) sit on
  // exactly the same three cells as one killer cage above; that overlap is
  // an emergent consequence of the two constraints together, not a separate
  // rule, so it needs no extra encoding.
  new Arrow('R3C4', 'R3C5', 'R3C6'),
  new Arrow('R4C7', 'R5C7', 'R6C7'),
  new Arrow('R7C6', 'R7C5', 'R7C4'),
  new Arrow('R6C3', 'R5C3', 'R4C3'),
  new Arrow('R1C6', 'R1C5', 'R1C4'),
  new Arrow('R1C2', 'R1C1', 'R2C1'),
  new Arrow('R4C1', 'R5C1', 'R6C1'),
  new Arrow('R8C1', 'R9C1', 'R9C2'),
  new Arrow('R9C4', 'R9C5', 'R9C6'),
  new Arrow('R9C8', 'R9C9', 'R8C9'),
  new Arrow('R6C9', 'R5C9', 'R4C9'),
  new Arrow('R2C9', 'R1C9', 'R1C8'),
];
