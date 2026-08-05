export async function playLivingLegend(slug:string,label:string){
 if(!['abyss-dragon','cosmic-empress','star-forge'].includes(slug))return;
 const module=await import('./living-legend-3d');
 module.showLivingLegend(slug,label);
}
