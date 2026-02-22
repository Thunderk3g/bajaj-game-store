import{r as s}from"./index.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),m=(...e)=>e.filter((r,o,t)=>!!r&&r.trim()!==""&&t.indexOf(r)===o).join(" ").trim();/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var d={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s.forwardRef(({color:e="currentColor",size:r=24,strokeWidth:o=2,absoluteStrokeWidth:t,className:n="",children:a,iconNode:p,...c},l)=>s.createElement("svg",{ref:l,...d,width:r,height:r,stroke:e,strokeWidth:t?Number(o)*24/Number(r):o,className:m("lucide",n),...c},[...p.map(([i,u])=>s.createElement(i,u)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(e,r)=>{const o=s.forwardRef(({className:t,...n},a)=>s.createElement(w,{ref:a,iconNode:r,className:m(`lucide-${_(e)}`,t),...n}));return o.displayName=`${e}`,o};/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],h=b("X",f),y=async e=>{const r="https://webpartner.bajajallianz.com/EurekaWSNew/service/pushData",o={name:e.name,age:e.age||25,mobile_no:e.mobile_no,email_id:e.email_id||"",goal_name:e.goal_name||"1",param1:null,param2:null,param3:null,param4:e.param4||null,param5:"",param13:"",param18:"",param19:e.param19||"",param20:"",param23:e.param23||"",param24:e.param24||"",param25:e.param25||"",param26:e.param26||"",param36:"manual",summary_dtls:e.summary_dtls||"Booking Request",p_user_eml:e.email_id||"",p_data_source:e.p_data_source||"RETIREMENT_GAME_LEAD",p_curr_page_path:"https://www.bajajlifeinsurance.com/retirement-planning/",p_ip_addsr:"",p_remark_url:"",prodId:e.prodId||"345",medium:"",contact_number:"",content:"",campaign:"",source:"",keyword:"",flag:"",parameter:"",name1:"",param28:"",param29:"",param30:""};try{const t=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});let n={success:!0};try{const a=await t.json();a&&typeof a=="object"&&(n={success:!0,...a})}catch{}return n}catch(t){return console.error("LMS Submission Error:",t),{success:!0}}};export{h as X,b as c,y as s};
