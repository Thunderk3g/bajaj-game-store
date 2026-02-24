import{r as o,j as b}from"./index-LE8XylbA.js";import{M as K,i as I,u as H,P as N,a as D,b as X,L as Z}from"./proxy-BGmYe_eA.js";function _(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function F(...e){return t=>{let n=!1;const s=e.map(c=>{const r=_(c,t);return!n&&typeof r=="function"&&(n=!0),r});if(n)return()=>{for(let c=0;c<s.length;c++){const r=s[c];typeof r=="function"?r():_(e[c],null)}}}}function G(...e){return o.useCallback(F(...e),e)}class O extends o.Component{getSnapshotBeforeUpdate(t){const n=this.props.childRef.current;if(n&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const s=n.offsetParent,c=I(s)&&s.offsetWidth||0,r=I(s)&&s.offsetHeight||0,i=this.props.sizeRef.current;i.height=n.offsetHeight||0,i.width=n.offsetWidth||0,i.top=n.offsetTop,i.left=n.offsetLeft,i.right=c-i.width-i.left,i.bottom=r-i.height-i.top}return null}componentDidUpdate(){}render(){return this.props.children}}function T({children:e,isPresent:t,anchorX:n,anchorY:s,root:c,pop:r}){var f;const i=o.useId(),p=o.useRef(null),g=o.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:x}=o.useContext(K),u=((f=e.props)==null?void 0:f.ref)??(e==null?void 0:e.ref),R=G(p,u);return o.useInsertionEffect(()=>{const{width:l,height:d,top:y,left:w,right:$,bottom:M}=g.current;if(t||r===!1||!p.current||!l||!d)return;const L=n==="left"?`left: ${w}`:`right: ${$}`,m=s==="bottom"?`bottom: ${M}`:`top: ${y}`;p.current.dataset.motionPopId=i;const C=document.createElement("style");x&&(C.nonce=x);const k=c??document.head;return k.appendChild(C),C.sheet&&C.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${l}px !important;
            height: ${d}px !important;
            ${L}px !important;
            ${m}px !important;
          }
        `),()=>{k.contains(C)&&k.removeChild(C)}},[t]),b.jsx(O,{isPresent:t,childRef:p,sizeRef:g,pop:r,children:r===!1?e:o.cloneElement(e,{ref:R})})}const V=({children:e,initial:t,isPresent:n,onExitComplete:s,custom:c,presenceAffectsLayout:r,mode:i,anchorX:p,anchorY:g,root:x})=>{const u=H(Y),R=o.useId();let f=!0,l=o.useMemo(()=>(f=!1,{id:R,initial:t,isPresent:n,custom:c,onExitComplete:d=>{u.set(d,!0);for(const y of u.values())if(!y)return;s&&s()},register:d=>(u.set(d,!1),()=>u.delete(d))}),[n,u,s]);return r&&f&&(l={...l}),o.useMemo(()=>{u.forEach((d,y)=>u.set(y,!1))},[n]),o.useEffect(()=>{!n&&!u.size&&s&&s()},[n]),e=b.jsx(T,{pop:i==="popLayout",isPresent:n,anchorX:p,anchorY:g,root:x,children:e}),b.jsx(N.Provider,{value:l,children:e})};function Y(){return new Map}const P=e=>e.key||"";function W(e){const t=[];return o.Children.forEach(e,n=>{o.isValidElement(n)&&t.push(n)}),t}const ie=({children:e,custom:t,initial:n=!0,onExitComplete:s,presenceAffectsLayout:c=!0,mode:r="sync",propagate:i=!1,anchorX:p="left",anchorY:g="top",root:x})=>{const[u,R]=D(i),f=o.useMemo(()=>W(e),[e]),l=i&&!u?[]:f.map(P),d=o.useRef(!0),y=o.useRef(f),w=H(()=>new Map),$=o.useRef(new Set),[M,L]=o.useState(f),[m,C]=o.useState(f);X(()=>{d.current=!1,y.current=f;for(let h=0;h<m.length;h++){const a=P(m[h]);l.includes(a)?(w.delete(a),$.current.delete(a)):w.get(a)!==!0&&w.set(a,!1)}},[m,l.length,l.join("-")]);const k=[];if(f!==M){let h=[...f];for(let a=0;a<m.length;a++){const E=m[a],v=P(E);l.includes(v)||(h.splice(a,0,E),k.push(E))}return r==="wait"&&k.length&&(h=k),C(W(h)),L(f),null}const{forceRender:j}=o.useContext(Z);return b.jsx(b.Fragment,{children:m.map(h=>{const a=P(h),E=i&&!u?!1:f===m||l.includes(a),v=()=>{if($.current.has(a))return;if($.current.add(a),w.has(a))w.set(a,!0);else return;let A=!0;w.forEach(B=>{B||(A=!1)}),A&&(j==null||j(),C(y.current),i&&(R==null||R()),s&&s())};return b.jsx(V,{isPresent:E,initial:!d.current||n?void 0:!1,custom:t,presenceAffectsLayout:c,mode:r,root:x,onExitComplete:E?void 0:v,anchorX:p,anchorY:g,children:h},a)})})};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=(...e)=>e.filter((t,n,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,n,s)=>s?s.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=e=>{const t=J(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Q={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=o.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:s,className:c="",children:r,iconNode:i,...p},g)=>o.createElement("svg",{ref:g,...Q,width:t,height:t,stroke:e,strokeWidth:s?Number(n)*24/Number(t):n,className:S("lucide",c),...!r&&!ee(p)&&{"aria-hidden":"true"},...p},[...i.map(([x,u])=>o.createElement(x,u)),...Array.isArray(r)?r:[r]]));/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=(e,t)=>{const n=o.forwardRef(({className:s,...c},r)=>o.createElement(te,{ref:r,iconNode:t,className:S(`lucide-${q(z(e))}`,`lucide-${e}`,s),...c}));return n.displayName=z(e),n};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ce=U("check",ne);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ae=U("x",se);export{ie as A,ce as C,ae as X,U as c};
