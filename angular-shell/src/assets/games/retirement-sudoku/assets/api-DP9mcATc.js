import{r as i,j as R}from"./index-BrK_Zc7e.js";import{M as G,i as P,u as T,P as W,a as D,b as z,L as F}from"./proxy-58Slcjto.js";function E(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function H(...e){return t=>{let s=!1;const o=e.map(a=>{const n=E(a,t);return!s&&typeof n=="function"&&(s=!0),n});if(s)return()=>{for(let a=0;a<o.length;a++){const n=o[a];typeof n=="function"?n():E(e[a],null)}}}}function K(...e){return i.useCallback(H(...e),e)}class J extends i.Component{getSnapshotBeforeUpdate(t){const s=this.props.childRef.current;if(s&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const o=s.offsetParent,a=P(o)&&o.offsetWidth||0,n=P(o)&&o.offsetHeight||0,r=this.props.sizeRef.current;r.height=s.offsetHeight||0,r.width=s.offsetWidth||0,r.top=s.offsetTop,r.left=s.offsetLeft,r.right=a-r.width-r.left,r.bottom=n-r.height-r.top}return null}componentDidUpdate(){}render(){return this.props.children}}function X({children:e,isPresent:t,anchorX:s,anchorY:o,root:a,pop:n}){var f;const r=i.useId(),u=i.useRef(null),C=i.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:y}=i.useContext(G),l=((f=e.props)==null?void 0:f.ref)??(e==null?void 0:e.ref),b=K(u,l);return i.useInsertionEffect(()=>{const{width:p,height:d,top:_,left:w,right:j,bottom:L}=C.current;if(t||n===!1||!u.current||!p||!d)return;const A=s==="left"?`left: ${w}`:`right: ${j}`,h=o==="bottom"?`bottom: ${L}`:`top: ${_}`;u.current.dataset.motionPopId=r;const g=document.createElement("style");y&&(g.nonce=y);const x=a??document.head;return x.appendChild(g),g.sheet&&g.sheet.insertRule(`
          [data-motion-pop-id="${r}"] {
            position: absolute !important;
            width: ${p}px !important;
            height: ${d}px !important;
            ${A}px !important;
            ${h}px !important;
          }
        `),()=>{x.contains(g)&&x.removeChild(g)}},[t]),R.jsx(J,{isPresent:t,childRef:u,sizeRef:C,pop:n,children:n===!1?e:i.cloneElement(e,{ref:b})})}const Z=({children:e,initial:t,isPresent:s,onExitComplete:o,custom:a,presenceAffectsLayout:n,mode:r,anchorX:u,anchorY:C,root:y})=>{const l=T(V),b=i.useId();let f=!0,p=i.useMemo(()=>(f=!1,{id:b,initial:t,isPresent:s,custom:a,onExitComplete:d=>{l.set(d,!0);for(const _ of l.values())if(!_)return;o&&o()},register:d=>(l.set(d,!1),()=>l.delete(d))}),[s,l,o]);return n&&f&&(p={...p}),i.useMemo(()=>{l.forEach((d,_)=>l.set(_,!1))},[s]),i.useEffect(()=>{!s&&!l.size&&o&&o()},[s]),e=R.jsx(X,{pop:r==="popLayout",isPresent:s,anchorX:u,anchorY:C,root:y,children:e}),R.jsx(W.Provider,{value:p,children:e})};function V(){return new Map}const k=e=>e.key||"";function S(e){const t=[];return i.Children.forEach(e,s=>{i.isValidElement(s)&&t.push(s)}),t}const ie=({children:e,custom:t,initial:s=!0,onExitComplete:o,presenceAffectsLayout:a=!0,mode:n="sync",propagate:r=!1,anchorX:u="left",anchorY:C="top",root:y})=>{const[l,b]=D(r),f=i.useMemo(()=>S(e),[e]),p=r&&!l?[]:f.map(k),d=i.useRef(!0),_=i.useRef(f),w=T(()=>new Map),j=i.useRef(new Set),[L,A]=i.useState(f),[h,g]=i.useState(f);z(()=>{d.current=!1,_.current=f;for(let m=0;m<h.length;m++){const c=k(h[m]);p.includes(c)?(w.delete(c),j.current.delete(c)):w.get(c)!==!0&&w.set(c,!1)}},[h,p.length,p.join("-")]);const x=[];if(f!==L){let m=[...f];for(let c=0;c<h.length;c++){const I=h[c],v=k(I);p.includes(v)||(m.splice(c,0,I),x.push(I))}return n==="wait"&&x.length&&(m=x),g(S(m)),A(f),null}const{forceRender:$}=i.useContext(F);return R.jsx(R.Fragment,{children:h.map(m=>{const c=k(m),I=r&&!l?!1:f===h||p.includes(c),v=()=>{if(j.current.has(c))return;if(j.current.add(c),w.has(c))w.set(c,!0);else return;let M=!0;w.forEach(B=>{B||(M=!1)}),M&&($==null||$(),g(_.current),r&&(b==null||b()),o&&o())};return R.jsx(Z,{isPresent:I,initial:!d.current||s?void 0:!1,custom:t,presenceAffectsLayout:a,mode:n,root:y,onExitComplete:I?void 0:v,anchorX:u,anchorY:C,children:m},c)})})};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=(...e)=>e.filter((t,s,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===s).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,s,o)=>o?o.toUpperCase():s.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=e=>{const t=q(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Q={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=i.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:o,className:a="",children:n,iconNode:r,...u},C)=>i.createElement("svg",{ref:C,...Q,width:t,height:t,stroke:e,strokeWidth:o?Number(s)*24/Number(t):s,className:U("lucide",a),...!n&&!ee(u)&&{"aria-hidden":"true"},...u},[...r.map(([y,l])=>i.createElement(y,l)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=(e,t)=>{const s=i.forwardRef(({className:o,...a},n)=>i.createElement(te,{ref:n,iconNode:t,className:U(`lucide-${Y(N(e))}`,`lucide-${e}`,o),...a}));return s.displayName=N(e),s};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ae=O("check",se);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ce=O("x",ne),ue=async e=>{const t="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",s=new URLSearchParams(window.location.search),o=s.get("userId")||"",a=s.get("gameId")||"",n={cust_name:e.name||e.fullName||"",mobile_no:e.mobile_no||e.contact_number||"",dob:"",gender:"M",pincode:"",email_id:e.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:o,gameID:a,remarks:`Game: ${a}${e.score!=null?` | Score: ${e.score}`:""} | ${e.summary_dtls||"Retirement Sudoku Lead"}`,appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",n);try{const r=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),u=await r.json().catch(()=>({}));return{success:r.ok,...u}}catch(r){return console.error("LMS Submission Error:",r),{success:!1,error:r.message}}},le=async(e,t)=>{const s="https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew";let o="";if(t.date){const[n,r,u]=t.date.split("-");u&&r&&n?o=`${u}/${r}/${n}`:o=t.date}const a={leadNo:e,tpa_user_id:"",miscObj1:{stringval1:"",stringval2:t.firstName||t.name||"",stringval3:t.lastName||"",stringval4:o,stringval5:t.time||"",stringval6:t.remarks||"Slot Booking via Game",stringval7:"GAMIFICATION",stringval9:t.mobile||""}};try{const n=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),r=await n.json().catch(()=>({}));return{success:n.ok,...r}}catch(n){return console.error("updateLeadNew Submission Error:",n),{success:!1,error:n.message}}};export{ie as A,ae as C,ce as X,O as c,ue as s,le as u};
