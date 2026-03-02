import{r as i}from"./index.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(...t)=>t.filter((e,o,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,o,r)=>r?r.toUpperCase():o.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=t=>{const e=h(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var _={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=i.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:o=2,absoluteStrokeWidth:r,className:n="",children:s,iconNode:a,...c},u)=>i.createElement("svg",{ref:u,..._,width:e,height:e,stroke:t,strokeWidth:r?Number(o)*24/Number(e):o,className:m("lucide",n),...!s&&!f(c)&&{"aria-hidden":"true"},...c},[...a.map(([p,d])=>i.createElement(p,d)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=(t,e)=>{const o=i.forwardRef(({className:r,...n},s)=>i.createElement(b,{ref:s,iconNode:e,className:m(`lucide-${g(l(t))}`,`lucide-${t}`,r),...n}));return o.displayName=l(t),o};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],A=w("x",y),C=async t=>{const e="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",o=new URLSearchParams(window.location.search),r=o.get("userId")||"",n=o.get("gameId")||"",s={cust_name:t.name||t.fullName||"",mobile_no:t.mobile_no||t.contact_number||"",dob:"",gender:"M",pincode:"",email_id:t.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:r,gameID:n,remarks:`Game: ${n}${t.score!=null?` | Score: ${t.score}`:""} | ${t.summary_dtls||"Retirement Readiness Lead"}`,appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",s);try{const a=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),c=await a.json().catch(()=>({}));return{success:a.ok,...c}}catch(a){return console.error("LMS Submission Error:",a),{success:!1,error:a.message}}},L=async(t,e)=>{const o="https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew";let r="";if(e.date){const[s,a,c]=e.date.split("-");c&&a&&s?r=`${c}/${a}/${s}`:r=e.date}const n={leadNo:t,tpa_user_id:"",miscObj1:{stringval1:"",stringval2:e.firstName||e.name||"",stringval3:e.lastName||"",stringval4:r,stringval5:e.time||"",stringval6:e.remarks||"Slot Booking via Game",stringval7:"GAMIFICATION",stringval9:e.mobile||""}};try{const s=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),a=await s.json().catch(()=>({}));return{success:s.ok,...a}}catch(s){return console.error("updateLeadNew Submission Error:",s),{success:!1,error:s.message}}};export{A as X,w as c,C as s,L as u};
