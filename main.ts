// Tiny stack VM for make.fun tiny-stack-vm-01-run-20261122.
// One program, 40 instances: reads /input/<id>/{program,input}.bin and writes
// /output/<id>/{stdout.bin,exit.txt}. Exact ISA semantics (ISA.md / vm.mjs):
// 32-bit wrapping arithmetic, 256-value stack, 64-deep call stack, 256 words
// of memory, 1,000,000 steps, 65,536 output bytes, traps 2..11 as exit codes.
import{readdirSync as R,readFileSync as F,mkdirSync as K,writeFileSync as W}from"node:fs";
const I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output";
function run(p,g){
 let S=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536),n=0,pc=0,sp=0,cp=0,ip=0,st=0,a,b,s;
 const T=c=>[c,o.subarray(0,n)];
 for(;;){
  if(st===1e6)return T(10);
  if(pc<0||pc>=p.length)return T(9);
  let q=p[pc],L=q===1?1:q===2?4:q>47&&q<52?2:0;
  if(L&&pc+L>=p.length)return T(9);
  st++;let x=pc+1+L;pc=x;
  switch(q){
   case 0:return T(0);
   case 1:if(sp>255)return T(3);S[sp++]=(p[x-1]<<24)>>24;break;
   case 2:if(sp>255)return T(3);S[sp++]=p[x-4]|p[x-3]<<8|p[x-2]<<16|p[x-1]<<24;break;
   case 3:if(!sp)return T(2);sp--;break;
   case 4:if(!sp)return T(2);if(sp>255)return T(3);S[sp]=S[sp-1];sp++;break;
   case 5:if(sp<2)return T(2);a=S[sp-1];S[sp-1]=S[sp-2];S[sp-2]=a;break;
   case 6:if(sp<2)return T(2);if(sp>255)return T(3);S[sp]=S[sp-2];sp++;break;
   case 7:if(sp<3)return T(2);a=S[sp-3];S[sp-3]=S[sp-2];S[sp-2]=S[sp-1];S[sp-1]=a;break;
   case 0x10:case 0x11:case 0x12:case 0x13:case 0x14:case 0x15:case 0x16:case 0x18:case 0x19:case 0x1a:case 0x1c:case 0x1d:case 0x1e:case 0x20:case 0x21:case 0x22:
    if(sp<2)return T(2);b=S[--sp];a=S[sp-1];
    if(q===0x10)a+=b;else if(q===0x11)a-=b;else if(q===0x12)a=Math.imul(a,b);
    else if(q===0x13){if(!b)return T(4);a=a/b|0;}
    else if(q===0x14){if(!b)return T(4);a=a%b|0;}
    else if(q===0x15){if(!b)return T(4);a=Math.floor((a>>>0)/(b>>>0))|0;}
    else if(q===0x16){if(!b)return T(4);a=(a>>>0)%(b>>>0)|0;}
    else if(q===0x18)a&=b;else if(q===0x19)a|=b;else if(q===0x1a)a^=b;
    else if(q===0x1c)a<<=b;else if(q===0x1d)a>>=b;else if(q===0x1e)a=a>>>b|0;
    else if(q===0x20)a=a===b?1:0;else if(q===0x21)a=a<b?1:0;else a=(a>>>0)<(b>>>0)?1:0;
    S[sp-1]=a|0;break;
   case 0x17:if(!sp)return T(2);S[sp-1]=-S[sp-1]|0;break;
   case 0x1b:if(!sp)return T(2);S[sp-1]=~S[sp-1];break;
   case 0x30:pc+=((p[x-2]|p[x-1]<<8)<<16)>>16;break;
   case 0x31:if(!sp)return T(2);a=((p[x-2]|p[x-1]<<8)<<16)>>16;if(!S[--sp])pc+=a;break;
   case 0x32:if(!sp)return T(2);a=((p[x-2]|p[x-1]<<8)<<16)>>16;if(S[--sp])pc+=a;break;
   case 0x33:if(cp>63)return T(7);C[cp++]=pc;pc=p[x-2]|p[x-1]<<8;break;
   case 0x34:if(!cp)return T(8);pc=C[--cp];break;
   case 0x40:if(!sp)return T(2);a=S[sp-1];if(a<0||a>255)return T(6);S[sp-1]=M[a];break;
   case 0x41:if(sp<2)return T(2);a=S[sp-1];if(a<0||a>255)return T(6);M[a]=S[sp-2];sp-=2;break;
   case 0x50:if(!sp)return T(2);s=String(S[sp-1]);if(n+s.length>65536)return T(11);sp--;for(let i=0;i<s.length;i++)o[n++]=s.charCodeAt(i);break;
   case 0x51:if(!sp)return T(2);if(n>65535)return T(11);o[n++]=S[--sp]&255;break;
   case 0x52:if(sp>255)return T(3);S[sp++]=ip<g.length?g[ip++]:-1;break;
   case 0x53:if(!sp)return T(2);return T(S[--sp]&255);
   default:return T(5);
  }
 }
}
for(const id of R(I).sort()){
 const[c,y]=run(F(I+"/"+id+"/program.bin"),F(I+"/"+id+"/input.bin"));
 K(O+"/"+id,{recursive:true});W(O+"/"+id+"/stdout.bin",y);W(O+"/"+id+"/exit.txt",c+"\n");
}
