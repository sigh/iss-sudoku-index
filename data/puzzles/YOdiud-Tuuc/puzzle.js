// Title: The Seed
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=YOdiud-Tuuc
// Source: https://sudokupad.app/4i66q3kjp2

// Fillomino regions are connected equal-number components of their stated size.
// Across each region border numbers are consecutive; the black segments are
// required borders. There are no Latin-square rules.
const and=(...constraints)=>new And(constraints);
const or=(...constraints)=>new Or(constraints);
const shape = new Shape('12x13', '0-12', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const rr = graph.makeOverlay('VA');
const rc = graph.makeOverlay('VB');
const hi = graph.makeOverlay('VC');
const d3 = graph.makeOverlay('VD');
const d7 = graph.makeOverlay('VE');
// A number is 10*hi + its board cell. The seed bounds a cell's number by
// 1 + Manhattan distance from R12C7, hence all numbers are at most 18.
// Depth is the BFS distance to the first cell of the region, represented modulo
// 3 and 7 (product 21 > the maximum depth 17), without extra label freedom.
const depth = (a,b) => Array.from({length:21},(_,i)=>i).find(i=>i%3===a && i%7===b);
const pair = (fn, name, a,b) => new Pair(Pair.fnToKey(fn,shape),name,a,b);
const same = (a,b) => new SameValues(2,a,b);
const rootSame = (a,b) => and(same(rr.at(a),rr.at(b)),same(rc.at(a),rc.at(b)));
const rootDifferent = (a,b) => or(new AllDifferent(rr.at(a),rr.at(b)),new AllDifferent(rc.at(a),rc.at(b)));
// These four-field machines retain the first reconstructed quantity, then
// compare it with the second; values outside each representation are rejected.
function quantitySpec(baseA,baseB,predicate) {
 return NFA.encodeSpec({startState:{p:0},maxDepth:4,
 transition:(s,v)=> {
  if(s.p===0) return {p:1,a:v};
  if(s.p===1) return {p:2,a:baseA(s.a,v)};
  if(s.p===2) return {p:3,a:s.a,b:v};
  if(s.p===3 && predicate(s.a,baseB(s.b,v))) return {p:4};
  return undefined;
 },accept:s=>s.p===4},shape);
}
const num=(h,l)=>10*h+l;
const validNum=n=>n>=1&&n<=18;
const equalNum=quantitySpec(num,num,(a,b)=>validNum(a)&&a===b);
const consecutiveNum=quantitySpec(num,num,(a,b)=>validNum(a)&&validNum(b)&&Math.abs(a-b)===1);
const nearDepth=quantitySpec(depth,depth,(a,b)=>a<=17&&b<=17&&Math.abs(a-b)<=1);
const lowerDepth=quantitySpec(depth,depth,(a,b)=>a<=17&&b===a-1);
const depthWithinSize=quantitySpec(depth,num,(d,n)=>d<=17&&validNum(n)&&d<n);
const q=(spec,name,a,b,x,y)=>new NFA(spec,name,a,b,x,y);
const numberEq=(a,b)=>q(equalNum,'same number',hi.at(a),a,hi.at(b),b);
const numberConsecutive=(a,b)=>q(consecutiveNum,'consecutive numbers',hi.at(a),a,hi.at(b),b);
const zero=(c)=>and(new Given(d3.at(c),0),new Given(d7.at(c),0));
const notZero=(c)=>or(new Given(d3.at(c),1,2),new Given(d7.at(c),1,2,3,4,5,6));
const domains=cells.flatMap(c=> {
 const {row,col}=parseCellId(c);
 const bound=1+12-row+Math.abs(col-7);
 return [
 pair((h,l)=>num(h,l)>=1&&num(h,l)<=bound,'distance from seed bound',hi.at(c),c),
 pair((r,k)=>r<row-1 || r===row-1&&k<=col-1,'root reading order',rr.at(c),rc.at(c)),
 or(and(new Given(rr.at(c),row-1),new Given(rc.at(c),col-1),zero(c)),
 and(or(new Given(rr.at(c),...Array.from({length:12},(_,i)=>i).filter(i=>i!==row-1)),new Given(rc.at(c),...Array.from({length:13},(_,i)=>i).filter(i=>i!==col-1))),notZero(c))),
 q(depthWithinSize,'depth less than region size',d3.at(c),d7.at(c),hi.at(c),c)];
});
const descents=cells.map(c=>or(zero(c),...graph.neighbours(c).map(n=>and(rootSame(c,n),q(lowerDepth,'depth descent',d3.at(c),d7.at(c),d3.at(n),d7.at(n))))));
const edges=cells.flatMap(c=>graph.neighbours(c).filter(n=>cells.indexOf(n)>cells.indexOf(c)).map(n=>[c,n]));
const adjacency=edges.map(([a,b])=>and(
 or(and(numberEq(a,b),rootSame(a,b)),and(numberConsecutive(a,b),rootDifferent(a,b))),
 or(rootDifferent(a,b),q(nearDepth,'BFS distance',d3.at(a),d7.at(a),d3.at(b),d7.at(b)))));
// For each possible root, count cells naming that root. The machine reads the
// root's number then alternating root-row/root-column fields. State holds the
// remaining count and whether the current row matched, not a position counter.
const sizes=cells.map(c=> {
 const {row,col}=parseCellId(c);
 const spec=NFA.encodeSpec({startState:{p:0},maxDepth:2+2*cells.length,
 transition:(s,v)=> {
  if(s.p===0) return {p:1,h:v};
  if(s.p===1) {const n=num(s.h,v);return validNum(n)?{p:2,left:n}:undefined;}
  if(s.p===2) return {p:3,left:s.left,hit:v===row-1};
  if(s.p===3) {const left=s.left-(s.hit&&v===col-1?1:0);return left>=0?{p:2,left}:undefined;}
  return undefined;
 },accept:s=>s.p===2&&s.left===0},shape);
 return or(notZero(c),new NFA(spec,'region size',hi.at(c),c,...cells.flatMap(x=>[rr.at(x),rc.at(x)])));
});
// Black interior border segments in the drawing, as their separated cells.
const walls=[[[3,2],[3,3]],[[4,6],[4,7]],[[4,10],[5,10]],
 [[5,12],[6,12]],[[6,12],[7,12]],[[6,4],[7,4]],
 [[4,3],[5,3]],[[3,5],[3,6]],[[5,3],[6,3]]];
const borders=walls.map(([a,b])=>numberConsecutive(makeCellId(...a),makeCellId(...b)));
return [shape,rr.toVar('region root row'),rc.toVar('region root column'),hi.toVar('number tens'),d3.toVar('distance modulo 3'),d7.toVar('distance modulo 7'),
 // The sole printed digit is the seed in the bottom row.
 new Given(makeCellId(12,7),1),new Given(hi.at('RcC7'),0),
 hi.makeReplicate(new Given(hi.at(cells[0]),0,1)),
 graph.makeReplicate(new Given(cells[0],0,1,2,3,4,5,6,7,8,9)),
 rr.makeReplicate(new Given(rr.at(cells[0]),...Array.from({length:12},(_,i)=>i))),
 d3.makeReplicate(new Given(d3.at(cells[0]),0,1,2)),
 d7.makeReplicate(new Given(d7.at(cells[0]),0,1,2,3,4,5,6)),
 ...domains,...descents,...adjacency,...sizes,...borders];
