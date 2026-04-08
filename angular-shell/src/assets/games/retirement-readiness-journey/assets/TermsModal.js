import{r as i,j as s,A as g,m}from"./index.js";const k=async t=>{const e="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",r=sessionStorage.getItem("gamification_userId")||"",o=sessionStorage.getItem("gamification_gameId")||"",n={cust_name:t.name||t.fullName||"",mobile_no:t.mobile_no||t.contact_number||"",dob:"",gender:"M",pincode:"",email_id:t.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:r,gameID:o,remarks:`Game: ${o}${t.score!=null?` | Score: ${t.score}`:""} | ${t.summary_dtls||"Retirement Readiness Lead"}`,appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",n);try{const a=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),c=await a.json().catch(()=>({}));return{success:a.ok,...c}}catch(a){return console.error("LMS Submission Error:",a),{success:!1,error:a.message}}},I=async(t,e)=>{const r="https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew",o={leadNo:t,tpa_user_id:"",miscObj1:{stringval1:"",stringval2:e.name||e.firstName||"",stringval3:e.lastName||"",stringval4:e.date||"",stringval5:e.time||"",stringval6:e.remarks||"Slot Booking via Game",stringval7:"GAMIFICATION",stringval9:e.mobile||""}};try{const n=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),a=await n.json().catch(()=>({}));return{success:n.ok,...a}}catch(n){return console.error("updateLeadNew Submission Error:",n),{success:!1,error:n.message}}};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=(...t)=>t.filter((e,r,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===r).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,o)=>o?o.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=t=>{const e=x(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=i.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:a,iconNode:c,...l},p)=>i.createElement("svg",{ref:p,...y,width:e,height:e,stroke:t,strokeWidth:o?Number(r)*24/Number(e):r,className:u("lucide",n),...!a&&!w(l)&&{"aria-hidden":"true"},...l},[...c.map(([h,b])=>i.createElement(h,b)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(t,e)=>{const r=i.forwardRef(({className:o,...n},a)=>i.createElement(j,{ref:a,iconNode:e,className:u(`lucide-${f(d(t))}`,`lucide-${t}`,o),...n}));return r.displayName=d(t),r};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],N=_("x",v),A=({isOpen:t,onClose:e})=>s.jsx(g,{children:t&&s.jsxs("div",{className:"fixed inset-0 z-[5000] flex items-center justify-center p-4",children:[s.jsx(m.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:e,className:"fixed inset-0 bg-slate-900/60 backdrop-blur-sm"}),s.jsxs(m.div,{initial:{scale:.9,opacity:0,y:20},animate:{scale:1,opacity:1,y:0},exit:{scale:.9,opacity:0,y:20},className:"bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 w-full max-w-[380px] shadow-2xl relative border border-white/20 z-[5001] overflow-hidden text-left",children:[s.jsx("button",{onClick:e,className:"absolute top-6 right-6 text-white/50 hover:text-white transition-colors",children:s.jsx(N,{className:"h-6 w-6"})}),s.jsx("div",{className:"mb-6",children:s.jsxs("h2",{className:"text-white text-2xl font-black tracking-tight uppercase italic leading-tight",children:["Terms & ",s.jsx("span",{className:"text-yellow-400",children:"Conditions"})]})}),s.jsxs("div",{className:"space-y-4 text-blue-50/80 text-[10px] font-medium leading-relaxed max-h-[350px] overflow-y-auto pr-2 custom-scrollbar",children:[s.jsx("p",{children:"I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back."}),s.jsx("p",{children:"I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business."}),s.jsxs("p",{children:["Please refer to Bajaj Life ",s.jsx("a",{href:"https://www.bajajallianzlife.com/privacy-policy.html",target:"_blank",rel:"noopener noreferrer",className:"text-yellow-400 underline font-bold",children:"Privacy Policy"}),"."]})]}),s.jsx("div",{className:"mt-8",children:s.jsx("button",{onClick:e,className:"w-full h-14 bg-white hover:bg-white/90 text-blue-600 font-black text-lg tracking-widest transition-all duration-300 shadow-lg rounded-2xl border-none uppercase",children:"I Agree"})})]})]})});export{A as T,N as X,_ as c,k as s,I as u};
