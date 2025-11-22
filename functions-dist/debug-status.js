"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/debug-status.ts
var debug_status_exports = {};
__export(debug_status_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(debug_status_exports);
var handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Debug function is working!",
      nodeVersion: process.version,
      env: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasMapsKey: !!process.env.MAPS_API_KEY,
        hasFirebaseConfig: !!process.env.FIREBASE_CLIENT_CONFIG
      }
    })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
