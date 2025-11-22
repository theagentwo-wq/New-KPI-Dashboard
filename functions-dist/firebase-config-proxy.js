import { createRequire } from 'module'; const require = createRequire(import.meta.url);
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

// netlify/functions/firebase-config-proxy.ts
var firebase_config_proxy_exports = {};
__export(firebase_config_proxy_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(firebase_config_proxy_exports);
var handler = async () => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    // Allow requests from any origin
  };
  const configStr = process.env.FIREBASE_CLIENT_CONFIG;
  let cleanedConfigStr = configStr.trim();
  try {
    if (cleanedConfigStr.startsWith("'") && cleanedConfigStr.endsWith("'") || cleanedConfigStr.startsWith('"') && cleanedConfigStr.endsWith('"')) {
      cleanedConfigStr = cleanedConfigStr.substring(1, cleanedConfigStr.length - 1);
    }
    const configObject = JSON.parse(cleanedConfigStr);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(configObject)
    };
  } catch (error) {
    console.error("Failed to parse Firebase config on server:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to parse Firebase config on the server. The value provided is not valid JSON.",
        // Send back the original, raw value for better client-side debugging.
        rawValue: configStr
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
