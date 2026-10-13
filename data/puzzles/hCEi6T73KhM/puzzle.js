// Title: Foggy Banana Split
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=hCEi6T73KhM
// Source: https://sudokupad.app/23phi9d5m7

// Sudoku, chocolate rectangles, banana nonrectangles, circle component sizes,
// unambiguous endpoint shade counts, split-peas sums, and marked XV pairs.
// Omitted: shade-count clues on the three-circle stroke, whose scope is ambiguous.
const OR=(...xs)=>new Or(xs);
const AND=(...xs)=>new And(xs);
const shape = new Shape('9x9', '1-10');
const graph = cellGraph('9x9');
const cells = Array.from({length:81}, (_,i)=>makeCellId(1+Math.floor(i/9),1+i%9));
// VS uses 1 for chocolate and 2 for banana. VD/VE store distance residues plus 1.
const layers = ['VR','VC','VD','VE','VS','VH','VL'];
const id = (prefix,i)=>prefix+(i+1);
const at = (r,c)=>(r-1)*9+c-1;
const machine = (spec,name,cells)=>new NFA(NFA.encodeSpec(spec,shape),name,cells);
const same = (prefix,a,b)=>new SameValues(2,id(prefix,a),id(prefix,b));
// Root coordinates identify maximal same-shade components. Coprime residues
// encode BFS distances; their period 90 exceeds the board's 81 cells.
const roots = cells.map((cell,i)=> {
 const {row,col}=parseCellId(cell);
 return machine({startState:{p:0},maxDepth:4,
 transition:(s,v)=>{
  if(s.p===0)return v<=row ? {p:1,r:v}:undefined;
  if(s.p===1)return s.r<row||v<=col ? {p:2,self:s.r===row&&v===col}:undefined;
  if(s.p===2)return {p:3,self:s.self,d:v};
  if(s.p===3)return s.self===(s.d===1&&v===1)?{p:4}:undefined;
 },accept:s=>s.p===4},'reading-order root',[id('VR',i),id('VC',i),id('VD',i),id('VE',i)]);
});
const dec9=Pair.fnToKey((a,b)=>(a-1)===(b-2+9)%9,shape);
const dec10=Pair.fnToKey((a,b)=>(a-1)===(b-2+10)%10,shape);
const descents=cells.map((cell,i)=>OR(
 AND(new Given(id('VD',i),1),new Given(id('VE',i),1)),
 ...graph.neighbours(cell).map(n=>{
 const {row,col}=parseCellId(n); const j=at(row,col);
 return AND(same('VR',i,j),same('VC',i,j),
 new Pair(dec9,'depth predecessor',id('VD',j),id('VD',i)),
 new Pair(dec10,'depth predecessor',id('VE',j),id('VE',i)));
 })));
// Each edge ties equal shades to equal roots, and equal-root depths differ
// by -1, 0, or +1 in both residue layers. Size is broadcast inside a component.
const rootEdgeSpec=NFA.encodeSpec({startState:{p:0},maxDepth:7,
 transition:(s,v)=>{
 if(s.p===0)return {p:1,r:v};
 if(s.p===1)return {p:2,eq:s.r===v};
 if(s.p===2)return {p:3,eq:s.eq,c:v};
 if(s.p===3)return {p:4,eq:s.eq&&s.c===v};
 if(s.p===4)return {p:5,eq:s.eq,shade:v};
 if(s.p===5)return (s.shade===v)===s.eq?{p:6,eq:s.eq}:undefined;
 if(s.p===6)return (v===2)===s.eq?{p:7}:undefined;
 },accept:s=>s.p===7},shape);
const distanceSpec=NFA.encodeSpec({startState:{p:0},maxDepth:5,
 transition:(s,v)=>{
 if(s.p===0)return {p:1,eq:v===2};
 if(s.p===1)return {...s,p:2,a:v};
 if(s.p===2)return {...s,p:3,d:(v-s.a+9)%9,a:0};
 if(s.p===3)return {...s,p:4,a:v};
 if(s.p===4)return !s.eq||[-1,0,1].some(d=>s.d===(d+9)%9&&(v-s.a+10)%10===(d+10)%10)?{p:5}:undefined;
 },accept:s=>s.p===5},shape);
const edgePairs=cells.flatMap((cell,i)=>{const {row,col}=parseCellId(cell);return [[row+1,col],[row,col+1]].filter(([r,c])=>r<=9&&c<=9).map(([r,c])=>[i,at(r,c)]);});
const edges=edgePairs.map(([i,j],k)=>AND(
 new NFA(rootEdgeSpec,'component adjacency',...['VR','VC','VS'].flatMap(p=>[id(p,i),id(p,j)]),id('VQ',k)),
 new NFA(distanceSpec,'BFS edge distances',id('VQ',k),id('VD',i),id('VD',j),id('VE',i),id('VE',j)),
 OR(new Given(id('VQ',k),1),AND(same('VH',i,j),same('VL',i,j)))));
// A root counts exactly its own coordinate pairs, then exposes its size as
// 9*(high-1)+low. Nonroots leave this scan inactive; their size is broadcast.
// Scan depth 168 = 2 root fields + 162 coordinate fields + 2 size fields + 2 breaks.
const sizes=cells.map((cell,i)=>{
 const {row,col}=parseCellId(cell);
 const spec=NFA.encodeSpec({startState:{p:0},maxDepth:168,
 transition:(s,v)=>{
 if(v===SEGMENT_BREAK){
 if(s.p===2)return {p:3,active:s.active,count:0,match:false};
 if(s.p===3)return {p:5,active:s.active,count:s.count};
 return undefined;
 }
 if(s.p===0)return {p:1,r:v};
 if(s.p===1)return {p:2,active:s.r===row&&v===col};
 if(s.p===3)return {p:4,active:s.active,count:s.count,match:v===row};
 if(s.p===4)return {p:3,active:s.active,count:s.active?s.count+(s.match&&v===col?1:0):0,match:false};
 if(s.p===5)return {p:6,active:s.active,count:s.count,h:v};
 if(s.p===6)return !s.active||s.count===9*(s.h-1)+v ? {p:7}:undefined;
 },accept:s=>s.p===7},shape,{multiSegment:true});
 return new NFA(spec,'component size',[id('VR',i),id('VC',i)],cells.flatMap((_,j)=>[id('VR',j),id('VC',j)]),[id('VH',i),id('VL',i)]);
});
// Drawn circles, including the three isolated circles.
const circles=['R3C1','R1C2','R1C3','R4C2','R5C1','R3C4','R5C5','R7C2','R7C3','R6C4','R1C8','R6C7','R7C5','R8C7'];
const circleSizes=circles.map(c=>{const {row,col}=parseCellId(c);const i=at(row,col);return new Sum(9,[id('VH',i),9],id('VL',i),[c,-1]);});
// A connected orthogonal area is nonrectangular iff some 2x2 has three
// cells in it. Corner markers name the first banana cell in such a block.
const blocks=Array.from({length:64},(_,k)=>{const r=1+Math.floor(k/8),c=1+k%8;return [at(r,c),at(r,c+1),at(r+1,c),at(r+1,c+1)];});
const corners=blocks.map((b,k)=>OR(...Array.from({length:16},(_,mask)=>{
 const vals=b.map((_,t)=>(mask>>t&1)?2:1);const choco=vals.filter(v=>v===1).length;
 if(choco===3)return null;
 const banana=4-choco;const first=vals.indexOf(2);
 return AND(...b.map((i,t)=>new Given(id('VS',i),vals[t])),new Given(id('VF',k),banana===3?2:1),
 ...(banana===3?[new SameValues(2,id('VJ',k),id('VR',b[first])),new SameValues(2,id('VK',k),id('VC',b[first]))]:[new Given(id('VJ',k),1),new Given(id('VK',k),1)]));
 }).filter(Boolean)));
// Each corner scan reads 3 root/shade fields and 64 three-field markers: 195.
const bananaShapes=cells.map((cell,i)=>{
 const {row,col}=parseCellId(cell);
 const spec=NFA.encodeSpec({startState:{p:0},maxDepth:195,
 transition:(s,v)=>{
 if(s.p===0)return {p:1,r:v};
 if(s.p===1)return {p:2,self:s.r===row&&v===col};
 if(s.p===2)return {p:3,need:s.self&&v===2,found:false};
 if(s.p===3)return {p:4,need:s.need,found:s.found,flag:v===2};
 if(s.p===4)return {...s,p:5,match:s.flag&&v===row};
 if(s.p===5)return {p:3,need:s.need,found:s.found||(s.match&&v===col)};
 },accept:s=>s.p===3&&(!s.need||s.found)},shape);
 return new NFA(spec,'banana concave corner',id('VR',i),id('VC',i),id('VS',i),...blocks.flatMap((_,k)=>[id('VF',k),id('VJ',k),id('VK',k)]));
});
// Drawn green strokes; the two entries through R1C3 are used only to
// identify the affected stroke, whose three shade-count clues are omitted.
const lines=[
 ['R3C1','R2C1','R1C1','R1C2'],
 ['R4C2','R3C2','R3C3','R2C3','R1C3'],
 ['R1C3','R1C4','R1C5','R1C6','R1C7','R2C7','R2C8','R1C8'],
 ['R3C4','R3C5','R2C5','R2C6','R3C6','R4C6','R4C5','R5C5'],
 ['R6C4','R7C4','R8C4','R8C5','R9C5','R9C4','R9C3','R9C2','R8C2','R8C3','R7C3'],
 ['R6C7','R5C7','R4C7','R3C7','R3C8','R4C8','R5C8','R6C8','R7C8','R7C9','R8C9','R8C8','R8C7']];
// The setter defines Split Peas as digits strictly between two circles
// (Foggy Expeadition, https://logic-masters.de/Raetselportal/Raetsel/zeigen.php?id=000NSA).
// R1C3 bounds two stretches; every summed stretch has two circle targets.
const sums=lines.map(l=>OR(new Sum(0,...l.slice(1,-1),[l[0],-10],[l[l.length-1],-1]),new Sum(0,...l.slice(1,-1),[l[0],-1],[l[l.length-1],-10])));
const counts=lines.filter((_,k)=>k!==1&&k!==2).flatMap(l=>[l[0],l[l.length-1]].map(c=>{
 const {row,col}=parseCellId(c);const i=at(row,col);
 const spec=NFA.encodeSpec({startState:{p:0},maxDepth:l.length+2,
 transition:(s,v)=>{
 if(s.p===0)return {p:1,target:v};
 if(s.p===1)return {p:2,target:s.target,shade:v,count:0};
 const count=s.count+(v===s.shade?1:0);return count<=s.target?{...s,count}:undefined;
 },accept:s=>s.p===2&&s.count===s.target},shape);
 return new NFA(spec,'endpoint shade count',c,id('VS',i),...l.map(x=>{const q=parseCellId(x);return id('VS',at(q.row,q.col));}));
}));
// Drawn red X and blue V edges; white backing marks duplicate these glyphs.
const xs=[['R5C2','R6C2'],['R5C1','R6C1'],['R3C3','R3C4'],['R2C5','R2C6'],['R8C8','R8C9']];
return [shape,...layers.map(k=>new Var(k.slice(1),k,'9x9')),
 new Var('Q','same-component edge',144),cellGraph('9x16').makeOverlay('VQ').makeReplicate(new Given('VQ1',1,2)),
 ...['VF','VJ','VK'].map(k=>new Var(k.slice(1),k,64)),
 graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),
 ...['VR','VC','VD','VL'].map(k=>graph.makeOverlay(k).makeReplicate(new Given(id(k,0),1,2,3,4,5,6,7,8,9))),
 graph.makeOverlay('VS').makeReplicate(new Given('VS1',1,2)),
 ...roots,...descents,...edges,...sizes,...circleSizes,...corners,...bananaShapes,...sums,...counts,...xs.map(x=>new X(...x)),new V('R4C3','R4C4')];
