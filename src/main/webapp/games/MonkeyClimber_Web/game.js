(() => {
"use strict";
const canvas=document.querySelector("#game"), ctx=canvas.getContext("2d");
const W=560,H=800,MP=45,MW=32,MH=40, images={};
for(const key of ["monkey","monkey_wall_left","monkey_wall_right","banana","crab"]){
 const im=new Image(); im.src="assets/"+key+".png";images[key]=im;
}
// 各スキンは専用のPNGを読み込む（Canvasでの色フィルターは使用しない）
for(const variant of ["blue","green","gold","purple","silver","rainbow"]){
 for(const pose of ["monkey","monkey_wall_left","monkey_wall_right"]){
  const key=pose+"_"+variant, im=new Image(); im.src="assets/"+key+".png";images[key]=im;
 }
}
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rectHit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const STORAGE_KEY="monkeyclimber_progress_v2";
const skins=[
 {name:"いつものサル",color:null,unlock:null},
 {name:"青いサル",color:"#56b9ff",unlock:"normal200"},
 {name:"緑のサル",color:"#69d477",unlock:"normal400"},
 {name:"金色のサル",color:"#f8d35b",unlock:"normal500"},
 {name:"紫のサル",color:"#b69aff",unlock:"hard200"},
 {name:"銀色のサル",color:"#d6e3ed",unlock:"hard400"},
 {name:"虹色のサル",color:"#ff88ba",unlock:"hard500"}
];
function loadProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}catch(e){return {}}}
const progress=loadProgress();
const state={screen:"title",mode:"normal",unlocked:!!progress.unlocked,best:progress.best||0,frame:0,acc:0,notice:"",noticeTime:0,
 skins:new Set(Array.isArray(progress.skins)?progress.skins:[]),skin:Math.max(0,Math.min(6,progress.skin||0))};
if(state.skin>0&&!state.skins.has(skins[state.skin].unlock))state.skin=0;
function saveProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({unlocked:state.unlocked,best:state.best,skins:[...state.skins],skin:state.skin}))}catch(e){}}
function unlockSkins(){
 for(const target of [200,400,500]){
  const id=state.mode+target;
  if(highest>=target&&!state.skins.has(id)){
   state.skins.add(id);state.notice="新しいスキン解放！ "+skins.find(v=>v.unlock===id).name;
   state.noticeTime=170;saveProgress();
  }
 }
}
let player,cam,generated,seg,lastCrab,spikes,blocks,crabs,bananas,persimmons,fx,highest,bananaCount,healStock;
function chamber(m,start,up,hold,down,amt){if(m<start||m>=start+up+hold+down)return 0;
 if(m<start+up)return amt*(m-start)/up;
 if(m<start+up+hold)return amt;
 return amt*(1-(m-start-up-hold)/down);
}
function wall(m,left){
 m=((m%180)+180)%180;
 let shift=0,pinch=0,exL=0,exR=0;
 if(m>=28&&m<31)shift=90*(m-28)/3;
 else if(m>=31&&m<37)shift=90;
 else if(m>=37&&m<40)shift=90*(40-m)/3;
 else if(m>=96&&m<99)shift=-90*(m-96)/3;
 else if(m>=99&&m<105)shift=-90;
 else if(m>=105&&m<108)shift=-90*(108-m)/3;
 if(m>=120&&m<123)pinch=80*(m-120)/3;
 else if(m>=123&&m<129)pinch=80;
 else if(m>=129&&m<132)pinch=80*(132-m)/3;
 if(m>=143&&m<146)exL=85*(m-143)/3;
 else if(m>=146&&m<153)exL=85;
 else if(m>=153&&m<156)exL=85*(156-m)/3;
 if(m>=149&&m<152)exR=-75*(m-149)/3;
 else if(m>=152&&m<159)exR=-75;
 else if(m>=159&&m<162)exR=-75*(162-m)/3;
 const out=Math.max(chamber(m,55,3,4,3,35),chamber(m,70,4,8,4,65));
 let l=clamp(75+shift+pinch+exL-out,12,W-12);
 let r=clamp(485+shift-pinch+exR+out,12,W-12);
 if(r-l<100){const mid=(l+r)/2;l=clamp(mid-50,12,W-112);r=l+100;}
 return left?l:r;
}
function edge(y,left){return wall((40-y)/MP,left);}
function reset(){
 player={x:(W-MW)/2,y:0,vx:0,vy:0,face:1,hp:3,inv:0,ground:true,cling:0,double:false,cool:0,block:null,blockSide:0};
 cam=player.y-H*.65;generated=40;seg=0;lastCrab=0;highest=0;bananaCount=0;healStock=0;
 spikes=[];blocks=[];crabs=[];bananas=[];persimmons=[];fx=[];state.frame=0;state.acc=0;state.notice="";state.noticeTime=0;
 generate(cam-H-400);
}
function generate(target){
 while(generated>target){
  const y=generated-10,m=(40-y)/MP,l=edge(y,true),r=edge(y,false),lb=edge(generated,true),rb=edge(generated,false);
  const width=Math.min(r-l,rb-lb),movement=Math.abs(l-lb)+Math.abs(r-rb),safe=width>=330&&movement<=1.5;
  seg++;
  const tier=m>=400?2:m>=200?1:0, spEvery=[27,27,14][tier],blEvery=[42,44,22][tier],crEvery=[60,60,30][tier],baEvery=[40,30,23][tier];
  if(safe){
   // 同じ高さの帯にはカニ・トゲ・ブロックを同時配置しない。
   // 画像の高さ・当たり判定に加え、視覚的な余白も確保する。
   const sy=y+2,by=y-44,cy=y-105;
   const reserved=(yy,h,margin=18)=>
    spikes.some(o=>yy<o.y+o.h+margin&&yy+h>o.y-margin)||
    blocks.some(o=>yy<o.y+o.h+margin&&yy+h>o.y-margin)||
    crabs.some(o=>yy<o.y+o.h+margin&&yy+h>o.y-margin);
   // 候補の発生頻度を約2倍にし、配置不可なら次の候補を試す。
   // 優先度は候補の発生周期ごとに自然に変わる。
   // トゲ全体（高さ72px）の上下と前後の壁が直線的な垂直壁かを検査。
   // 10px刻みの一部だけが平らでも、途中に斜面があれば設置しない。
   const spikeWallIsVertical=(leftSide)=>{
    const reference=edge(sy,leftSide);
    for(let checkY=sy-12;checkY<=sy+72+12;checkY+=3){
     if(Math.abs(edge(checkY,leftSide)-reference)>0.5)return false;
    }
    return true;
   };
   if(seg%spEvery===0&&!reserved(sy,72)){
    const left=Math.floor(seg/spEvery)%2===0;
    // 0～10mの右壁は安全地帯
    if(spikeWallIsVertical(left) &&
       (left||((40-sy)/MP<0||(40-(sy+72))/MP>10)))
     spikes.push({x:left?edge(sy,true)-2:edge(sy,false)-12,y:sy,w:20,h:72,left});
   }
   if(seg%blEvery===0&&!reserved(by,54)){
    const cx=(l+r)/2;
    blocks.push({x:cx-27,y:by,w:54,h:54,min:l+40,max:r-40-54,v:Math.floor(seg/210)%2===0?1.5:-1.5,dx:0,prevX:cx-27});
   }
   if(seg%baEvery===0)bananas.push({x:(l+r)/2,y:y-28});
   if(seg%crEvery===0&&!reserved(cy,32)&&Math.abs(y-lastCrab)>100){
    let cl=-Infinity,cr=Infinity,minW=Infinity;
    for(let yy=cy;yy<=cy+32;yy+=6){cl=Math.max(cl,edge(yy,true));cr=Math.min(cr,edge(yy,false));}
    for(let yy=cy-80;yy<=cy+104;yy+=8)minW=Math.min(minW,edge(yy,false)-edge(yy,true));
    const min=cl+88,max=cr-88-44;
    if(minW>=330&&max>min+32){
     crabs.push({x:(min+max)/2,y:cy,w:44,h:32,min,max,v:1.3,drop:rand(80,160),warn:0});
     lastCrab=y;
    }
   }
  }
  generated=y;
 }
}
function burst(x,y,color,n=15,power=4){
 for(let i=0;i<n;i++)fx.push({x,y,vx:rand(-power,power),vy:rand(-power,power),life:rand(12,30),max:30,color,r:rand(2,5)});
}
function damage(reason,knockX=0){
 if(player.inv>0||state.screen!=="playing")return;
 player.hp--;
 if(healStock>0&&player.hp<3){healStock--;player.hp++;state.notice="回復ストックを1個使用！";state.noticeTime=90;burst(player.x+16,player.y+18,"#75f4aa",25,5);}
 player.inv=55;player.vy=-5;player.vx=knockX;player.cling=0;player.ground=false;player.block=null;player.blockSide=0;
 burst(player.x+16,player.y+20,"#ff716d",30,6);
 if(player.hp<=0){state.screen="over";state.notice=reason;}
}
function jump(){
 if(state.screen==="title"){start("normal");return;}
 if(state.screen==="over"){start(state.mode);return;}
 if(state.screen==="paused"){state.screen="playing";return;}
 if(state.screen!=="playing")return;
 if(player.ground){
  player.vy=-11.8;player.vx=player.face*9.8;player.ground=false;player.double=true;player.block=null;player.blockSide=0;
  burst(player.x+16,player.y+MH,"#f6c85a",26,5);
 }else if(player.cling&&player.cool<=0){
  player.face=player.cling===-1?1:-1;
  player.vy=-12;player.vx=player.face*9.8;player.cling=0;player.cool=6;player.double=true;player.block=null;player.blockSide=0;
  burst(player.x+16,player.y+20,"#ffdd7e",30,7);
 }else if(player.double&&!player.cling){
  player.vy=-11.6;player.vx=player.face*9.8;player.double=false;player.block=null;player.blockSide=0;
  burst(player.x+16,player.y+20,"#91f3ff",40,7);
 }
}
function start(mode){if(mode==="hard"&&!state.unlocked)return;state.mode=mode;reset();state.screen="playing";}
function onStartGround(){return player.y+MH>=40-1&&player.y<40&&player.block===null;}
function update(){
 state.frame++;
 if(state.noticeTime>0)state.noticeTime--;
 if(player.inv>0)player.inv--;
 if(player.cool>0)player.cool--;
 // ブロックの移動量を毎フレーム計算し、つかまったサルも同じだけ動かす
 for(const b of blocks){
  const old=b.x;b.prevX=old;b.x+=b.v;
  if(b.x<b.min||b.x>b.max){b.x=clamp(b.x,b.min,b.max);b.v*=-1;}
  b.dx=b.x-old;
 }
 const riding=player.block,grabbing=player.blockSide!==0&&riding!==null;
 if(riding){
  player.x+=riding.dx;
  if(grabbing){
   player.x=player.blockSide<0?riding.x-MW:riding.x+riding.w;
   player.y=clamp(player.y,riding.y-MH+6,riding.y+riding.h-6);
  }else{
   player.y=riding.y-MH;
  }
 }
 const oldX=player.x,oldY=player.y;
 if(player.cling){player.vx=0;player.vy=0;}
 else if(riding){player.vx=0;player.vy=0;}
 else player.vy=Math.min(12,player.vy+.44);
 player.x+=player.vx;player.y+=player.vy;
 player.ground=!!(riding&&!grabbing);
 // 斜面の壁は中心点だけでなく、サルの上・中央・下を含めた全身で判定する。
 // 下向きに落ちている間も、斜面がサルに接触した瞬間に壁つかまりへ移行する。
 // 壁キック直後だけは再吸着を抑止し、壁から離れるジャンプを保証する。
 function wallBounds(y){
  const samples=[y+2,y+MH*.25,y+MH*.5,y+MH*.75,y+MH-2];
  return {l:Math.max(...samples.map(yy=>edge(yy,true))),
          r:Math.min(...samples.map(yy=>edge(yy,false)))};
 }
 if(!riding){
  const before=wallBounds(oldY), after=wallBounds(player.y);
  // 移動前後の壁形状をまとめて検査し、長い斜面でも壁を飛び越えない。
  const l=Math.max(before.l,after.l),r=Math.min(before.r,after.r);
  const leftHit=player.x<=l+1;
  const rightHit=player.x+MW>=r-1;
  let side=0;
  if(leftHit&&rightHit){
   // 非常に狭い通路では、接近している側を優先する。
   side=Math.abs(player.x-l)<Math.abs(player.x+MW-r)?-1:1;
  }else if(leftHit)side=-1;
  else if(rightHit)side=1;
  if(side!==0){
   const wallX=side<0?after.l:after.r-MW;
   player.x=wallX;
   // 壁キックの離脱中は衝突補正だけ行い、再度つかまらない。
   const movingAway=side<0?player.vx>0:player.vx<0;
   if(player.cool<=0&&!movingAway){
    const newlyClung=player.cling!==side;
    player.cling=side;player.vx=0;player.vy=0;player.double=true;
    player.ground=false;
    if(newlyClung)burst(side<0?player.x:player.x+MW,player.y+MH/2,"#d8f9f5",7,2);
   }else if((side<0&&player.vx<0)||(side>0&&player.vx>0))player.vx=0;
  }else if(player.cling){
   // 壁から本当に離れたときのみつかまり解除。
   player.cling=0;
  }
  // 壁に吸着している間は毎フレーム、現在の斜面に位置を合わせる。
  if(player.cling===-1)player.x=wallBounds(player.y).l;
  else if(player.cling===1)player.x=wallBounds(player.y).r-MW;
 }
 if(!riding){
  // 連続衝突判定: 上面・下面・左右面のうち最初に横切った面で停止する。
  // 下から飛び込んだ際にブロックを通り抜ける問題を防ぐ。
  const hits=[];
  const nowX=player.x,nowY=player.y;
  const dx=nowX-oldX,dy=nowY-oldY;
  for(const b of blocks){
   const bx0=b.prevX??b.x, bx1=b.x;
   const bdx=bx1-bx0;
   const relDx=dx-bdx;
   const overlapXAt=t=>{
    const px=oldX+dx*t, bx=bx0+bdx*t;
    return px+MW>bx+2&&px<bx+b.w-2;
   };
   const overlapYAt=t=>{
    const py=oldY+dy*t;
    return py+MH>b.y+2&&py<b.y+b.h-2;
   };
   // 上面: 下向きに通過した場合
   if(dy>0&&oldY+MH<=b.y+1&&nowY+MH>=b.y){
    const t=(b.y-(oldY+MH))/dy;
    if(t>=0&&t<=1&&overlapXAt(t))hits.push({t,b,side:'top'});
   }
   // 下面: 上向きに通過した場合
   if(dy<0&&oldY>=b.y+b.h-1&&nowY<=b.y+b.h){
    const t=(b.y+b.h-oldY)/dy;
    if(t>=0&&t<=1&&overlapXAt(t))hits.push({t,b,side:'bottom'});
   }
   // 横面: ブロック自身の移動も考慮した相対速度
   if(relDx>0&&oldX+MW<=bx0+2&&nowX+MW>=bx1){
    const t=(bx0-(oldX+MW))/relDx;
    if(t>=0&&t<=1&&overlapYAt(t))hits.push({t,b,side:'left'});
   }
   if(relDx<0&&oldX>=bx0+b.w-2&&nowX<=bx1+b.w){
    const t=(bx0+b.w-oldX)/relDx;
    if(t>=0&&t<=1&&overlapYAt(t))hits.push({t,b,side:'right'});
   }
  }
  hits.sort((a,b)=>a.t-b.t);
  if(hits.length){
   const {b,side}=hits[0];
   if(side==='top'){
    player.y=b.y-MH;player.vy=0;player.vx=0;player.ground=true;
    player.block=b;player.blockSide=0;player.cling=0;player.double=true;
   }else if(side==='bottom'){
    player.y=b.y+b.h;player.vy=Math.max(0,player.vy);
    player.cling=0;
    burst(player.x+MW/2,b.y+b.h,'#b7e5f7',8,2);
   }else{
    player.block=b;player.blockSide=side==='left'?-1:1;
    player.x=side==='left'?b.x-MW:b.x+b.w;
    player.cling=side==='left'?1:-1;
    player.vx=0;player.vy=0;player.double=true;
   }
  }
 }
 // ブロックがサルに食い込んだ場合の補正。高速移動・斜面補正・
 // ブロック自身の移動によるすり抜けを防ぐ。
 if(!player.block){
  for(const b of blocks){
   const px=player.x,py=player.y;
   if(!rectHit({x:px,y:py,w:MW,h:MH},b))continue;
   const prevBX=b.prevX??b.x;
   const fromTop=oldY+MH<=b.y+5&&player.vy>=0;
   const fromBottom=oldY>=b.y+b.h-5&&player.vy<=0;
   const fromLeft=oldX+MW<=prevBX+5;
   const fromRight=oldX>=prevBX+b.w-5;
   if(fromTop){
    player.y=b.y-MH;player.vy=0;player.vx=0;player.ground=true;
    player.block=b;player.blockSide=0;player.cling=0;player.double=true;
   }else if(fromBottom){
    player.y=b.y+b.h;player.vy=Math.max(0,player.vy);player.cling=0;
    // 天井に当たっても未使用の2段ジャンプは保持する
   }else if(fromLeft||fromRight){
    const side=fromLeft?-1:1;
    player.x=side<0?b.x-MW:b.x+b.w;
    player.block=b;player.blockSide=side;player.cling=side<0?1:-1;
    player.vx=0;player.vy=0;player.double=true;
   }else{
    // 既に重なった状態から始まっても最短距離で押し出す
    const exits=[
     {d:Math.abs(py+MH-b.y),side:"top"},
     {d:Math.abs(py-(b.y+b.h)),side:"bottom"},
     {d:Math.abs(px+MW-b.x),side:"left"},
     {d:Math.abs(px-(b.x+b.w)),side:"right"}
    ].sort((a,b)=>a.d-b.d);
    const side=exits[0].side;
    if(side==="top"){player.y=b.y-MH;player.vy=0;player.ground=true;player.block=b;player.blockSide=0;player.double=true;}
    else if(side==="bottom"){player.y=b.y+b.h;player.vy=Math.max(0,player.vy);}
    else{player.x=side==="left"?b.x-MW:b.x+b.w;player.block=b;player.blockSide=side==="left"?-1:1;player.cling=side==="left"?1:-1;player.vx=0;player.vy=0;player.double=true;}
   }
   break;
  }
 }
 if(!player.block&&player.y+MH>=40&&oldY+MH<=50&&player.vy>=0){
  player.y=40-MH;player.vy=0;player.ground=true;player.cling=0;player.double=true;
 }
 const pr={x:player.x,y:player.y,w:MW,h:MH};
 for(const s of spikes){
  if(s.y>player.y+MH||s.y+s.h<player.y)continue;
  const away=player.vy<0&&((s.left&&player.vx>0)||(!s.left&&player.vx<0));
  if(away)continue;
  for(let i=0;i<6;i++){
   const ty=s.y+(i+.5)*s.h/6;
   const wallX=edge(ty,s.left);
   const tip={x:(s.left?wallX+18:wallX-18)-3.5,y:ty-3.5,w:7,h:7};
   if(rectHit(pr,tip)){damage("鉄のトゲに当たった！",s.left?7.5:-7.5);break;}
  }
 }
 const meters=Math.max(0,Math.floor((40-player.y)/MP));
 highest=Math.max(highest,meters);if(highest>state.best){state.best=highest;if(highest%10===0)saveProgress();}
 unlockSkins();
 if(meters>=200&&meters<201&&state.noticeTime===0){state.notice="200m 突破！";state.noticeTime=75;}
 if(meters>=400&&meters<401&&state.noticeTime===0){state.notice="400m 突破！";state.noticeTime=75;}
 if(highest>=500&&!state.unlocked&&state.mode==="normal"){state.unlocked=true;saveProgress();state.notice="ハードモード解放！";state.noticeTime=180;burst(player.x,player.y,"#ffe45d",80,9);}
 cam+=(player.y-H*.58-cam)*.15;
 generate(cam-H-400);
 for(let i=bananas.length-1;i>=0;i--){
  const b=bananas[i];if(Math.abs(player.x+16-b.x)<26&&Math.abs(player.y+20-b.y)<28){
   bananas.splice(i,1);bananaCount++;burst(b.x,b.y,"#ffdc41",14,4);
   if(bananaCount%10===0){
    if(player.hp<3){player.hp++;state.notice="🍌 10本でハート +1";}
    else{healStock++;state.notice="🍌 回復ストック +1";}
    state.noticeTime=85;
   }
  }
 }
 for(let i=crabs.length-1;i>=0;i--){
  const c=crabs[i];
  c.x+=c.v;if(c.x<c.min||c.x>c.max){c.x=clamp(c.x,c.min,c.max);c.v*=-1;}
  let cl=-Infinity,cr=Infinity;
  for(let yy=c.y;yy<=c.y+c.h;yy+=6){cl=Math.max(cl,edge(yy,true));cr=Math.min(cr,edge(yy,false));}
  const min=Math.max(c.min,cl+88),max=Math.min(c.max,cr-88-44);
  if(min<=max){c.x=clamp(c.x,min,max);if(c.x<=min)c.v=Math.abs(c.v);if(c.x>=max)c.v=-Math.abs(c.v);}
  if(rectHit(pr,{x:c.x,y:c.y,w:c.w,h:c.h})&&player.inv<=0){
   if(player.vy>.5&&player.y+MH-12<c.y+c.h*.5){player.vy=-11.2;player.double=true;player.hp=Math.min(3,player.hp+1);crabs.splice(i,1);state.notice="カニを踏んでハート +1";state.noticeTime=85;burst(c.x+c.w/2,c.y+c.h/2,"#ff995c",30,6);continue;}
   damage("カニに挟まれた！",player.x<c.x?-7:7);
  }
  if(c.warn>0){c.warn--;if(c.warn===0&&!onStartGround()){persimmons.push({x:c.x+16,y:c.y+22,vx:rand(-.6,.6),vy:1,r:0});burst(c.x+c.w/2,c.y+c.h/2,"#ffa53d",24,6);}}
  else if(--c.drop<=0){
   if(!onStartGround()&&Math.abs(c.x-(player.x+16))<140&&player.y>c.y&&player.y-c.y<480){c.warn=45;burst(c.x+c.w/2,c.y,"#ffe33b",18,4);}
   c.drop=rand(meters>=400?35:meters>=200?50:70,meters>=400?65:meters>=200?85:115);
  }
 }
 for(let i=persimmons.length-1;i>=0;i--){
  const p=persimmons[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.r+=.1;
  if(!onStartGround()&&Math.hypot(p.x-player.x-16,p.y-player.y-20)<22){damage("柿が当たった！",player.x<p.x?-3:3);persimmons.splice(i,1);burst(p.x,p.y,"#ff7b29",15,5);continue;}
  if(p.y>=40||p.y>cam+H+100)persimmons.splice(i,1);
 }
 for(let i=fx.length-1;i>=0;i--){const p=fx[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life--;if(p.life<=0)fx.splice(i,1);}
 const bottom=cam+H+500;
 spikes=spikes.filter(s=>s.y<bottom);blocks=blocks.filter(b=>b.y<bottom);
 crabs=crabs.filter(c=>c.y<bottom);bananas=bananas.filter(b=>b.y<bottom);
 if(player.y>cam+H+60){state.screen="over";state.notice="奈落に落ちた！";}
}
function img(key,x,y,w,h,flip=false){
 const variant=[null,"blue","green","gold","purple","silver","rainbow"][state.skin];
 const selected=variant&&key.startsWith("monkey")?images[key+"_"+variant]:null;
 const sprite=selected&&selected.complete&&selected.naturalWidth?selected:images[key];
 if(!sprite||!sprite.complete||!sprite.naturalWidth)return;
 ctx.save();if(flip){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(sprite,0,y,w,h);}
 else ctx.drawImage(sprite,x,y,w,h);ctx.restore();
}
function drawCrab(c){
 ctx.save();ctx.translate(c.x+c.w/2,c.y+c.h/2);ctx.scale(c.w/44,c.h/32);
 ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#74311f";ctx.lineWidth=2.6;
 // 左右の足
 for(const dir of [-1,1]){
  for(let i=0;i<3;i++){const yy=-4+i*6;ctx.beginPath();ctx.moveTo(dir*12,yy);ctx.lineTo(dir*(19+i*2),yy+4);ctx.lineTo(dir*(22+i*2),yy+10);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(dir*12,-7);ctx.quadraticCurveTo(dir*22,-17,dir*23,-8);ctx.lineTo(dir*19,-1);ctx.stroke();
  ctx.fillStyle="#f06439";ctx.beginPath();ctx.ellipse(dir*21,-10,7,8,dir*.4,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#ffd49b";ctx.beginPath();ctx.ellipse(dir*20,-12,2.4,2.7,0,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle="#ec633b";ctx.beginPath();ctx.ellipse(0,2,16,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle="#ffab74";ctx.beginPath();ctx.ellipse(-4,-3,9,4,-.1,0,Math.PI*2);ctx.fill();
 for(const xx of [-6,6]){ctx.fillStyle="#fff7dc";ctx.beginPath();ctx.arc(xx,-1,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#29232a";ctx.beginPath();ctx.arc(xx+1,-1,1.6,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle="#7b3322";ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,5,4,0,Math.PI);ctx.stroke();ctx.restore();
}
function text(t,x,y,size=20,color="#fff",align="center"){
 ctx.save();ctx.textAlign=align;ctx.font=`bold ${size}px "Yu Gothic",sans-serif`;
 ctx.lineWidth=4;ctx.strokeStyle="#23303a";ctx.strokeText(t,x,y);ctx.fillStyle=color;ctx.fillText(t,x,y);ctx.restore();
}
// 高度ごとに背景の時間帯と壁材が変わる。ゾーン制ではなく循環する景観。
function palette(m){
 const sets=[
  {bg:["#c6d7c5","#e4d7b1"],wall:"#765941",line:"#463e33",accent:"#c0a07c",time:"day"},
  {bg:["#a3c5b1","#d4e1b7"],wall:"#416b55",line:"#2a4c43",accent:"#8ab98d",time:"day"},
  {bg:["#ed9c7e","#f4d4a1"],wall:"#80615b",line:"#593c42",accent:"#e3a68b",time:"sunset"},
  {bg:["#101b3f","#30446a"],wall:"#4b526c",line:"#252b47",accent:"#91a4d0",time:"night"},
  {bg:["#0c1531","#26365b"],wall:"#4c476c",line:"#2e2948",accent:"#9b8ec7",time:"night"},
  {bg:["#778da8","#d0dce1"],wall:"#697c8a",line:"#465562",accent:"#b3c9d4",time:"dawn"},
  {bg:["#9bc9df","#e2f0eb"],wall:"#647f79",line:"#3d5754",accent:"#b2d2b4",time:"day"},
  {bg:["#d5b6a0","#ebd6b3"],wall:"#856a51",line:"#554331",accent:"#c3a57b",time:"sunset"},
  {bg:["#16213b","#394b68"],wall:"#55576a",line:"#34384c",accent:"#a7b5c8",time:"night"},
  {bg:["#9ca9bc","#d8d7d3"],wall:"#66737b",line:"#45545c",accent:"#c3cdd5",time:"dawn"}
 ];
 return sets[Math.floor(Math.max(0,m)/85)%sets.length];
}
function drawSkyDecor(p,meters){
 const night=p.time==="night",dawn=p.time==="dawn",sunset=p.time==="sunset";
 // 星の配置は決定的に計算し、毎フレームちらつかないようにする。
 if(night||dawn){
  for(let i=0;i<90;i++){
   const x=(i*137.51+17)%W,y=(i*79.31+23)%H;
   const size=i%9===0?2:1;
   ctx.globalAlpha=night?.35+(i%5)*.12:.2+(i%4)*.08;
   ctx.fillStyle=i%7===0?"#b5d6ff":"#ffffff";
   ctx.fillRect(x,y,size,size);
  }
  ctx.globalAlpha=1;
  const moonX=440,moonY=110;
  ctx.fillStyle=night?"#f7f0cf":"#f2e6d7";
  ctx.beginPath();ctx.arc(moonX,moonY,night?27:19,0,Math.PI*2);ctx.fill();
  if(night){ctx.fillStyle=p.bg[0];ctx.beginPath();ctx.arc(moonX+11,moonY-7,25,0,Math.PI*2);ctx.fill();}
 }else{
  ctx.globalAlpha=.72;ctx.fillStyle=sunset?"#ffe6a4":"#fff6cc";
  ctx.beginPath();ctx.arc(440,125,26,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }
 // 雲と霞は奥の背景に固定し、プレイヤーやギミックの当たり判定に影響しない。
 ctx.fillStyle=night?"#7081a32b":sunset?"#fff1d059":"#ffffff55";
 for(let i=0;i<7;i++){
  const x=(i*163+39)%W,y=(i*117+120)%H;
  ctx.beginPath();ctx.ellipse(x,y,58,13,0,0,Math.PI*2);ctx.ellipse(x+24,y-7,31,15,0,0,Math.PI*2);ctx.fill();
 }
}
function drawWallTexture(pattern,l,r,y,style){
 // 壁の内側だけをクリップして、空中へ模様がはみ出さないようにする。
 ctx.save();ctx.beginPath();ctx.rect(0,y,Math.max(0,l-2),11);ctx.rect(r+2,y,Math.max(0,W-r-2),11);ctx.clip();
 ctx.strokeStyle=style.accent;ctx.fillStyle=style.accent;ctx.globalAlpha=.55;ctx.lineWidth=1.4;
 const k=Math.floor(y/10),slots=[8,25,43,60,W-60,W-43,W-25,W-8];
 if(pattern===0){ // 岩の割れ目
  if(k%4===0)for(const x of slots){ctx.beginPath();ctx.moveTo(x-5,y+1);ctx.lineTo(x+2,y+6);ctx.lineTo(x-1,y+10);ctx.stroke();}
 }else if(pattern===1){ // レンガの目地
  if(k%3===0){ctx.beginPath();ctx.moveTo(0,y+2);ctx.lineTo(W,y+2);ctx.stroke();}
  if(k%3===1)for(const x of slots){ctx.beginPath();ctx.moveTo(x+(k%2)*6,y);ctx.lineTo(x+(k%2)*6,y+10);ctx.stroke();}
 }else if(pattern===2){ // 石のモザイク
  if(k%2===0)for(const x of slots){ctx.beginPath();ctx.ellipse(x,y+5,7,4,0,0,Math.PI*2);ctx.stroke();}
 }else if(pattern===3){ // ツタと葉
  for(const x of [14,42,W-14,W-42]){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+4,y+5,x,y+11);ctx.stroke();if(k%3===0){ctx.beginPath();ctx.ellipse(x+5,y+5,5,2,-.5,0,Math.PI*2);ctx.fill();}}
 }else if(pattern===4){ // 金属パネル
  if(k%5===0){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}if(k%3===0)for(const x of slots){ctx.fillRect(x,y+3,3,3);}
 }else if(pattern===5){ // 結晶の筋
  if(k%3===0)for(const x of slots){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+5,y+5);ctx.lineTo(x,y+10);ctx.stroke();}
 }else if(pattern===6){ // サイバーパンク：ネオン回路と発光ノード
  ctx.strokeStyle=k%2===0?"#00f4ff":"#ff4fe6";ctx.fillStyle="#7afaff";ctx.globalAlpha=.95;ctx.lineWidth=2;
  for(const x of slots){if(k%3===0){ctx.beginPath();ctx.moveTo(x-5,y+1);ctx.lineTo(x+2,y+1);ctx.lineTo(x+2,y+9);ctx.stroke();ctx.fillRect(x,y+5,4,4);}}
 }else if(pattern===7){ // 格子
  if(k%3===0){ctx.beginPath();ctx.moveTo(0,y+4);ctx.lineTo(W,y+4);ctx.stroke();}for(const x of slots){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+10);ctx.stroke();}
 }else if(pattern===8){ // 斑点
  if(k%2===0)for(const x of slots){ctx.beginPath();ctx.arc(x+(k%3)*2,y+5,2.4,0,Math.PI*2);ctx.fill();}
 }else{ // 斜めの地層
  if(k%2===0)for(const x of slots){ctx.beginPath();ctx.moveTo(x-8,y+10);ctx.lineTo(x+8,y);ctx.stroke();}
 }
 ctx.restore();
}
function render(){
 ctx.clearRect(0,0,W,H);
 const p=palette((40-(cam+H*.5))/MP);
 const bg=ctx.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,p.bg[0]);bg.addColorStop(1,p.bg[1]);
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 drawSkyDecor(p,(40-(cam+H*.5))/MP);
 ctx.save();ctx.translate(0,-cam);
 const top=cam-20,bottom=cam+H+20;
 // 地面は見えている画面の下端よりさらに下まで塗る
 ctx.fillStyle="#73583b";ctx.fillRect(0,40,W,Math.max(H+2000,bottom-40+2000));
 ctx.fillStyle="#568750";ctx.fillRect(0,38,W,6);
 // 壁の形状はVB版と同じ GetWallInnerX を10pxごとにサンプリング
 for(let y=Math.floor(top/10)*10;y<bottom;y+=10){
  const l1=edge(y,true),l2=edge(y+10,true),r1=edge(y,false),r2=edge(y+10,false),m=(40-y)/MP;
  const style=palette(m);
  ctx.fillStyle=style.wall;ctx.strokeStyle=style.line;ctx.lineWidth=1.1;
  ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(l1,y);ctx.lineTo(l2,y+10);ctx.lineTo(0,y+10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(r1,y);ctx.lineTo(W,y);ctx.lineTo(W,y+10);ctx.lineTo(r2,y+10);ctx.closePath();ctx.fill();ctx.stroke();
  // 木目を使わず、サイバー回路を含む10種類の模様を高度85mごとに切り替える
  const pattern=Math.floor(Math.max(0,m)/85)%10;
  drawWallTexture(pattern,l1,r1,y,style);
  ctx.strokeStyle=style.accent;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(l1,y);ctx.lineTo(l2,y+10);ctx.moveTo(r1,y);ctx.lineTo(r2,y+10);ctx.stroke();
 }
 // 地面の上端はすでに描画済み。下端の水平線は描画しない。
 for(const s of spikes){if(s.y>bottom||s.y+s.h<top)continue;
  for(let i=0;i<6;i++){const y=s.y+i*12,midY=y+6;
   // 斜面の壁の境界を各トゲごとに取得して根元を壁に埋め込む
   const rootTop=edge(y,s.left),rootMid=edge(midY,s.left),rootBot=edge(y+10,s.left);
   ctx.beginPath();
   if(s.left){ctx.moveTo(rootTop-3,y);ctx.lineTo(rootMid+20,midY);ctx.lineTo(rootBot-3,y+12);}
   else{ctx.moveTo(rootTop+3,y);ctx.lineTo(rootMid-20,midY);ctx.lineTo(rootBot+3,y+12);}
   ctx.closePath();ctx.fillStyle="#d3e8ee";ctx.fill();ctx.strokeStyle="#456476";ctx.stroke();}
 }
 for(const b of blocks){if(b.y>bottom||b.y+b.h<top)continue;
  ctx.fillStyle="#6e91b4";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle="#e1f5ff";ctx.lineWidth=3;ctx.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);
  ctx.fillStyle="#a9d8f1";ctx.fillRect(b.x+9,b.y+9,b.w-18,b.h-18);
 }
 for(const b of bananas){if(b.y>bottom||b.y<top)continue;img("banana",b.x-15,b.y-15,30,30);}
 for(const c of crabs){if(c.y>bottom||c.y<top-30)continue;img("crab",c.x-7,c.y-7,c.w+14,c.h+14,c.v<0);
  if(c.warn>0){ctx.strokeStyle=c.warn%10<5?"#ffeb6b":"#ff812e";ctx.lineWidth=3;ctx.beginPath();ctx.arc(c.x+c.w/2,c.y+12,27+(45-c.warn)%12,0,Math.PI*2);ctx.stroke();}
 }
 for(const p of persimmons){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle="#ec7b2b";ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle="#43884b";ctx.fillRect(-3,-12,6,5);ctx.restore();}
 for(const p of fx){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 if(player.inv===0||Math.floor(player.inv/4)%2===0){
  let key="monkey";if(player.cling===-1)key="monkey_wall_left";else if(player.cling===1)key="monkey_wall_right";
  img(key,player.x-7,player.y-5,46,50,player.cling===0&&player.face<0);
  if(player.inv>0){ctx.strokeStyle="#5b2b25";ctx.lineWidth=2.5;
   ctx.beginPath();ctx.moveTo(player.x+5,player.y+15);ctx.lineTo(player.x+12,player.y+18);ctx.moveTo(player.x+21,player.y+18);ctx.lineTo(player.x+28,player.y+15);ctx.stroke();}
 }
 ctx.restore();
 ctx.fillStyle="#172838dc";ctx.fillRect(10,10,190,80);
 text("❤️".repeat(player.hp)+"♡".repeat(3-player.hp),23,39,21,"#ff8b98","left");
 text("🍌 "+(bananaCount%10)+"/10  回復ストック "+healStock,22,67,15,"#ffe56a","left");
 ctx.fillStyle="#172838dc";ctx.fillRect(366,10,184,80);
 text("高度 "+highest+"m",540,39,21,"#fff","right");
 text("最高 "+state.best+"m",540,67,16,"#b6f2ff","right");
 if(state.noticeTime>0)text(state.notice,W/2,130,22,"#ffdf65");
 if(state.screen!=="playing")overlay();
}
function overlay(){
 ctx.fillStyle="#0c1924c9";ctx.fillRect(0,0,W,H);
 if(state.screen==="title"){
  text("さるかに合戦！",W/2,235,34,"#ffe083");
  text("MONKEY CLIMBER",W/2,279,20,"#e4f7ff");
  text("最高到達高度  "+state.best+" m",W/2,348,20);
  button(385,"ノーマルモード",()=>start("normal"));
  button(460,state.unlocked?"ハードモード ×2":"🔒 ハードモード（500mで解放）",()=>start("hard"),!state.unlocked);
  button(535,"サルのスキンを選ぶ",()=>state.screen="skins");
  text("SPACE / タップでジャンプ・壁キック・2段ジャンプ",W/2,660,15);
 }else if(state.screen==="skins"){
  text("サルのスキン",W/2,145,34,"#ffe083");
  text("ノーマル・ハード各200m / 400m / 500mで解放",W/2,181,14);
  skins.forEach((sk,i)=>{
   const y=218+i*65,enabled=i===0||state.skins.has(sk.unlock);
   const selected=state.skin===i;
   ctx.fillStyle=selected?"#f8cf62":enabled?"#45617a":"#303e4d";
   ctx.beginPath();ctx.roundRect(65,y,430,51,10);ctx.fill();
   ctx.save();ctx.font="bold 19px sans-serif";ctx.textAlign="center";
   ctx.fillStyle=selected?"#1d2731":enabled?"#ffffff":"#9eacba";
   ctx.fillText((selected?"✓ ":enabled?"":"🔒 ")+(enabled?sk.name:"？？？"),W/2,y+33);ctx.restore();
   buttons.push({x:65,y,w:430,h:51,disabled:!enabled,fn:()=>{state.skin=i;saveProgress();}});
  });
  button(707,"タイトルに戻る",()=>state.screen="title");
 }else if(state.screen==="paused"){
  text("一時停止",W/2,275,38,"#ffe083");
  button(340,"続ける",()=>state.screen="playing");
  button(420,"0mからやり直す",()=>start(state.mode));
  button(500,"タイトルへ",()=>{saveProgress();state.screen="title";});
 }else if(state.screen==="over"){
  text("GAME OVER",W/2,275,39,"#ff8f83");
  text(state.notice,W/2,322,17);
  text("到達高度 "+highest+" m",W/2,371,25,"#ffe083");
  text("最高記録 "+state.best+" m",W/2,410,19);
  button(465,"もう一度挑戦",()=>start(state.mode));
  button(540,"タイトルへ",()=>{saveProgress();state.screen="title";});
 }
}
let buttons=[];
function button(y,label,fn,disabled=false){
 const x=95,w=370,h=57;
 ctx.fillStyle=disabled?"#465462":"#f8cf62";
 ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fill();
 ctx.strokeStyle=disabled?"#83919e":"#fff0aa";ctx.lineWidth=disabled?1:2;ctx.stroke();
 ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.font=`bold ${disabled?17:23}px "Yu Gothic", "Meiryo", sans-serif`;
 ctx.fillStyle=disabled?"#e1e6ed":"#19222c";
 ctx.fillText(label,W/2,y+h/2+1);ctx.restore();
 buttons.push({x,y,w,h,fn,disabled});
}
function clickAt(e){
 const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*W/rect.width,y=(e.clientY-rect.top)*H/rect.height;
 if(state.screen!=="playing"){const b=buttons.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(b&&!b.disabled){b.fn();return;}}
 if(state.screen==="playing")jump();
}
function pause(){if(state.screen==="playing")state.screen="paused";else if(state.screen==="paused")state.screen="playing";}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.focus();clickAt(e);});
document.querySelector("#jumpBtn").addEventListener("click",jump);
document.querySelector("#pauseBtn").addEventListener("click",pause);
let held=false;
window.addEventListener("keydown",e=>{
 if(["Space","ArrowUp","Escape"].includes(e.code))e.preventDefault();
 if(e.code==="Escape"){if(!e.repeat)pause();return;}
 if(e.code==="Space"||e.code==="ArrowUp"){
  if(!held){held=true;if(state.screen!=="skins")jump();}
 }
});
window.addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="ArrowUp")held=false;});
window.addEventListener("beforeunload",saveProgress);
window.addEventListener("blur",()=>{held=false;if(state.screen==="playing")state.screen="paused";});
let last=0,acc=0;
function loop(t){
 const dt=Math.min(100,t-last||16.67);last=t;acc+=dt;
 let count=0;while(acc>=1000/60&&count++<6){acc-=1000/60;
  if(state.screen==="playing"){state.acc+=state.mode==="hard"?1.8:.9;while(state.acc>=1&&state.screen==="playing"){update();state.acc--;}}
 }
 buttons=[];render();requestAnimationFrame(loop);
}
reset();requestAnimationFrame(loop);
})();