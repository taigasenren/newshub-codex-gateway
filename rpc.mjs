import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {EventEmitter} from 'node:events';
export class AppServer extends EventEmitter{
 constructor(command,args,options={}){super();this.seq=0;this.pending=new Map();this.proc=spawn(command,args,{stdio:['pipe','pipe','pipe'],...options});this.proc.stderr.on('data',()=>{});this.lines=createInterface({input:this.proc.stdout});this.lines.on('line',line=>{let m;try{m=JSON.parse(line)}catch{return}if(m.id!==undefined&&!m.method){const p=this.pending.get(m.id);if(p){clearTimeout(p.timer);this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)}}else if(m.id!==undefined&&m.method){this.send({id:m.id,error:{code:-32601,message:'Tools and approval requests are disabled in the NewsHub writing gateway.'}})}else if(m.method)this.emit('notification',m)});const fail=(error)=>{this.dead=true;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error)}this.pending.clear();this.emit('closed')};this.proc.on('error',fail);this.proc.on('exit',()=>fail(new Error('Codex App Server stopped.')))}
 send(message){if(this.dead)throw new Error('Codex App Server stopped.');this.proc.stdin.write(JSON.stringify(message)+'\n')}
 call(method,params={},timeout=30000){return new Promise((resolve,reject)=>{const id=++this.seq;const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Codexの応答がタイムアウトしました。'))},timeout);this.pending.set(id,{resolve,reject,timer});try{this.send({id,method,params})}catch(e){clearTimeout(timer);this.pending.delete(id);reject(e)}})}
 async initialize(){await this.call('initialize',{clientInfo:{name:'newshub_gateway',title:'NewsHub',version:'1.0.0'}});this.send({method:'initialized',params:{}})}
 close(){this.proc.kill('SIGTERM')}
}
