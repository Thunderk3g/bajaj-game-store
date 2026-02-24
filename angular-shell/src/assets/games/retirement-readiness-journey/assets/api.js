import{r as n}from"./index.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=(...e)=>e.filter((r,t,a)=>!!r&&r.trim()!==""&&a.indexOf(r)===t).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(r,t,a)=>a?a.toUpperCase():t.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=e=>{const r=h(e);return r.charAt(0).toUpperCase()+r.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=e=>{for(const r in e)if(r.startsWith("aria-")||r==="role"||r==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=n.forwardRef(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:s="",children:o,iconNode:l,...m},i)=>n.createElement("svg",{ref:i,...f,width:r,height:r,stroke:e,strokeWidth:a?Number(t)*24/Number(r):t,className:c("lucide",s),...!o&&!w(m)&&{"aria-hidden":"true"},...m},[...l.map(([u,_])=>n.createElement(u,_)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(e,r)=>{const t=n.forwardRef(({className:a,...s},o)=>n.createElement(g,{ref:o,iconNode:r,className:c(`lucide-${d(p(e))}`,`lucide-${e}`,a),...s}));return t.displayName=p(e),t};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],k=b("x",y),E=async e=>{const r="https://webpartner.bajajallianz.com/EurekaWSNew/service/pushData",t={name:e.name,age:e.age||25,mobile_no:e.mobile_no,email_id:e.email_id||"",goal_name:e.goal_name||"1",param1:null,param2:null,param3:null,param4:e.param4||null,param5:"",param13:"",param18:"",param19:e.param19||"",param20:"",param23:e.param23||"",param24:e.param24||"",param25:e.param25||"",param26:e.param26||"",param36:"manual",summary_dtls:e.summary_dtls||"Booking Request",p_user_eml:e.email_id||"",p_data_source:e.p_data_source||"RETIREMENT_GAME_LEAD",p_curr_page_path:"https://www.bajajlifeinsurance.com/retirement-planning/",p_ip_addsr:"",p_remark_url:"",prodId:e.prodId||"345",medium:"",contact_number:"",content:"",campaign:"",source:"",keyword:"",flag:"",parameter:"",name1:"",param28:"",param29:"",param30:""};try{const a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});let s={success:!0};try{const o=await a.json();o&&typeof o=="object"&&(s={success:!0,...o})}catch{}return s}catch(a){return console.error("LMS Submission Error:",a),{success:!0}}};export{k as X,b as c,E as s};
