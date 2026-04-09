import{r as o,j as k}from"./index-C_qa9Ohg.js";import{M as B,i as I,u as S,P as K,a as D,b as N,L as X}from"./proxy-DgAKDdFU.js";function W(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function Z(...e){return t=>{let n=!1;const s=e.map(c=>{const r=W(c,t);return!n&&typeof r=="function"&&(n=!0),r});if(n)return()=>{for(let c=0;c<s.length;c++){const r=s[c];typeof r=="function"?r():W(e[c],null)}}}}function F(...e){return o.useCallback(Z(...e),e)}class G extends o.Component{getSnapshotBeforeUpdate(t){const n=this.props.childRef.current;if(n&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const s=n.offsetParent,c=I(s)&&s.offsetWidth||0,r=I(s)&&s.offsetHeight||0,i=this.props.sizeRef.current;i.height=n.offsetHeight||0,i.width=n.offsetWidth||0,i.top=n.offsetTop,i.left=n.offsetLeft,i.right=c-i.width-i.left,i.bottom=r-i.height-i.top}return null}componentDidUpdate(){}render(){return this.props.children}}function O({children:e,isPresent:t,anchorX:n,anchorY:s,root:c,pop:r}){var f;const i=o.useId(),p=o.useRef(null),g=o.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0}),{nonce:x}=o.useContext(B),a=((f=e.props)==null?void 0:f.ref)??(e==null?void 0:e.ref),R=F(p,a);return o.useInsertionEffect(()=>{const{width:l,height:d,top:y,left:w,right:P,bottom:L}=g.current;if(t||r===!1||!p.current||!l||!d)return;const M=n==="left"?`left: ${w}`:`right: ${P}`,m=s==="bottom"?`bottom: ${L}`:`top: ${y}`;p.current.dataset.motionPopId=i;const C=document.createElement("style");x&&(C.nonce=x);const E=c??document.head;return E.appendChild(C),C.sheet&&C.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${l}px !important;
            height: ${d}px !important;
            ${M}px !important;
            ${m}px !important;
          }
        `),()=>{E.contains(C)&&E.removeChild(C)}},[t]),k.jsx(G,{isPresent:t,childRef:p,sizeRef:g,pop:r,children:r===!1?e:o.cloneElement(e,{ref:R})})}const T=({children:e,initial:t,isPresent:n,onExitComplete:s,custom:c,presenceAffectsLayout:r,mode:i,anchorX:p,anchorY:g,root:x})=>{const a=S(V),R=o.useId();let f=!0,l=o.useMemo(()=>(f=!1,{id:R,initial:t,isPresent:n,custom:c,onExitComplete:d=>{a.set(d,!0);for(const y of a.values())if(!y)return;s&&s()},register:d=>(a.set(d,!1),()=>a.delete(d))}),[n,a,s]);return r&&f&&(l={...l}),o.useMemo(()=>{a.forEach((d,y)=>a.set(y,!1))},[n]),o.useEffect(()=>{!n&&!a.size&&s&&s()},[n]),e=k.jsx(O,{pop:i==="popLayout",isPresent:n,anchorX:p,anchorY:g,root:x,children:e}),k.jsx(K.Provider,{value:l,children:e})};function V(){return new Map}const $=e=>e.key||"";function z(e){const t=[];return o.Children.forEach(e,n=>{o.isValidElement(n)&&t.push(n)}),t}const re=({children:e,custom:t,initial:n=!0,onExitComplete:s,presenceAffectsLayout:c=!0,mode:r="sync",propagate:i=!1,anchorX:p="left",anchorY:g="top",root:x})=>{const[a,R]=D(i),f=o.useMemo(()=>z(e),[e]),l=i&&!a?[]:f.map($),d=o.useRef(!0),y=o.useRef(f),w=S(()=>new Map),P=o.useRef(new Set),[L,M]=o.useState(f),[m,C]=o.useState(f);N(()=>{d.current=!1,y.current=f;for(let h=0;h<m.length;h++){const u=$(m[h]);l.includes(u)?(w.delete(u),P.current.delete(u)):w.get(u)!==!0&&w.set(u,!1)}},[m,l.length,l.join("-")]);const E=[];if(f!==L){let h=[...f];for(let u=0;u<m.length;u++){const b=m[u],v=$(b);l.includes(v)||(h.splice(u,0,b),E.push(b))}return r==="wait"&&E.length&&(h=E),C(z(h)),M(f),null}const{forceRender:j}=o.useContext(X);return k.jsx(k.Fragment,{children:m.map(h=>{const u=$(h),b=i&&!a?!1:f===m||l.includes(u),v=()=>{if(P.current.has(u))return;if(P.current.add(u),w.has(u))w.set(u,!0);else return;let A=!0;w.forEach(_=>{_||(A=!1)}),A&&(j==null||j(),C(y.current),i&&(R==null||R()),s&&s())};return k.jsx(T,{isPresent:b,initial:!d.current||n?void 0:!1,custom:t,presenceAffectsLayout:c,mode:r,root:x,onExitComplete:b?void 0:v,anchorX:p,anchorY:g,children:h},u)})})};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=(...e)=>e.filter((t,n,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,n,s)=>s?s.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=e=>{const t=q(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var J={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=o.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:s,className:c="",children:r,iconNode:i,...p},g)=>o.createElement("svg",{ref:g,...J,width:t,height:t,stroke:e,strokeWidth:s?Number(n)*24/Number(t):n,className:U("lucide",c),...!r&&!Q(p)&&{"aria-hidden":"true"},...p},[...i.map(([x,a])=>o.createElement(x,a)),...Array.isArray(r)?r:[r]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=(e,t)=>{const n=o.forwardRef(({className:s,...c},r)=>o.createElement(ee,{ref:r,iconNode:t,className:U(`lucide-${Y(H(e))}`,`lucide-${e}`,s),...c}));return n.displayName=H(e),n};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ie=te("x",ne);export{re as A,ie as X,te as c};
