import { GoogleGenerativeAI } from "@google/generative-ai";

export const API_KEY = "AIzaSyAg1jQ6gBcT7VCemI_Z5-QKoNcJSYJvMgU";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
