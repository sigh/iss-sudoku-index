// Title: Snake Egg (Star Battle)
// Author: JinHoo Ahn
// Video: https://www.youtube.com/watch?v=J5F5R-7mz1U
// Source: https://sudokupad.app/Tqfg9qNd2L

// A single orthogonal snake has two ends, no orthogonal self-touch or revisits,
// and contains a diagonal pair at each grey circle. Stars occupy its complement:
// two per row, column, and connected complement region, with no king adjacency.
const shape = new Shape('10x10', '0-15', 'Raw');
const g = cellGraph(shape), cells = g.cells();
const snake = g.makeOverlay('VS');
const rr = g.makeOverlay('VR'), rc = g.makeOverlay('VC');
const da = g.makeOverlay('VA'), db = g.makeOverlay('VB');
const pair = (fn, label, a, b) => new Pair(Pair.fnToKey(fn, shape), label, a, b);
const or = (...args) => new Or(args), and = (...args) => new And(args);
const same = (a,b) => new SameValues(2,a,b);
const nfa = (spec,name,list) => new NFA(NFA.encodeSpec(spec,shape),name,list);
const edges = cells.flatMap(a => g.neighbours(a).filter(b => cells.indexOf(a)<cells.indexOf(b)).map(b=>[a,b]));
const degreeGroups = Map.groupBy(cells,c=>JSON.stringify(g.neighbours(c).map(n=>{const a=parseCellId(c),b=parseCellId(n);return [b.row-a.row,b.col-a.col]})));
const degrees = [...degreeGroups.values()].map(origins => { const c=origins[0]; const clue=nfa({
  startState:{type:null,count:0},
  transition:({type,count},v)=>type===null ? (v<=2?{type:v,count:0}:undefined) :
    (v<=2 && (type===0 || count+(v!==0)<=2) ? {type,count:type===0?0:count+(v!==0)}:undefined),
  accept:({type,count})=>type===0 || count===(type===2?1:2),
},'snake degree',[snake.at(c),...snake.at(g.neighbours(c))]);
 return new Replicate([clue],Replicate.encodeTargetCells(snake.at(origins),snake.at(c),snake),snake.at(c));
});
// These corner positions come from the three drawn grey circles. A self-touch
// has opposite snake cells and the other two cells empty; three occupied cells
// would instead be an ordinary bend, without two separate snake sections.
const dots = [[3,2],[7,9],[9,6]].map(([r,c])=>{
  const a=makeCellId(r,c), b=makeCellId(r,c+1),
    d=makeCellId(r+1,c), e=makeCellId(r+1,c+1);
  return or(and(new Given(snake.at(a),1,2),new Given(snake.at(e),1,2),new Given(snake.at(b),0),new Given(snake.at(d),0)),
    and(new Given(snake.at(b),1,2),new Given(snake.at(d),1,2),new Given(snake.at(a),0),new Given(snake.at(e),0)));
});
// The first complement cell in reading order is its root. Root coordinates are
// constant across complement edges; zero coordinates and depths mark snake cells.
const roots = cells.map(c=>{
  const {row,col}=parseCellId(c);
  const earlier=pair((r,k)=>r>=1&&r<=row&&k>=1&&k<=10&&(r<row||k<col),'earlier root',rr.at(c),rc.at(c));
  return or(
    and(new Given(snake.at(c),1,2),new Given(rr.at(c),0),new Given(rc.at(c),0),new Given(da.at(c),0),new Given(db.at(c),0)),
    and(new Given(snake.at(c),0),new Given(rr.at(c),row),new Given(rc.at(c),col),new Given(da.at(c),0),new Given(db.at(c),0)),
    and(new Given(snake.at(c),0),earlier,or(new Given(da.at(c),...Array.from({length:10},(_,i)=>i+1)),new Given(db.at(c),...Array.from({length:12},(_,i)=>i+1)))));
});
// Depth residues use coprime 11 and 13: their product 143 exceeds 100 cells,
// excluding cyclic descent. Edge differences and descent fix true BFS distance.
const depthStep=(a,b,delta)=>and(
  pair((x,y)=>y===(x+delta+11)%11,'distance 11',da.at(a),da.at(b)),
  pair((x,y)=>y===(x+delta+13)%13,'distance 13',db.at(a),db.at(b)));
const descent=cells.map(c=>or(new Given(snake.at(c),1,2),
  and(new Given(da.at(c),0),new Given(db.at(c),0)),
  ...g.neighbours(c).map(n=>and(new Given(snake.at(n),0),same(rr.at(c),rr.at(n)),same(rc.at(c),rc.at(n)),depthStep(c,n,-1)))));
const regionEdges=edges.map(([a,b])=>or(new Given(snake.at(a),1,2),new Given(snake.at(b),1,2),
  and(same(rr.at(a),rr.at(b)),same(rc.at(a),rc.at(b)),or(depthStep(a,b,-1),depthStep(a,b,0),depthStep(a,b,1)))));
// A scan for each possible root counts stars naming it, and records whether that
// component exists. An absent root counts zero; every present root counts two.
const regionCounts=cells.map(c=>{
 const {row,col}=parseCellId(c);
 return nfa({startState:{phase:0,hit:false,exists:false,count:0},
 transition:(s,v)=>{
   if(s.phase===0)return {...s,phase:1,hit:v===row};
   if(s.phase===1)return {...s,phase:2,hit:s.hit&&v===col};
   if(v>1)return undefined;
   const count=s.count+(s.hit&&v===1);
   if(count>2)return undefined;
   return {phase:0,hit:false,exists:s.exists||s.hit,count};
 },accept:s=>s.phase===0&&(s.exists?s.count===2:s.count===0)},'two stars per complement component',
 cells.flatMap(x=>[rr.at(x),rc.at(x),x]));
});
return [shape,snake.toVar('snake'),rr.toVar('component root row'),rc.toVar('component root column'),da.toVar('distance mod 11'),db.toVar('distance mod 13'),
 g.makeReplicate(new Given(cells[0],0,1)),
 snake.makeReplicate(new Given(snake.at(cells[0]),0,1,2)),
 ...[rr,rc,da].map(layer=>layer.makeReplicate(new Given(layer.at(cells[0]),...Array.from({length:11},(_,i)=>i)))),
 db.makeReplicate(new Given(db.at(cells[0]),...Array.from({length:13},(_,i)=>i))),
 ...cells.map(c=>pair((s,v)=>s===0||v===0,'star outside snake',snake.at(c),c)),
 new ConnectedValues('VS',[1,2]),new ContainExact('2_2',...snake.at(cells)),...degrees,...dots,
 ...[...g.rows(),...g.columns()].map(line=>new ContainExact('1_1',...line)),
 ...[[0,1],[1,-1],[1,0],[1,1]].map(([dr,dc])=>{const origins=cells.filter(c=>g.step(c,dr,dc)!==null),a=origins[0];
  return new Replicate([pair((x,y)=>x!==1||y!==1,'stars do not touch',a,g.step(a,dr,dc))],Replicate.encodeTargetCells(origins,a,g),a);}),
 ...roots,...descent,...regionEdges,...regionCounts];
