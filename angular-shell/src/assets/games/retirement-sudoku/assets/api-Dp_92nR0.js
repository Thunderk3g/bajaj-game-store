import{r as i,j as R}from"./index-D3FJtfug.js";import{M as G,i as S,u as T,P as W,a as z,b as F,L as H}from"./proxy-Dg6zAroD.js";function E(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function D(...e){return t=>{let s=!1;const n=e.map(r=>{const o=E(r,t);return!s&&typeof o=="function"&&(s=!0),o});if(s)return()=>{for(let r=0;r<n.length;r++){const o=n[r];typeof o=="function"?o():E(e[r],null)}}}}function K(...e){return i.useCallback(D(...e),e)}class J extends i.Component{getSnapshotBeforeUpdate(t){const s=this.props.childRef.current;if(s&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const n=s.offsetParent,r=S(n)&&n.offsetWidth||0,o=S(n)&&n.offsetHeight||0,a=this.props.sizeRef.current;a.height=s.offsetHeight||0,a.width=s.offsetWidth||0,a.top=s.offsetTop,a.left=s.offsetLeft,a.right=r-a.width-a.left,a.bottom=o-a.height-a.top}return null}componentDidUpdate(){}render(){return this.props.children}}function X({children:e,isPresent:t,anchorX:s,anchorY:n,root:r,pop:o}){var l;const a=i.useId(),p=i.useRef(null),C=i.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:y}=i.useContext(G),u=((l=e.props)==null?void 0:l.ref)??(e==null?void 0:e.ref),w=K(p,u);return i.useInsertionEffect(()=>{const{width:f,height:d,top:_,left:b,right:j,bottom:A}=C.current;if(t||o===!1||!p.current||!f||!d)return;const L=s==="left"?`left: ${b}`:`right: ${j}`,h=n==="bottom"?`bottom: ${A}`:`top: ${_}`;p.current.dataset.motionPopId=a;const g=document.createElement("style");y&&(g.nonce=y);const x=r??document.head;return x.appendChild(g),g.sheet&&g.sheet.insertRule(`
          [data-motion-pop-id="${a}"] {
            position: absolute !important;
            width: ${f}px !important;
            height: ${d}px !important;
            ${L}px !important;
            ${h}px !important;
          }
        `),()=>{x.contains(g)&&x.removeChild(g)}},[t]),R.jsx(J,{isPresent:t,childRef:p,sizeRef:C,pop:o,children:o===!1?e:i.cloneElement(e,{ref:w})})}const Z=({children:e,initial:t,isPresent:s,onExitComplete:n,custom:r,presenceAffectsLayout:o,mode:a,anchorX:p,anchorY:C,root:y})=>{const u=T(V),w=i.useId();let l=!0,f=i.useMemo(()=>(l=!1,{id:w,initial:t,isPresent:s,custom:r,onExitComplete:d=>{u.set(d,!0);for(const _ of u.values())if(!_)return;n&&n()},register:d=>(u.set(d,!1),()=>u.delete(d))}),[s,u,n]);return o&&l&&(f={...f}),i.useMemo(()=>{u.forEach((d,_)=>u.set(_,!1))},[s]),i.useEffect(()=>{!s&&!u.size&&n&&n()},[s]),e=R.jsx(X,{pop:a==="popLayout",isPresent:s,anchorX:p,anchorY:C,root:y,children:e}),R.jsx(W.Provider,{value:f,children:e})};function V(){return new Map}const k=e=>e.key||"";function P(e){const t=[];return i.Children.forEach(e,s=>{i.isValidElement(s)&&t.push(s)}),t}const ie=({children:e,custom:t,initial:s=!0,onExitComplete:n,presenceAffectsLayout:r=!0,mode:o="sync",propagate:a=!1,anchorX:p="left",anchorY:C="top",root:y})=>{const[u,w]=z(a),l=i.useMemo(()=>P(e),[e]),f=a&&!u?[]:l.map(k),d=i.useRef(!0),_=i.useRef(l),b=T(()=>new Map),j=i.useRef(new Set),[A,L]=i.useState(l),[h,g]=i.useState(l);F(()=>{d.current=!1,_.current=l;for(let m=0;m<h.length;m++){const c=k(h[m]);f.includes(c)?(b.delete(c),j.current.delete(c)):b.get(c)!==!0&&b.set(c,!1)}},[h,f.length,f.join("-")]);const x=[];if(l!==A){let m=[...l];for(let c=0;c<h.length;c++){const I=h[c],$=k(I);f.includes($)||(m.splice(c,0,I),x.push(I))}return o==="wait"&&x.length&&(m=x),g(P(m)),L(l),null}const{forceRender:v}=i.useContext(H);return R.jsx(R.Fragment,{children:h.map(m=>{const c=k(m),I=a&&!u?!1:l===h||f.includes(c),$=()=>{if(j.current.has(c))return;if(j.current.add(c),b.has(c))b.set(c,!0);else return;let M=!0;b.forEach(B=>{B||(M=!1)}),M&&(v==null||v(),g(_.current),a&&(w==null||w()),n&&n())};return R.jsx(Z,{isPresent:I,initial:!d.current||s?void 0:!1,custom:t,presenceAffectsLayout:r,mode:o,root:y,onExitComplete:I?void 0:$,anchorX:p,anchorY:C,children:m},c)})})};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=(...e)=>e.filter((t,s,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===s).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,s,n)=>n?n.toUpperCase():s.toLowerCase());/**
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
 */const te=i.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:n,className:r="",children:o,iconNode:a,...p},C)=>i.createElement("svg",{ref:C,...Q,width:t,height:t,stroke:e,strokeWidth:n?Number(s)*24/Number(t):s,className:U("lucide",r),...!o&&!ee(p)&&{"aria-hidden":"true"},...p},[...a.map(([y,u])=>i.createElement(y,u)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=(e,t)=>{const s=i.forwardRef(({className:n,...r},o)=>i.createElement(te,{ref:o,iconNode:t,className:U(`lucide-${Y(N(e))}`,`lucide-${e}`,n),...r}));return s.displayName=N(e),s};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ae=O("check",se);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ce=O("x",ne),ue=async e=>{const t="https://bjuat.bajajlife.com/BalicLmsUtil/whatsappInhouse",s=sessionStorage.getItem("gamification_userId")||"",n=sessionStorage.getItem("gamification_gameId")||"",r={cust_name:e.name||e.fullName||"",mobile_no:e.mobile_no||e.contact_number||"",dob:"",gender:"M",pincode:"",email_id:e.email_id||"",life_goal_category:"",investment_amount:"",product_id:"",p_source:"Marketing Assist",p_data_source:"GAMIFICATION",pasa_amount:"",product_name:"",pasa_product:"",associated_rider:"",customer_app_product:"",p_data_medium:" GAMIFICATION ",utmSource:"",userId:s,gameID:n,remarks:`Game: ${n}${e.score!=null?` | Score: ${e.score}`:""} | ${e.summary_dtls||"Retirement Sudoku Lead"}`,appointment_date:"",appointment_time:""};console.log("[API] Submitting lead to WhatsApp Inhouse API:",r);try{const o=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),a=await o.json().catch(()=>({}));return{success:o.ok,...a}}catch(o){return console.error("LMS Submission Error:",o),{success:!1,error:o.message}}},le=async(e,t)=>{const s="https://bjuat.bajajlife.com/BalicLmsUtil/updateLeadNew",n={leadNo:e,tpa_user_id:"",miscObj1:{stringval1:"",stringval2:t.name||t.firstName||"",stringval3:t.lastName||"",stringval4:t.date||"",stringval5:t.time||"",stringval6:t.remarks||"Slot Booking via Game",stringval7:"GAMIFICATION",stringval9:t.mobile||""}};try{const r=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),o=await r.json().catch(()=>({}));return{success:r.ok,...o}}catch(r){return console.error("updateLeadNew Submission Error:",r),{success:!1,error:r.message}}};export{ie as A,ae as C,ce as X,O as c,ue as s,le as u};
