import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import * as THREE from 'three';
import './living-legend-3d.css';

export type LivingLegendSlug='abyss-dragon'|'cosmic-empress'|'star-forge';
type PlayDetail={slug:LivingLegendSlug;label:string};
const emitLivingLegend=(slug:string,label:string)=>{
 if(['abyss-dragon','cosmic-empress','star-forge'].includes(slug))window.dispatchEvent(new CustomEvent<PlayDetail>('chronicle:living-legend',{detail:{slug:slug as LivingLegendSlug,label}}));
};

const material=(color:number,emissive=0)=>new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:emissive?1.15:0,metalness:.72,roughness:.3});
const mesh=(geometry:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,position:[number,number,number],rotation:[number,number,number]=[0,0,0])=>{const value=new THREE.Mesh(geometry,mat);value.position.set(...position);value.rotation.set(...rotation);parent.add(value);return value};

function knightDragon(scene:THREE.Scene){
 const root=new THREE.Group(),black=material(0x111827),cyan=material(0x51e8ff,0x165b78),steel=material(0x5c6980);scene.add(root);
 const dragon=new THREE.Group();dragon.position.y=-.65;root.add(dragon);
 mesh(new THREE.SphereGeometry(1.2,20,12),black,dragon,[0,0,0]).scale.set(1.7,.62,.72);
 const neck=new THREE.Group();neck.position.set(.82,.25,0);dragon.add(neck);mesh(new THREE.CylinderGeometry(.28,.48,1.45,12),black,neck,[0,.55,0],[0,0,-.85]);
 mesh(new THREE.ConeGeometry(.48,1.15,12),black,neck,[.75,1.05,0],[0,0,-Math.PI/2]);
 const wings=[-1,1].map(side=>{const wing=new THREE.Group();wing.position.set(-.2,.25,side*.55);dragon.add(wing);const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(-1.8,side*.15);shape.lineTo(-.4,side*1.9);shape.closePath();const g=new THREE.ShapeGeometry(shape);mesh(g,new THREE.MeshStandardMaterial({color:0x16243c,side:THREE.DoubleSide,transparent:true,opacity:.88}),wing,[0,0,0],[Math.PI/2,0,0]);return wing});
 const rider=new THREE.Group();rider.position.set(0,.65,0);root.add(rider);mesh(new THREE.CylinderGeometry(.34,.48,1.1,12),steel,rider,[0,.5,0]);mesh(new THREE.SphereGeometry(.36,16,10),black,rider,[0,1.25,0]);
 const swordArm=new THREE.Group();swordArm.position.set(.38,.9,0);rider.add(swordArm);mesh(new THREE.CylinderGeometry(.1,.13,.9,10),steel,swordArm,[.25,.3,0],[0,0,-.7]);mesh(new THREE.BoxGeometry(.08,1.65,.08),cyan,swordArm,[.68,.65,0],[0,0,-.7]);
 root.userData.animate=(t:number)=>{root.position.z=THREE.MathUtils.lerp(-5,0,Math.min(1,t*1.7));root.rotation.y=Math.sin(t*1.8)*.08;wings.forEach((w,i)=>w.rotation.x=Math.sin(t*7+i*Math.PI)*.38);neck.rotation.z=Math.sin(t*2)*.1;swordArm.rotation.z=-.8+Math.sin(t*3)*.65};return root;
}
function empress(scene:THREE.Scene){
 const root=new THREE.Group(),violet=material(0x6327a8,0x28105a),gold=material(0xf5d17a,0x5c3a08),skin=material(0xd8b7a8);scene.add(root);
 mesh(new THREE.ConeGeometry(.85,2.25,24),violet,root,[0,-.55,0]);mesh(new THREE.CylinderGeometry(.34,.5,1.25,16),violet,root,[0,.72,0]);mesh(new THREE.SphereGeometry(.34,20,14),skin,root,[0,1.55,0]);
 const arms=[-1,1].map(side=>{const arm=new THREE.Group();arm.position.set(side*.38,1.05,0);root.add(arm);mesh(new THREE.CylinderGeometry(.1,.14,1.2,12),gold,arm,[side*.45,-.05,0],[0,0,side*-.8]);return arm});
 const orbit=new THREE.Group();orbit.position.y=1.05;root.add(orbit);for(let i=0;i<8;i++){const angle=i/8*Math.PI*2;mesh(new THREE.SphereGeometry(i%3===0?.16:.07,12,8),i%3===0?gold:material(0x7fe9ff,0x176f8f),orbit,[Math.cos(angle)*1.5,Math.sin(angle*.8)*.7,Math.sin(angle)*.5])}
 const halo=mesh(new THREE.TorusGeometry(.72,.035,10,48),gold,root,[0,1.55,-.08],[Math.PI/2,0,0]);root.userData.animate=(t:number)=>{root.position.y=Math.sin(t*2)*.08;root.rotation.y=Math.sin(t*.8)*.3;orbit.rotation.y=t*1.25;orbit.rotation.z=t*.18;halo.rotation.z=t*.65;arms[0]!.rotation.z=Math.sin(t*2)*.18;arms[1]!.rotation.z=-Math.sin(t*2)*.18};return root;
}
function starForge(scene:THREE.Scene){
 const root=new THREE.Group(),rock=material(0x292522),lava=material(0xff7b19,0xff3d00),iron=material(0x4f443b);scene.add(root);
 mesh(new THREE.CylinderGeometry(.72,1.05,2.4,10),rock,root,[0,.1,0]);mesh(new THREE.SphereGeometry(.68,14,10),rock,root,[0,1.52,0]);const core=mesh(new THREE.SphereGeometry(.42,24,16),lava,root,[0,.35,.72]);
 const hammerArm=new THREE.Group();hammerArm.position.set(.7,1,0);root.add(hammerArm);mesh(new THREE.CylinderGeometry(.18,.24,1.6,10),rock,hammerArm,[.45,-.35,0],[0,0,-.65]);mesh(new THREE.CylinderGeometry(.09,.09,2,10),iron,hammerArm,[.95,-.75,0],[0,0,-.65]);mesh(new THREE.BoxGeometry(.8,.38,.38),iron,hammerArm,[1.45,-1.15,0],[0,0,-.65]);
 const sparks=new THREE.Group();root.add(sparks);for(let i=0;i<28;i++)mesh(new THREE.SphereGeometry(.025+(i%3)*.01,6,4),lava,sparks,[(i%7-3)*.25,-.8+(i%9)*.25,(i%5-2)*.2]);
 root.userData.animate=(t:number)=>{root.rotation.y=Math.sin(t*.7)*.18;hammerArm.rotation.z=-.4-Math.abs(Math.sin(t*2.2))*1.25;const pulse=1+Math.sin(t*6)*.16;core.scale.setScalar(pulse);sparks.children.forEach((s,i)=>{s.position.y=-.7+((t*(.7+i%4*.14)+i*.13)%2.9);s.position.x+=(Math.sin(t*3+i)*.002)})};return root;
}

function Scene({slug}:{slug:LivingLegendSlug}){const host=useRef<HTMLDivElement>(null);useEffect(()=>{const container=host.current;if(!container)return;const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,.7,7);const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(renderer.domElement);scene.add(new THREE.HemisphereLight(0xa9dfff,0x10091c,2.2));const key=new THREE.DirectionalLight(slug==='star-forge'?0xff9a46:0x8eeeff,4);key.position.set(4,5,6);scene.add(key);const actor=slug==='abyss-dragon'?knightDragon(scene):slug==='cosmic-empress'?empress(scene):starForge(scene);const clock=new THREE.Clock();let frame=0,px=0,py=0;const pointer=(e:PointerEvent)=>{px=(e.clientX/innerWidth-.5)*.5;py=(e.clientY/innerHeight-.5)*.3};addEventListener('pointermove',pointer,{passive:true});const resize=()=>{const box=container.getBoundingClientRect();renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix()};resize();const loop=()=>{frame=requestAnimationFrame(loop);const t=clock.getElapsedTime();actor.userData.animate?.(t);camera.position.x+=(px-camera.position.x)*.035;camera.position.y+=(1-py-camera.position.y)*.035;camera.lookAt(0,.45,0);renderer.render(scene,camera)};loop();return()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',pointer);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});renderer.domElement.remove()}},[slug]);return <div ref={host} className="living-webgl-canvas"/>}

export function LivingLegendStage(){const[current,setCurrent]=useState<(PlayDetail&{key:number})|null>(null);useEffect(()=>{let timer=0;const play=(event:Event)=>{const detail=(event as CustomEvent<PlayDetail>).detail;setCurrent({...detail,key:Date.now()});clearTimeout(timer);timer=window.setTimeout(()=>setCurrent(null),3900)};window.addEventListener('chronicle:living-legend',play);return()=>{window.removeEventListener('chronicle:living-legend',play);clearTimeout(timer)}},[]);if(!current)return null;return <aside key={current.key} className={`living-webgl-stage living-webgl-${current.slug}`}><Scene slug={current.slug}/><div className="living-webgl-title"><small>THỰC THỂ 3D ĐÃ GIÁNG LÂM</small><strong>{current.label}</strong><span>Di chuyển con trỏ để thay đổi góc nhìn</span></div></aside>}

const stageId='chronicle-living-legend-root';let mounted=false;
export function showLivingLegend(slug:string,label:string){
 if(typeof document==='undefined')return;
 if(!mounted){const host=document.createElement('div');host.id=stageId;document.body.appendChild(host);createRoot(host).render(<LivingLegendStage/>);mounted=true;requestAnimationFrame(()=>emitLivingLegend(slug,label));return}
 emitLivingLegend(slug,label);
}
