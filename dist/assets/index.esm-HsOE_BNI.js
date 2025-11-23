import{_ as Xe,C as ke,r as ce,S as Ve,F as We,g as C,c as Ke,f as Ye}from"./index.esm2017-O9OTs5JD.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ye="firebasestorage.googleapis.com",Ee="storageBucket",Ze=2*60*1e3,Je=10*60*1e3,Qe=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d extends We{constructor(e,n,s=0){super(ee(e),`Firebase Storage: ${n} (${ee(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return ee(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var h;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(h||(h={}));function ee(t){return"storage/"+t}function re(){const t="An unknown error occurred, please check the error payload for server response.";return new d(h.UNKNOWN,t)}function et(t){return new d(h.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function tt(t){return new d(h.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function nt(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(h.UNAUTHENTICATED,t)}function st(){return new d(h.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function rt(t){return new d(h.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function Ue(){return new d(h.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Se(){return new d(h.CANCELED,"User canceled the upload/download.")}function it(t){return new d(h.INVALID_URL,"Invalid URL '"+t+"'.")}function ot(t){return new d(h.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function at(){return new d(h.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Ee+"' property when initializing the app?")}function Ae(){return new d(h.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function ut(){return new d(h.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function lt(){return new d(h.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function ct(t){return new d(h.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function q(t){return new d(h.INVALID_ARGUMENT,t)}function Ie(){return new d(h.APP_DELETED,"The Firebase app was deleted.")}function Pe(t){return new d(h.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function z(t,e){return new d(h.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function $(t){throw new d(h.INTERNAL_ERROR,"Internal error: "+t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let s;try{s=b.makeFromUrl(e,n)}catch{return new b(e,"")}if(s.path==="")return s;throw ot(e)}static makeFromUrl(e,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function i(R){R.path.charAt(R.path.length-1)==="/"&&(R.path_=R.path_.slice(0,-1))}const o="(/(.*))?$",u=new RegExp("^gs://"+r+o,"i"),a={bucket:1,path:3};function l(R){R.path_=decodeURIComponent(R.path)}const c="v[A-Za-z0-9_]+",f=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",g=new RegExp(`^https?://${f}/${c}/b/${r}/o${p}`,"i"),m={bucket:1,path:3},y=n===ye?"(?:storage.googleapis.com|storage.cloud.google.com)":n,_="([^?#]*)",A=new RegExp(`^https?://${y}/${r}/${_}`,"i"),T=[{regex:u,indices:a,postModify:i},{regex:g,indices:m,postModify:l},{regex:A,indices:{bucket:1,path:2},postModify:l}];for(let R=0;R<T.length;R++){const L=T[R],M=L.regex.exec(e);if(M){const J=M[L.indices.bucket];let H=M[L.indices.path];H||(H=""),s=new b(J,H),L.postModify(s);break}}if(s==null)throw it(e);return s}}class ht{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dt(t,e,n){let s=1,r=null,i=null,o=!1,u=0;function a(){return u===2}let l=!1;function c(..._){l||(l=!0,e.apply(null,_))}function f(_){r=setTimeout(()=>{r=null,t(g,a())},_)}function p(){i&&clearTimeout(i)}function g(_,...A){if(l){p();return}if(_){p(),c.call(null,_,...A);return}if(a()||o){p(),c.call(null,_,...A);return}s<64&&(s*=2);let T;u===1?(u=2,T=0):T=(s+Math.random())*1e3,f(T)}let m=!1;function y(_){m||(m=!0,p(),!l&&(r!==null?(_||(u=2),clearTimeout(r),f(0)):_||(u=1)))}return f(0),i=setTimeout(()=>{o=!0,y(!0)},n),y}function ft(t){t(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _t(t){return t!==void 0}function pt(t){return typeof t=="function"}function gt(t){return typeof t=="object"&&!Array.isArray(t)}function W(t){return typeof t=="string"||t instanceof String}function he(t){return ie()&&t instanceof Blob}function ie(){return typeof Blob<"u"}function se(t,e,n,s){if(s<e)throw q(`Invalid value for '${t}'. Expected ${e} or greater.`);if(s>n)throw q(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N(t,e,n){let s=e;return n==null&&(s=`https://${e}`),`${n}://${s}/v0${t}`}function xe(t){const e=encodeURIComponent;let n="?";for(const s in t)if(t.hasOwnProperty(s)){const r=e(s)+"="+e(t[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var v;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(v||(v={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(t,e){const n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||r||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e,n,s,r,i,o,u,a,l,c,f,p=!0){this.url_=e,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=u,this.errorCallback_=a,this.timeout_=l,this.progressCallback_=c,this.connectionFactory_=f,this.retry=p,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((g,m)=>{this.resolve_=g,this.reject_=m,this.start_()})}start_(){const e=(s,r)=>{if(r){s(!1,new j(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=u=>{const a=u.loaded,l=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(a,l)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const u=i.getErrorCode()===v.NO_ERROR,a=i.getStatus();if(!u||Oe(a,this.additionalRetryCodes_)&&this.retry){const c=i.getErrorCode()===v.ABORT;s(!1,new j(!1,null,c));return}const l=this.successCodes_.indexOf(a)!==-1;s(!0,new j(l,i))})},n=(s,r)=>{const i=this.resolve_,o=this.reject_,u=r.connection;if(r.wasSuccessCode)try{const a=this.callback_(u,u.getResponse());_t(a)?i(a):i()}catch(a){o(a)}else if(u!==null){const a=re();a.serverResponse=u.getErrorText(),this.errorCallback_?o(this.errorCallback_(u,a)):o(a)}else if(r.canceled){const a=this.appDelete_?Ie():Se();o(a)}else{const a=Ue();o(a)}};this.canceled_?n(!1,new j(!1,null,!0)):this.backoffId_=dt(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&ft(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class j{constructor(e,n,s){this.wasSuccessCode=e,this.connection=n,this.canceled=!!s}}function Rt(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function Tt(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function bt(t,e){e&&(t["X-Firebase-GMPID"]=e)}function wt(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function kt(t,e,n,s,r,i,o=!0){const u=xe(t.urlParams),a=t.url+u,l=Object.assign({},t.headers);return bt(l,e),Rt(l,n),Tt(l,i),wt(l,s),new mt(a,t.method,l,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yt(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Et(...t){const e=yt();if(e!==void 0){const n=new e;for(let s=0;s<t.length;s++)n.append(t[s]);return n.getBlob()}else{if(ie())return new Blob(t);throw new d(h.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Ut(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function St(t){if(typeof atob>"u")throw ct("base-64");return atob(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const E={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class te{constructor(e,n){this.data=e,this.contentType=n||null}}function Ce(t,e){switch(t){case E.RAW:return new te(Ne(e));case E.BASE64:case E.BASE64URL:return new te(ve(t,e));case E.DATA_URL:return new te(It(e),Pt(e))}throw re()}function Ne(t){const e=[];for(let n=0;n<t.length;n++){let s=t.charCodeAt(n);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const i=s,o=t.charCodeAt(++n);s=65536|(i&1023)<<10|o&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function At(t){let e;try{e=decodeURIComponent(t)}catch{throw z(E.DATA_URL,"Malformed data URL.")}return Ne(e)}function ve(t,e){switch(t){case E.BASE64:{const r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw z(t,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case E.BASE64URL:{const r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw z(t,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=St(e)}catch(r){throw r.message.includes("polyfill")?r:z(t,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class De{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw z(E.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=xt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function It(t){const e=new De(t);return e.base64?ve(E.BASE64,e.rest):At(e.rest)}function Pt(t){return new De(t).contentType}function xt(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(e,n){let s=0,r="";he(e)?(this.data_=e,s=e.size,r=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,n){if(he(this.data_)){const s=this.data_,r=Ut(s,e,n);return r===null?null:new P(r)}else{const s=new Uint8Array(this.data_.buffer,e,n-e);return new P(s,!0)}}static getBlob(...e){if(ie()){const n=e.map(s=>s instanceof P?s.data_:s);return new P(Et.apply(null,n))}else{const n=e.map(o=>W(o)?Ce(E.RAW,o).data:o.data_);let s=0;n.forEach(o=>{s+=o.byteLength});const r=new Uint8Array(s);let i=0;return n.forEach(o=>{for(let u=0;u<o.length;u++)r[i++]=o[u]}),new P(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oe(t){let e;try{e=JSON.parse(t)}catch{return null}return gt(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ot(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function Ct(t,e){const n=e.split("/").filter(s=>s.length>0).join("/");return t.length===0?n:t+"/"+n}function Le(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nt(t,e){return e}class w{constructor(e,n,s,r){this.server=e,this.local=n||e,this.writable=!!s,this.xform=r||Nt}}let G=null;function vt(t){return!W(t)||t.length<2?t:Le(t)}function K(){if(G)return G;const t=[];t.push(new w("bucket")),t.push(new w("generation")),t.push(new w("metageneration")),t.push(new w("name","fullPath",!0));function e(i,o){return vt(o)}const n=new w("name");n.xform=e,t.push(n);function s(i,o){return o!==void 0?Number(o):o}const r=new w("size");return r.xform=s,t.push(r),t.push(new w("timeCreated")),t.push(new w("updated")),t.push(new w("md5Hash",null,!0)),t.push(new w("cacheControl",null,!0)),t.push(new w("contentDisposition",null,!0)),t.push(new w("contentEncoding",null,!0)),t.push(new w("contentLanguage",null,!0)),t.push(new w("contentType",null,!0)),t.push(new w("metadata","customMetadata",!0)),G=t,G}function Dt(t,e){function n(){const s=t.bucket,r=t.fullPath,i=new b(s,r);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function Lt(t,e,n){const s={};s.type="file";const r=n.length;for(let i=0;i<r;i++){const o=n[i];s[o.local]=o.xform(s,e[o.server])}return Dt(s,t),s}function Me(t,e,n){const s=oe(e);return s===null?null:Lt(t,s,n)}function Mt(t,e,n,s){const r=oe(e);if(r===null||!W(r.downloadTokens))return null;const i=r.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(l=>{const c=t.bucket,f=t.fullPath,p="/b/"+o(c)+"/o/"+o(f),g=N(p,n,s),m=xe({alt:"media",token:l});return g+m})[0]}function ae(t,e){const n={},s=e.length;for(let r=0;r<s;r++){const i=e[r];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const de="prefixes",fe="items";function Bt(t,e,n){const s={prefixes:[],items:[],nextPageToken:n.nextPageToken};if(n[de])for(const r of n[de]){const i=r.replace(/\/$/,""),o=t._makeStorageReference(new b(e,i));s.prefixes.push(o)}if(n[fe])for(const r of n[fe]){const i=t._makeStorageReference(new b(e,r.name));s.items.push(i)}return s}function qt(t,e,n){const s=oe(n);return s===null?null:Bt(t,e,s)}class O{constructor(e,n,s,r){this.url=e,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function S(t){if(!t)throw re()}function Y(t,e){function n(s,r){const i=Me(t,r,e);return S(i!==null),i}return n}function Ft(t,e){function n(s,r){const i=qt(t,e,r);return S(i!==null),i}return n}function Ht(t,e){function n(s,r){const i=Me(t,r,e);return S(i!==null),Mt(i,r,t.host,t._protocol)}return n}function F(t){function e(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=st():r=nt():n.getStatus()===402?r=tt(t.bucket):n.getStatus()===403?r=rt(t.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return e}function Z(t){const e=F(t);function n(s,r){let i=e(s,r);return s.getStatus()===404&&(i=et(t.path)),i.serverResponse=r.serverResponse,i}return n}function Be(t,e,n){const s=e.fullServerUrl(),r=N(s,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,u=new O(r,i,Y(t,n),o);return u.errorHandler=Z(e),u}function $t(t,e,n,s,r){const i={};e.isRoot?i.prefix="":i.prefix=e.path+"/",n.length>0&&(i.delimiter=n),s&&(i.pageToken=s),r&&(i.maxResults=r);const o=e.bucketOnlyServerUrl(),u=N(o,t.host,t._protocol),a="GET",l=t.maxOperationRetryTime,c=new O(u,a,Ft(t,e.bucket),l);return c.urlParams=i,c.errorHandler=F(e),c}function zt(t,e,n){const s=e.fullServerUrl(),r=N(s,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,u=new O(r,i,Ht(t,n),o);return u.errorHandler=Z(e),u}function jt(t,e,n,s){const r=e.fullServerUrl(),i=N(r,t.host,t._protocol),o="PATCH",u=ae(n,s),a={"Content-Type":"application/json; charset=utf-8"},l=t.maxOperationRetryTime,c=new O(i,o,Y(t,s),l);return c.headers=a,c.body=u,c.errorHandler=Z(e),c}function Gt(t,e){const n=e.fullServerUrl(),s=N(n,t.host,t._protocol),r="DELETE",i=t.maxOperationRetryTime;function o(a,l){}const u=new O(s,r,o,i);return u.successCodes=[200,204],u.errorHandler=Z(e),u}function Xt(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function qe(t,e,n){const s=Object.assign({},n);return s.fullPath=t.path,s.size=e.size(),s.contentType||(s.contentType=Xt(null,e)),s}function Vt(t,e,n,s,r){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function u(){let T="";for(let R=0;R<2;R++)T=T+Math.random().toString().slice(2);return T}const a=u();o["Content-Type"]="multipart/related; boundary="+a;const l=qe(e,s,r),c=ae(l,n),f="--"+a+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+c+`\r
--`+a+`\r
Content-Type: `+l.contentType+`\r
\r
`,p=`\r
--`+a+"--",g=P.getBlob(f,s,p);if(g===null)throw Ae();const m={name:l.fullPath},y=N(i,t.host,t._protocol),_="POST",A=t.maxUploadRetryTime,I=new O(y,_,Y(t,n),A);return I.urlParams=m,I.headers=o,I.body=g.uploadData(),I.errorHandler=F(e),I}class V{constructor(e,n,s,r){this.current=e,this.total=n,this.finalized=!!s,this.metadata=r||null}}function ue(t,e){let n=null;try{n=t.getResponseHeader("X-Goog-Upload-Status")}catch{S(!1)}return S(!!n&&(e||["active"]).indexOf(n)!==-1),n}function Wt(t,e,n,s,r){const i=e.bucketOnlyServerUrl(),o=qe(e,s,r),u={name:o.fullPath},a=N(i,t.host,t._protocol),l="POST",c={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${s.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},f=ae(o,n),p=t.maxUploadRetryTime;function g(y){ue(y);let _;try{_=y.getResponseHeader("X-Goog-Upload-URL")}catch{S(!1)}return S(W(_)),_}const m=new O(a,l,g,p);return m.urlParams=u,m.headers=c,m.body=f,m.errorHandler=F(e),m}function Kt(t,e,n,s){const r={"X-Goog-Upload-Command":"query"};function i(l){const c=ue(l,["active","final"]);let f=null;try{f=l.getResponseHeader("X-Goog-Upload-Size-Received")}catch{S(!1)}f||S(!1);const p=Number(f);return S(!isNaN(p)),new V(p,s.size(),c==="final")}const o="POST",u=t.maxUploadRetryTime,a=new O(n,o,i,u);return a.headers=r,a.errorHandler=F(e),a}const _e=256*1024;function Yt(t,e,n,s,r,i,o,u){const a=new V(0,0);if(o?(a.current=o.current,a.total=o.total):(a.current=0,a.total=s.size()),s.size()!==a.total)throw ut();const l=a.total-a.current;let c=l;r>0&&(c=Math.min(c,r));const f=a.current,p=f+c;let g="";c===0?g="finalize":l===c?g="upload, finalize":g="upload";const m={"X-Goog-Upload-Command":g,"X-Goog-Upload-Offset":`${a.current}`},y=s.slice(f,p);if(y===null)throw Ae();function _(R,L){const M=ue(R,["active","final"]),J=a.current+c,H=s.size();let Q;return M==="final"?Q=Y(e,i)(R,L):Q=null,new V(J,H,M==="final",Q)}const A="POST",I=e.maxUploadRetryTime,T=new O(n,A,_,I);return T.headers=m,T.body=y.uploadData(),T.progressCallback=u||null,T.errorHandler=F(t),T}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zt={STATE_CHANGED:"state_changed"},k={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function ne(t){switch(t){case"running":case"pausing":case"canceling":return k.RUNNING;case"paused":return k.PAUSED;case"success":return k.SUCCESS;case"canceled":return k.CANCELED;case"error":return k.ERROR;default:return k.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{constructor(e,n,s){if(pt(e)||n!=null||s!=null)this.next=e,this.error=n??void 0,this.complete=s??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(t){return(...e)=>{Promise.resolve().then(()=>t(...e))}}class Qt{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=v.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=v.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=v.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,s,r){if(this.sent_)throw $("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(n,e,!0),r!==void 0)for(const i in r)r.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,r[i].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw $("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw $("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw $("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw $("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class en extends Qt{initXhr(){this.xhr_.responseType="text"}}function U(){return new en}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e,n,s=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=n,this._metadata=s,this._mappings=K(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=r=>{if(this._request=void 0,this._chunkMultiplier=1,r._codeEquals(h.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(Oe(r.status,[]))if(i)r=Ue();else{this.sleepTime=Math.max(this.sleepTime*2,Qe),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=r,this._transition("error")}},this._metadataErrorHandler=r=>{this._request=void 0,r._codeEquals(h.CANCELED)?this.completeTransitions_():(this._error=r,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((r,i)=>{this._resolve=r,this._reject=i,this._start()}),this._promise.then(null,()=>{})}isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}_makeProgressCallback(){const e=this._transferred;return n=>this._updateProgress(e+n)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([n,s])=>{switch(this._state){case"running":e(n,s);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,n)=>{const s=Wt(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,U,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((n,s)=>{const r=Kt(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(r,U,n,s);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=_e*this._chunkMultiplier,n=new V(this._transferred,this._blob.size()),s=this._uploadUrl;this._resolveToken((r,i)=>{let o;try{o=Yt(this._ref._location,this._ref.storage,s,this._blob,e,this._mappings,n,this._makeProgressCallback())}catch(a){this._error=a,this._transition("error");return}const u=this._ref.storage._makeRequest(o,U,r,i,!1);this._request=u,u.getPromise().then(a=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(a.current),a.finalized?(this._metadata=a.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){_e*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,n)=>{const s=Be(this._ref.storage,this._ref._location,this._mappings),r=this._ref.storage._makeRequest(s,U,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,n)=>{const s=Vt(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,U,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const n=this._transferred;this._transferred=e,this._transferred!==n&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const n=this._state==="paused";this._state=e,n&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=Se(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=ne(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,n,s,r){const i=new Jt(n||void 0,s||void 0,r||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,n){return this._promise.then(e,n)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const n=this._observers.indexOf(e);n!==-1&&this._observers.splice(n,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(n=>{this._notifyObserver(n)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(ne(this._state)){case k.SUCCESS:B(this._resolve.bind(null,this.snapshot))();break;case k.CANCELED:case k.ERROR:const n=this._reject;B(n.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(ne(this._state)){case k.RUNNING:case k.PAUSED:e.next&&B(e.next.bind(e,this.snapshot))();break;case k.SUCCESS:e.complete&&B(e.complete.bind(e))();break;case k.CANCELED:case k.ERROR:e.error&&B(e.error.bind(e,this._error))();break;default:e.error&&B(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D{constructor(e,n){this._service=e,n instanceof b?this._location=n:this._location=b.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new D(e,n)}get root(){const e=new b(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Le(this._location.path)}get storage(){return this._service}get parent(){const e=Ot(this._location.path);if(e===null)return null;const n=new b(this._location.bucket,e);return new D(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw Pe(e)}}function tn(t,e,n){return t._throwIfRoot("uploadBytesResumable"),new Fe(t,new P(e),n)}function nn(t){const e={prefixes:[],items:[]};return He(t,e).then(()=>e)}async function He(t,e,n){const r=await $e(t,{pageToken:n});e.prefixes.push(...r.prefixes),e.items.push(...r.items),r.nextPageToken!=null&&await He(t,e,r.nextPageToken)}function $e(t,e){e!=null&&typeof e.maxResults=="number"&&se("options.maxResults",1,1e3,e.maxResults);const n=e||{},s=$t(t.storage,t._location,"/",n.pageToken,n.maxResults);return t.storage.makeRequestWithTokens(s,U)}function sn(t){t._throwIfRoot("getMetadata");const e=Be(t.storage,t._location,K());return t.storage.makeRequestWithTokens(e,U)}function rn(t,e){t._throwIfRoot("updateMetadata");const n=jt(t.storage,t._location,e,K());return t.storage.makeRequestWithTokens(n,U)}function on(t){t._throwIfRoot("getDownloadURL");const e=zt(t.storage,t._location,K());return t.storage.makeRequestWithTokens(e,U).then(n=>{if(n===null)throw lt();return n})}function an(t){t._throwIfRoot("deleteObject");const e=Gt(t.storage,t._location);return t.storage.makeRequestWithTokens(e,U)}function ze(t,e){const n=Ct(t._location.path,e),s=new b(t._location.bucket,n);return new D(t.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un(t){return/^[A-Za-z]+:\/\//.test(t)}function ln(t,e){return new D(t,e)}function je(t,e){if(t instanceof le){const n=t;if(n._bucket==null)throw at();const s=new D(n,n._bucket);return e!=null?je(s,e):s}else return e!==void 0?ze(t,e):t}function cn(t,e){if(e&&un(e)){if(t instanceof le)return ln(t,e);throw q("To use ref(service, url), the first argument must be a Storage instance.")}else return je(t,e)}function pe(t,e){const n=e==null?void 0:e[Ee];return n==null?null:b.makeFromBucketSpec(n,t)}function hn(t,e,n,s={}){t.host=`${e}:${n}`,t._protocol="http";const{mockUserToken:r}=s;r&&(t._overrideAuthToken=typeof r=="string"?r:Ke(r,t.app.options.projectId))}class le{constructor(e,n,s,r,i){this.app=e,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=i,this._bucket=null,this._host=ye,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Ze,this._maxUploadRetryTime=Je,this._requests=new Set,r!=null?this._bucket=b.makeFromBucketSpec(r,this._host):this._bucket=pe(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=b.makeFromBucketSpec(this._url,e):this._bucket=pe(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){se("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){se("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new D(this,e)}_makeRequest(e,n,s,r,i=!0){if(this._deleted)return new ht(Ie());{const o=kt(e,this._appId,s,r,n,this._firebaseVersion,i);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,s,r).getPromise()}}const ge="@firebase/storage",me="0.13.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="storage";function fn(t,e,n){return t=C(t),tn(t,e,n)}function _n(t){return t=C(t),sn(t)}function pn(t,e){return t=C(t),rn(t,e)}function gn(t,e){return t=C(t),$e(t,e)}function mn(t){return t=C(t),nn(t)}function Rn(t){return t=C(t),on(t)}function Tn(t){return t=C(t),an(t)}function Re(t,e){return t=C(t),cn(t,e)}function bn(t,e){return ze(t,e)}function wn(t,e,n,s={}){hn(t,e,n,s)}function kn(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),s=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new le(n,s,r,e,Ve)}function yn(){Xe(new ke(dn,kn,"PUBLIC").setMultipleInstances(!0)),ce(ge,me,""),ce(ge,me,"esm2017")}yn();/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e,n,s){this._delegate=e,this.task=n,this.ref=s}get bytesTransferred(){return this._delegate.bytesTransferred}get metadata(){return this._delegate.metadata}get state(){return this._delegate.state}get totalBytes(){return this._delegate.totalBytes}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e,n){this._delegate=e,this._ref=n,this.cancel=this._delegate.cancel.bind(this._delegate),this.catch=this._delegate.catch.bind(this._delegate),this.pause=this._delegate.pause.bind(this._delegate),this.resume=this._delegate.resume.bind(this._delegate)}get snapshot(){return new X(this._delegate.snapshot,this,this._ref)}then(e,n){return this._delegate.then(s=>{if(e)return e(new X(s,this,this._ref))},n)}on(e,n,s,r){let i;return n&&(typeof n=="function"?i=o=>n(new X(o,this,this._ref)):i={next:n.next?o=>n.next(new X(o,this,this._ref)):void 0,complete:n.complete||void 0,error:n.error||void 0}),this._delegate.on(e,i,s||void 0,r||void 0)}}class be{constructor(e,n){this._delegate=e,this._service=n}get prefixes(){return this._delegate.prefixes.map(e=>new x(e,this._service))}get items(){return this._delegate.items.map(e=>new x(e,this._service))}get nextPageToken(){return this._delegate.nextPageToken||null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(e,n){this._delegate=e,this.storage=n}get name(){return this._delegate.name}get bucket(){return this._delegate.bucket}get fullPath(){return this._delegate.fullPath}toString(){return this._delegate.toString()}child(e){const n=bn(this._delegate,e);return new x(n,this.storage)}get root(){return new x(this._delegate.root,this.storage)}get parent(){const e=this._delegate.parent;return e==null?null:new x(e,this.storage)}put(e,n){return this._throwIfRoot("put"),new Te(fn(this._delegate,e,n),this)}putString(e,n=E.RAW,s){this._throwIfRoot("putString");const r=Ce(n,e),i=Object.assign({},s);return i.contentType==null&&r.contentType!=null&&(i.contentType=r.contentType),new Te(new Fe(this._delegate,new P(r.data,!0),i),this)}listAll(){return mn(this._delegate).then(e=>new be(e,this.storage))}list(e){return gn(this._delegate,e||void 0).then(n=>new be(n,this.storage))}getMetadata(){return _n(this._delegate)}updateMetadata(e){return pn(this._delegate,e)}getDownloadURL(){return Rn(this._delegate)}delete(){return this._throwIfRoot("delete"),Tn(this._delegate)}_throwIfRoot(e){if(this._delegate._location.path==="")throw Pe(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(e,n){this.app=e,this._delegate=n}get maxOperationRetryTime(){return this._delegate.maxOperationRetryTime}get maxUploadRetryTime(){return this._delegate.maxUploadRetryTime}ref(e){if(we(e))throw q("ref() expected a child path but got a URL, use refFromURL instead.");return new x(Re(this._delegate,e),this)}refFromURL(e){if(!we(e))throw q("refFromURL() expected a full URL but got a child path, use ref() instead.");try{b.makeFromUrl(e,this._delegate.host)}catch{throw q("refFromUrl() expected a valid full URL but got an invalid one.")}return new x(Re(this._delegate,e),this)}setMaxUploadRetryTime(e){this._delegate.maxUploadRetryTime=e}setMaxOperationRetryTime(e){this._delegate.maxOperationRetryTime=e}useEmulator(e,n,s={}){wn(this._delegate,e,n,s)}}function we(t){return/^[A-Za-z]+:\/\//.test(t)}const En="@firebase/storage-compat",Un="0.3.12";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sn="storage-compat";function An(t,{instanceIdentifier:e}){const n=t.getProvider("app-compat").getImmediate(),s=t.getProvider("storage").getImmediate({identifier:e});return new Ge(n,s)}function In(t){const e={TaskState:k,TaskEvent:Zt,StringFormat:E,Storage:Ge,Reference:x};t.INTERNAL.registerComponent(new ke(Sn,An,"PUBLIC").setServiceProps(e).setMultipleInstances(!0)),t.registerVersion(En,Un)}In(Ye);
