/* Offline smoke test. Not installed by Figma. */
const fs=require('fs'),vm=require('vm');let id=0,notice='';
class Node{
 constructor(type){this.type=type;this.id='test:'+ ++id;this.name=type;this.children=[];this.x=0;this.y=0;this.width=100;this.height=100;this.parent=null;}
 appendChild(n){if(n.parent){const ix=n.parent.children.indexOf(n);if(ix>=0)n.parent.children.splice(ix,1)}this.children.push(n);n.parent=this}
 resize(w,h){this.width=w;this.height=h}
}
const page=new Node('PAGE');const api={
 currentPage:page,createFrame:()=>new Node('FRAME'),createText:()=>new Node('TEXT'),createEllipse:()=>new Node('ELLIPSE'),createTextStyle:()=>({}),
 loadFontAsync:async()=>{},
 variables:{createVariableCollection:(name)=>({defaultModeId:'single',renameMode:()=>{},addMode:()=>{throw Error('Starter allows one mode only')}}),createVariable:(name,c,t)=>({name,scopes:[],setValueForMode:()=>{}})},
 viewport:{scrollAndZoomIntoView:()=>{}},notify:msg=>{notice=msg},closePlugin:()=>{}
};
vm.runInNewContext(fs.readFileSync(__dirname+'/code.js','utf8'),{figma:api,console});
setTimeout(()=>{
 const main=page.children.filter(n=>/^(Desktop|Mobile) \/ /.test(n.name));const state=page.children.filter(n=>/^STATE \/ /.test(n.name));
 if(main.length!==12||state.length!==18||!notice.startsWith('Готово'))throw Error(JSON.stringify({main:main.length,state:state.length,notice}));
 const total=page.children.reduce((sum,p)=>sum+desc(p),0);
 function desc(n){return 1+n.children.reduce((a,b)=>a+desc(b),0)}
 console.log('PASS '+main.length+' main screens + '+state.length+' states, '+total+' editable nodes');
},400);
