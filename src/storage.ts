import {isProject,makeProject,type Project} from './audio';
export const STORAGE_KEY='pocketchip-v02-project';
const BACKUP_KEY='pocketchip-v03-backup';
const MAX_FILE_BYTES=256*1024;
export type SavedFile={format:'pocketchip-project';formatVersion:1;name:string;exportedAt:string;project:Project};
export function readProject():Project {
 for(const key of [STORAGE_KEY,BACKUP_KEY]){
  try{const raw=localStorage.getItem(key);if(raw){const value:unknown=JSON.parse(raw);if(isProject(value))return value;}}catch{}
 }
 return makeProject();
}
export function persistProject(project:Project):void{
 if(!isProject(project))throw new Error('Project data is invalid.');
 const previous=localStorage.getItem(STORAGE_KEY);
 if(previous){try{const old:unknown=JSON.parse(previous);if(isProject(old))localStorage.setItem(BACKUP_KEY,previous);}catch{}}
 localStorage.setItem(STORAGE_KEY,JSON.stringify(project));
}
export function makeExport(project:Project,name:string):string{
 if(!isProject(project))throw new Error('Cannot export an invalid project.');
 const file:SavedFile={format:'pocketchip-project',formatVersion:1,name:name.trim().slice(0,60)||'My Loop',exportedAt:new Date().toISOString(),project};
 return JSON.stringify(file,null,2);
}
export function parseImport(raw:string):{name:string;project:Project}{
 if(new Blob([raw]).size>MAX_FILE_BYTES)throw new Error('File is too large (maximum 256 KB).');
 let data:unknown;
 try{data=JSON.parse(raw);}catch{throw new Error('This is not valid JSON.');}
 if(!data||typeof data!=='object')throw new Error('Not a PocketChip project file.');
 const file=data as Partial<SavedFile>;
 if(file.format!=='pocketchip-project'||file.formatVersion!==1||typeof file.name!=='string'||!isProject(file.project))throw new Error('Invalid or unsupported PocketChip project file.');
 return {name:file.name.slice(0,60),project:structuredClone(file.project)};
}
export function downloadProject(project:Project,name:string):void{
 const blob=new Blob([makeExport(project,name)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='pocketchip-'+(name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'loop')+'.json';
 document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
