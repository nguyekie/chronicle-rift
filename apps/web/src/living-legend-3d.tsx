import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import * as THREE from 'three';
import './living-legend-3d.css';

export type LivingLegendSlug='abyss-dragon'|'cosmic-empress'|'star-forge';
type PlayDetail={slug:LivingLegendSlug;label:string};
const artBySlug:Record<LivingLegendSlug,string>={
 'abyss-dragon':'/card-art/living-iv-068-dragon-knight.png',
 'cosmic-empress':'/card-art/living-ar-068-seraphine.png',
 'star-forge':'/card-art/living-ne-068-star-forge-titan.png',
};
const tintBySlug:Record<LivingLegendSlug,THREE.ColorRepresentation>={
 'abyss-dragon':0x55e7ff,'cosmic-empress':0xc786ff,'star-forge':0xff8d32,
};

const emitLivingLegend=(slug:string,label:string)=>{
 if(['abyss-dragon','cosmic-empress','star-forge'].includes(slug))window.dispatchEvent(new CustomEvent<PlayDetail>('chronicle:living-legend',{detail:{slug:slug as LivingLegendSlug,label}}));
};

const vertexShader=`
 uniform float uTime; uniform vec2 uPointer; varying vec2 vUv; varying float vLight;
 void main(){
  vUv=uv; vec3 p=position; float focus=sin(uv.y*3.14159)*sin(uv.x*3.14159);
  p.z+=focus*(uPointer.x*.42)+sin(uv.y*7.0+uTime*1.45)*.035*focus;
  p.x+=(uv.y-.5)*uPointer.x*.18; p.y+=(uv.x-.5)*uPointer.y*.12;
  vLight=.78+focus*.22; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }`;
const fragmentShader=`
 uniform sampler2D uMap; uniform vec3 uTint; uniform float uTime; varying vec2 vUv; varying float vLight;
 void main(){
  vec4 art=texture2D(uMap,vUv); float edge=smoothstep(.0,.08,vUv.x)*smoothstep(.0,.08,vUv.y)*smoothstep(.0,.08,1.-vUv.x)*smoothstep(.0,.08,1.-vUv.y);
  float pulse=.5+.5*sin(uTime*2.4); vec3 color=art.rgb*vLight+uTint*pulse*.055;
  gl_FragColor=vec4(color,art.a*edge);
 }`;

function createParticles(scene:THREE.Scene,slug:LivingLegendSlug){
 const count=slug==='star-forge'?120:90,positions=new Float32Array(count*3);
 for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*7;positions[i*3+1]=(Math.random()-.5)*6;positions[i*3+2]=(Math.random()-.5)*3}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.PointsMaterial({color:tintBySlug[slug],size:slug==='star-forge'?.055:.038,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false});
 const points=new THREE.Points(geometry,material);scene.add(points);return points;
}

async function createPortrait(scene:THREE.Scene,slug:LivingLegendSlug){
 const texture=await new THREE.TextureLoader().loadAsync(artBySlug[slug]);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
 const group=new THREE.Group();scene.add(group);
 const uniforms={uTime:{value:0},uPointer:{value:new THREE.Vector2()},uMap:{value:texture},uTint:{value:new THREE.Color(tintBySlug[slug])}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,depthWrite:true});
 const portrait=new THREE.Mesh(new THREE.PlaneGeometry(4.15,6.22,40,56),material);portrait.position.y=.25;group.add(portrait);
 const echoMaterial=new THREE.MeshBasicMaterial({map:texture,color:tintBySlug[slug],transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false});
 const echo=new THREE.Mesh(new THREE.PlaneGeometry(4.3,6.45),echoMaterial);echo.position.set(0,.25,-.34);echo.scale.set(1.08,1.08,1);group.add(echo);
 const ringMaterial=new THREE.MeshBasicMaterial({color:tintBySlug[slug],transparent:true,opacity:.54,blending:THREE.AdditiveBlending});
 const rings=[0,1,2].map(index=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(2.45+index*.28,.025,8,96),ringMaterial.clone());ring.position.z=-.22-index*.08;ring.rotation.x=Math.PI/2+(index-1)*.12;group.add(ring);return ring});
 group.userData.animate=(time:number,pointer:THREE.Vector2)=>{
  uniforms.uTime.value=time;uniforms.uPointer.value.lerp(pointer,.06);
  const intro=Math.min(1,time/1.15);group.scale.setScalar(.72+intro*.28);
  if(slug==='abyss-dragon'){group.position.z=-3.5+intro*3.5;group.rotation.y=Math.sin(time*1.2)*.07+pointer.x*.1;group.position.x=Math.sin(time*.8)*.06}
  if(slug==='cosmic-empress'){group.position.y=Math.sin(time*1.35)*.1;group.rotation.y=pointer.x*.16;portrait.rotation.z=Math.sin(time*.7)*.012}
  if(slug==='star-forge'){const impact=Math.pow(Math.max(0,Math.sin(time*2.1)),8);group.position.y=-impact*.18;group.rotation.z=-impact*.025;echoMaterial.opacity=.12+impact*.3}
  rings.forEach((ring,index)=>{ring.rotation.z=time*(.18+index*.07)*(index%2?1:-1);ring.scale.setScalar(1+Math.sin(time*1.4+index)*.05)});
 };
 return group;
}

function Scene({slug}:{slug:LivingLegendSlug}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{const container=host.current;if(!container)return;let disposed=false,frame=0,actor:THREE.Group|undefined;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,.3,7.4);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(renderer.domElement);
  const particles=createParticles(scene,slug),pointer=new THREE.Vector2(),clock=new THREE.Clock();
  createPortrait(scene,slug).then(value=>{if(disposed){scene.remove(value);return}actor=value});
  const onPointer=(event:PointerEvent)=>pointer.set((event.clientX/innerWidth-.5)*2,-(event.clientY/innerHeight-.5)*2);
  const resize=()=>{const box=container.getBoundingClientRect();renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix()};
  addEventListener('pointermove',onPointer,{passive:true});resize();
  const loop=()=>{frame=requestAnimationFrame(loop);const time=clock.getElapsedTime();actor?.userData.animate?.(time,pointer);particles.rotation.y=time*.06;particles.position.y=((time*.18)%1.1)-.55;camera.position.x+=(pointer.x*.22-camera.position.x)*.025;camera.position.y+=(.3+pointer.y*.12-camera.position.y)*.025;camera.lookAt(0,.25,0);renderer.render(scene,camera)};loop();
  return()=>{disposed=true;cancelAnimationFrame(frame);removeEventListener('pointermove',onPointer);renderer.dispose();scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Points){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(item=>item.dispose())}});renderer.domElement.remove()}
 },[slug]);return <div ref={host} className="living-webgl-canvas"/>;
}

export function LivingLegendStage(){const[current,setCurrent]=useState<(PlayDetail&{key:number})|null>(null);useEffect(()=>{let timer=0;const play=(event:Event)=>{const detail=(event as CustomEvent<PlayDetail>).detail;setCurrent({...detail,key:Date.now()});clearTimeout(timer);timer=window.setTimeout(()=>setCurrent(null),4200)};window.addEventListener('chronicle:living-legend',play);return()=>{window.removeEventListener('chronicle:living-legend',play);clearTimeout(timer)}},[]);if(!current)return null;return <aside key={current.key} className={`living-webgl-stage living-webgl-${current.slug}`}><Scene slug={current.slug}/><div className="living-webgl-title"><small>HUYỀN THOẠI SỐNG THỨC TỈNH</small><strong>{current.label}</strong><span>Di chuyển con trỏ để khám phá chiều sâu nhân vật</span></div></aside>}

const stageId='chronicle-living-legend-root';let mounted=false;
export function showLivingLegend(slug:string,label:string){if(typeof document==='undefined')return;if(!mounted){const host=document.createElement('div');host.id=stageId;document.body.appendChild(host);createRoot(host).render(<LivingLegendStage/>);mounted=true;requestAnimationFrame(()=>emitLivingLegend(slug,label));return}emitLivingLegend(slug,label)}
