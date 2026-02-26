import{r as c}from"./index.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=(...e)=>e.filter((t,o,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===o).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,o,r)=>r?r.toUpperCase():o.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=e=>{const t=h(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var g={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:o=2,absoluteStrokeWidth:r,className:n="",children:s,iconNode:a,...i},p)=>c.createElement("svg",{ref:p,...g,width:t,height:t,stroke:e,strokeWidth:r?Number(o)*24/Number(t):o,className:u("lucide",n),...!s&&!f(i)&&{"aria-hidden":"true"},...i},[...a.map(([l,d])=>c.createElement(l,d)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=(e,t)=>{const o=c.forwardRef(({className:r,...n},s)=>c.createElement(w,{ref:s,iconNode:t,className:u(`lucide-${_(m(e))}`,`lucide-${e}`,r),...n}));return o.displayName=m(e),o};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],C=I("x",b),y=async e=>{const t="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",o=new URLSearchParams(window.location.search),r=o.get("userId")||"",n=o.get("gameId")||"",s={cust_name:e.name||e.fullName||"",mobile_no:e.mobile_no||e.contact_number||"",dob:"",gender:"M",pincode:"",email_id:e.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:r,gameID:n,remarks:e.summary_dtls||"Retirement Readiness Lead",appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",s);try{const a=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),i=await a.json().catch(()=>({}));return{success:a.ok,...i}}catch(a){return console.error("LMS Submission Error:",a),{success:!1,error:a.message}}};export{C as X,I as c,y as s};
