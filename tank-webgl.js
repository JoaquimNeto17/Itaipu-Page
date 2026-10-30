/*
  Alerta Guarani — reservatório 3D INTERATIVO E REAL.
  Modelagem por triângulos no WebGL2, com iluminação e transparência.
  Sem imagens do tanque, sem Three.js, sem serviço externo ou servidor.
  Não lê Arduino. O nível vem exclusivamente do controle fictício do site.
*/
(()=>{
'use strict';
const canvas=document.getElementById('tankWebGL');if(!canvas)return;
const fallback=document.getElementById('tankFallback');
const css3d=document.getElementById('tankCss3d');
// Geometry-based CSS 3D backup. The browser draws a proper cylinder of 24 faces.
let cssModel=null,cssWater=[],cssSurface=null,cssYaw=25,cssPitch=-7;
function buildCss3d(){
 css3d.innerHTML='';cssModel=document.createElement('div');cssModel.className='tank-css3d-model';css3d.appendChild(cssModel);
 const shell=document.createElement('div');shell.className='css3d-shell';cssModel.appendChild(shell);
 const water=document.createElement('div');water.className='css3d-water';cssModel.appendChild(water);
 for(let i=0;i<24;i++){
  const angle=i*15;const panel=document.createElement('div');panel.className='css3d-panel';panel.style.transform=`rotateY(${angle}deg) translateZ(122px)`;shell.appendChild(panel);
  const w=document.createElement('div');w.className='css3d-panel water';w.style.transform=`rotateY(${angle}deg) translateZ(116px)`;water.appendChild(w);cssWater.push(w);
 }
 for(const name of ['css3d-platform','css3d-rim bottom','css3d-rim','css3d-band','css3d-band red','css3d-band white','css3d-band blue']){const el=document.createElement('div');el.className=name;cssModel.appendChild(el)}
 cssSurface=document.createElement('div');cssSurface.className='css3d-water-surface';cssModel.appendChild(cssSurface);
 for(let i=0;i<10;i++){const el=document.createElement('div');el.className='css3d-rail';el.style.transform=`rotateY(${i*36}deg) translateZ(127px)`;cssModel.appendChild(el)}
 css3d.addEventListener('pointerdown',e=>{css3d.setPointerCapture(e.pointerId);css3d.dataset.drag='1';css3d.dataset.x=e.clientX;css3d.dataset.y=e.clientY});
 css3d.addEventListener('pointermove',e=>{if(css3d.dataset.drag!=='1')return;cssYaw+=(e.clientX-css3d.dataset.x)*.5;cssPitch=Math.max(-20,Math.min(20,cssPitch+(e.clientY-css3d.dataset.y)*.2));css3d.dataset.x=e.clientX;css3d.dataset.y=e.clientY;cssModel.style.transform=`translate3d(0,0,0) scale(${matchMedia('(max-width: 560px)').matches?.77:matchMedia('(max-width: 800px)').matches?.8:1}) rotateX(${cssPitch}deg) rotateY(${cssYaw}deg)`});
 css3d.addEventListener('pointerup',()=>css3d.dataset.drag='0');css3d.addEventListener('pointercancel',()=>css3d.dataset.drag='0');
 }
function updateCssLevel(percent){const h=Math.max(1,350*percent/100);for(const w of cssWater)w.style.height=h+'px';const y=-175+h;cssSurface.style.transform=`rotateX(90deg) translateZ(${y}px)`;}
buildCss3d();updateCssLevel(42);
window.AlertaTank3D={setLevel(n){updateCssLevel(Math.min(100,Math.max(0,Number(n)||0)))}};
const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'high-performance'});
if(!gl){fallback.hidden=true;canvas.style.display='none';return;}
const VS=`#version 300 es
precision highp float;
in vec3 aPos;in vec3 aNorm;in vec4 aColor;in float aKind;
uniform mat4 uMVP;uniform mat4 uModel;uniform float uLevel;uniform float uTime;
out vec3 vNormal;out vec3 vPosition;out vec4 vColor;out float vKind;
void main(){vec3 p=aPos;
if(aKind>3.5&&aKind<4.5){p.y=-1.46+(p.y+1.46)*uLevel;}
if(aKind>4.5&&aKind<5.5){p.y=-1.46+2.90*uLevel+0.025*sin(p.x*8.0+uTime*1.4)*cos(p.z*7.0+uTime*1.6);}
vec4 world=uModel*vec4(p,1.0);vPosition=world.xyz;
vNormal=mat3(uModel)*aNorm;vColor=aColor;vKind=aKind;gl_Position=uMVP*vec4(p,1.0);}`;
const FS=`#version 300 es
precision highp float;
in vec3 vNormal;in vec3 vPosition;in vec4 vColor;in float vKind;
uniform float uTime;out vec4 frag;
void main(){vec3 n=normalize(vNormal);vec3 lightA=normalize(vec3(0.85,1.65,2.3));vec3 lightB=normalize(vec3(-1.8,.65,-1.0));
float diff=max(dot(n,lightA),0.0)*.70+max(dot(n,lightB),0.0)*.28;
float edge=pow(1.0-abs(dot(n,normalize(vec3(0.0,0.5,1.0)))),3.0);
float shine=pow(max(dot(reflect(-lightA,n),normalize(vec3(0.0,1.1,5.0)-vPosition)),0.0),34.0);
vec3 col=vColor.rgb*(.52+diff*.75)+vec3(1.0)*shine*.53;
if(vKind>.5&&vKind<1.5){col+=vec3(.16,.19,.22)*edge;}
if(vKind>1.5&&vKind<2.5){col=mix(vec3(.28,.70,.91),col,.37)+vec3(.30,.52,.62)*edge;}
if(vKind>3.5&&vKind<5.5){float rip=.5+.5*sin(vPosition.x*12.0+uTime*2.4)*cos(vPosition.z*15.0-uTime*1.4);col=mix(vec3(.015,.34,.70),vec3(.08,.81,.97),.42+rip*.28);col+=shine*.7;}
frag=vec4(clamp(col,0.0,1.0),vColor.a);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){console.error('WebGL shader:',e);fallback.hidden=true;canvas.style.display='none';return;}
gl.useProgram(program);css3d.classList.add('hidden');
const P=gl.getAttribLocation(program,'aPos'),N=gl.getAttribLocation(program,'aNorm'),C=gl.getAttribLocation(program,'aColor'),K=gl.getAttribLocation(program,'aKind');
const UMVP=gl.getUniformLocation(program,'uMVP'),UMODEL=gl.getUniformLocation(program,'uModel'),ULEVEL=gl.getUniformLocation(program,'uLevel'),UTIME=gl.getUniformLocation(program,'uTime');
const opaque=[],transparent=[];
function mesh(color,alpha=1,kind=0){return {v:[],color,alpha,kind};}
function col(hex,alpha=1){return [((hex>>16)&255)/255,((hex>>8)&255)/255,(hex&255)/255,alpha];}
function tri(m,a,b,c,na,nb,nc){const add=(p,n)=>{m.v.push(...p,...n,...m.color,m.kind)};add(a,na);add(b,nb);add(c,nc);}
function cylinder(r0,r1,y0,y1,hex,alpha=1,kind=0,seg=72,cap=true){const m=mesh(col(hex,alpha),alpha,kind);for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;const A=[r0*Math.cos(a),y0,r0*Math.sin(a)],B=[r0*Math.cos(b),y0,r0*Math.sin(b)],D=[r1*Math.cos(a),y1,r1*Math.sin(a)],E=[r1*Math.cos(b),y1,r1*Math.sin(b)];const nA=[Math.cos(a),0,Math.sin(a)],nB=[Math.cos(b),0,Math.sin(b)];tri(m,A,B,E,nA,nB,nB);tri(m,A,E,D,nA,nB,nA);if(cap){tri(m,[0,y1,0],D,E,[0,1,0],[0,1,0],[0,1,0]);tri(m,[0,y0,0],B,A,[0,-1,0],[0,-1,0],[0,-1,0]);}}return put(m);}
function torus(R,r,y,hex,alpha=1,kind=1,n1=80,n2=10){const m=mesh(col(hex,alpha),alpha,kind);function p(a,b){return [(R+r*Math.cos(b))*Math.cos(a),y+r*Math.sin(b),(R+r*Math.cos(b))*Math.sin(a)];}function norm(a,b){return [Math.cos(b)*Math.cos(a),Math.sin(b),Math.cos(b)*Math.sin(a)];}for(let i=0;i<n1;i++)for(let j=0;j<n2;j++){const a=i/n1*Math.PI*2,b=j/n2*Math.PI*2,c=(i+1)/n1*Math.PI*2,d=(j+1)/n2*Math.PI*2;tri(m,p(a,b),p(c,b),p(c,d),norm(a,b),norm(c,b),norm(c,d));tri(m,p(a,b),p(c,d),p(a,d),norm(a,b),norm(c,d),norm(a,d));}return put(m);}
function tube(a,b,r,hex,alpha=1,kind=0,seg=10){const m=mesh(col(hex,alpha),alpha,kind);const D=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...D),w=D.map(x=>x/l);const tmp=Math.abs(w[1])>.85?[1,0,0]:[0,1,0];let u=[w[1]*tmp[2]-w[2]*tmp[1],w[2]*tmp[0]-w[0]*tmp[2],w[0]*tmp[1]-w[1]*tmp[0]];const ul=Math.hypot(...u);u=u.map(x=>x/ul);const v=[w[1]*u[2]-w[2]*u[1],w[2]*u[0]-w[0]*u[2],w[0]*u[1]-w[1]*u[0]];const p=(base,ang)=>base.map((x,k)=>x+r*(Math.cos(ang)*u[k]+Math.sin(ang)*v[k]));const norm=ang=>u.map((x,k)=>Math.cos(ang)*x+Math.sin(ang)*v[k]);for(let i=0;i<seg;i++){let ang=i/seg*Math.PI*2,ang2=(i+1)/seg*Math.PI*2;tri(m,p(a,ang),p(a,ang2),p(b,ang2),norm(ang),norm(ang2),norm(ang2));tri(m,p(a,ang),p(b,ang2),p(b,ang),norm(ang),norm(ang2),norm(ang));}return put(m);}
function disc(radius,y,hex,alpha=1,kind=5,nr=16,na=70){const m=mesh(col(hex,alpha),alpha,kind);const p=(r,a)=>[r*Math.cos(a),y,r*Math.sin(a)];for(let i=0;i<nr;i++){const r0=radius*i/nr,r1=radius*(i+1)/nr;for(let j=0;j<na;j++){const a=j/na*Math.PI*2,b=(j+1)/na*Math.PI*2;tri(m,p(r0,a),p(r1,a),p(r1,b),[0,1,0],[0,1,0],[0,1,0]);tri(m,p(r0,a),p(r1,b),p(r0,b),[0,1,0],[0,1,0],[0,1,0]);}}return put(m);}
function put(m){const v=new Float32Array(m.v);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);const entry={buffer,count:v.length/11,kind:m.kind};(m.alpha<1?transparent:opaque).push(entry);return entry;}
// Modelagem industrial fiel ao conceito do reservatório da dashboard.
const steel=0x94aebc,polished=0xd1e0e7,dark=0x15364e,navy=0x12314c;
cylinder(1.42,1.5,-1.78,-1.66,0x566d80);cylinder(1.34,1.38,-1.66,-1.56,0xc0d5df);torus(1.43,.055,-1.57,0xf1f7fa);torus(1.47,.045,-1.77,0x637c91);
// Interior/volume glass wall and water. Water rendered transparent in late pass.
cylinder(1.20,1.20,-1.46,1.40,0x90cbe6,.18,2,92,false);
cylinder(1.14,1.14,-1.46,1.44,0x1599eb,.85,4,80,true);
disc(1.13,1.44,0x1fe7f5,.91,5);
// Rims and defining structural bands.
for(const [r,y,h] of [[1.275,1.40,0xdceaf2],[1.28,1.26,0xc9213a],[1.275,1.15,0xffffff],[1.275,1.04,0x0a4a92],[1.23,-1.48,0xf0f5f6],[1.23,-.8,0xa5c2d0],[1.23,.02,0xb9d4e2],[1.23,.75,0x8aafc5]])torus(r,y===1.4?.085:.038,y,h);
cylinder(1.27,1.29,1.4,1.49,0x526f87);cylinder(1.22,1.22,1.5,1.53,0xcad9df);torus(1.31,.04,1.52,0x99b5c7);cylinder(1.02,1.03,1.53,1.54,0x243647);
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const x=Math.cos(a),z=Math.sin(a);tube([1.26*x,-1.45,1.26*z],[1.26*x,1.35,1.26*z],.023,i%2?steel:polished);tube([1.32*x,1.53,1.32*z],[1.32*x,1.78,1.32*z],.018,steel);}torus(1.32,.025,1.79,0x94acbc);
// Ladder and pipe on right.
for(let z of [.48,-.10])tube([1.43,-1.4,z],[1.43,1.41,z],.026,steel);
for(let y=-1.3;y<1.38;y+=.25)tube([1.45,y,-.10],[1.45,y,.48],.018,polished);
tube([-1.25,-1.17,.18],[-1.75,-1.17,.18],.10,dark);tube([-1.72,-1.17,.18],[-1.72,-1.42,.18],.085,steel);
// Translucent glass surface last (after other geometries).
cylinder(1.205,1.205,-1.47,1.41,0xa8e9ff,.16,2,92,false);
function makePerspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),q=1/(near-far);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*q,-1,0,0,2*far*near*q,0];}
function mul(a,b){const o=Array(16).fill(0);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o;}
function rotY(a){return [Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1]}
function rotX(a){return [1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1]}
function lookAt(e,t,up){const norm=v=>{let l=Math.hypot(...v);return v.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);let z=norm(e.map((x,i)=>x-t[i])),x=norm(cross(up,z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1];}
function bind(entry){gl.bindBuffer(gl.ARRAY_BUFFER,entry.buffer);const s=44;gl.enableVertexAttribArray(P);gl.vertexAttribPointer(P,3,gl.FLOAT,false,s,0);gl.enableVertexAttribArray(N);gl.vertexAttribPointer(N,3,gl.FLOAT,false,s,12);gl.enableVertexAttribArray(C);gl.vertexAttribPointer(C,4,gl.FLOAT,false,s,24);gl.enableVertexAttribArray(K);gl.vertexAttribPointer(K,1,gl.FLOAT,false,s,40);gl.drawArrays(gl.TRIANGLES,0,entry.count);}
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE); // Interior glass and water are double-sided.
let yaw=.36,pitch=-.04,dragging=false,lastX=0,lastY=0,targetLevel=.42,level=.42;
canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.008;pitch=Math.max(-.24,Math.min(.24,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
window.AlertaTank3D={setLevel(n){targetLevel=Math.min(1,Math.max(0,Number(n)/100||0));updateCssLevel(Number(n)||0);}};
let w=0,h=0,last=0;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000||.016,.08);last=now;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const px=Math.min(1.8,window.devicePixelRatio||1);const rw=Math.max(1,Math.round(rect.width*px)),rh=Math.max(1,Math.round(rect.height*px));if(rw!==w||rh!==h){w=rw;h=rh;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!dragging&&!reduce)yaw+=dt*.055;level+=(targetLevel-level)*Math.min(1,dt*2.4);const proj=makePerspective(Math.PI/180*38,w/h,.1,90),view=lookAt([0,1.02,6.65],[0,-.07,0],[0,1,0]),model=mul(rotY(yaw),rotX(pitch)),mvp=mul(proj,mul(view,model));gl.useProgram(program);gl.uniformMatrix4fv(UMVP,false,new Float32Array(mvp));gl.uniformMatrix4fv(UMODEL,false,new Float32Array(model));gl.uniform1f(ULEVEL,level);gl.uniform1f(UTIME,now*.001);gl.depthMask(true);for(const m of opaque)bind(m);gl.depthMask(false);for(const m of transparent){if(level<.006&&(m.kind===4||m.kind===5))continue;bind(m)}gl.depthMask(true);}
requestAnimationFrame(render);
})();
