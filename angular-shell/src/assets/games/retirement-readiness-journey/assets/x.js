import{r as n}from"./index.js";const A=async t=>{const e="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",o=sessionStorage.getItem("gamification_userId")||"",r=sessionStorage.getItem("gamification_gameId")||"",a={cust_name:t.name||t.fullName||"",mobile_no:t.mobile_no||t.contact_number||"",dob:"",gender:"M",pincode:"",email_id:t.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:o,gameID:r,remarks:`Game: ${r}${t.score!=null?` | Score: ${t.score}`:""} | ${t.summary_dtls||"Retirement Readiness Lead"}`,appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",a);try{const s=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await s.json().catch(()=>({}));return{success:s.ok,...i}}catch(s){return console.error("LMS Submission Error:",s),{success:!1,error:s.message}}},C=async(t,e)=>{const o="https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew",r={leadNo:t,tpa_user_id:"",miscObj1:{stringval1:"",stringval2:e.name||e.firstName||"",stringval3:e.lastName||"",stringval4:e.date||"",stringval5:e.time||"",stringval6:e.remarks||"Slot Booking via Game",stringval7:"GAMIFICATION",stringval9:e.mobile||""}};try{const a=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),s=await a.json().catch(()=>({}));return{success:a.ok,...s}}catch(a){return console.error("updateLeadNew Submission Error:",a),{success:!1,error:a.message}}};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=(...t)=>t.filter((e,o,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,o,r)=>r?r.toUpperCase():o.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=t=>{const e=_(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var h={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:o=2,absoluteStrokeWidth:r,className:a="",children:s,iconNode:i,...c},u)=>n.createElement("svg",{ref:u,...h,width:e,height:e,stroke:t,strokeWidth:r?Number(o)*24/Number(e):o,className:l("lucide",a),...!s&&!f(c)&&{"aria-hidden":"true"},...c},[...i.map(([p,d])=>n.createElement(p,d)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=(t,e)=>{const o=n.forwardRef(({className:r,...a},s)=>n.createElement(b,{ref:s,iconNode:e,className:l(`lucide-${g(m(t))}`,`lucide-${t}`,r),...a}));return o.displayName=m(t),o};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],j=I("x",w);export{j as X,I as c,A as s,C as u};
