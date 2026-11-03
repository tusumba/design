// Lightweight offline Figma API smoke test (not installed with plugin).
const fs=require('fs');const vm=require('vm');
let id=0;
class Node{
 constructor(type){this.type=type;this.id='test:'+ ++id;this.name=type;this.children=[];this.x=0;this.y=0;this.width=100;this.height=100;this.layoutMode='NONE';this.parent=null;this.primaryAxisSizingMode='FIXED';this.counterAxisSizingMode='FIXED'}
 appendChild(n){if(n.parent){let a=n.parent.children;a.splice(a.indexOf(n),1)}this.children.push(n);n.parent=this}
 resize(w,h){this.width=w;this.height=h}
 findAll(fn){const out=[];for(const n of this.children){if(fn(n))out.push(n);out.push(...n.findAll(fn))}return out}
 findOne(fn){for(const n of this.children){if(fn(n))return n;const a=n.findOne(fn);if(a)return a}return null}
 createInstance(){const clone=(src)=>{const z=new Node(src.type==='COMPONENT'?'INSTANCE':src.type);z.name=src.name;z.width=src.width;z.height=src.height;z.layoutMode=src.layoutMode;for(const c of src.children)z.appendChild(clone(c));return z};return clone(this)}
}
const page=new Node('PAGE');let notice='';
const api={
 currentPage:page,
 createText:()=>new Node('TEXT'),createFrame:()=>new Node('FRAME'),createComponent:()=>new Node('COMPONENT'),createEllipse:()=>new Node('ELLIPSE'),
 createTextStyle:()=>({}),loadFontAsync:async()=>{},
 variables:{createVariableCollection:(name)=>({name,defaultModeId:'only-mode',renameMode:()=>{},addMode:()=>{throw Error('Starter prohibits addMode')}}),createVariable:(name,collection,type)=>({name,scopes:[],setValueForMode:()=>{}})},
 viewport:{scrollAndZoomIntoView:()=>{}},notify:msg=>{notice=msg},closePlugin:()=>{}
};
const code=fs.readFileSync(__dirname+'/code.js','utf8');
vm.runInNewContext(code,{figma:api,console,setTimeout});
setTimeout(()=>{
 const screenNames=page.children.map(x=>x.name).filter(x=>/^(Desktop|Mobile) \/ /.test(x));
 if(screenNames.length!==12||!notice.startsWith('Готово')) throw Error(JSON.stringify({screenNames,notice}));
 console.log('PASS: generated 12 editable screens, '+page.children.length+' page children; '+screenNames.join(' | '));
},400);
