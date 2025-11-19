Diagnosis

TypeScript compilation aborts because of unused declarations. See line 66 for importSuccess in components/ImportDataModal.tsx and line 67 for marked in services/geminiService.ts. The project likely has noUnusedLocals enabled, so these unused bindings are treated as errors.
Solution

In components/ImportDataModal.tsx, either use the importSuccess state (for example, display a success alert) or remove the useState declaration if it’s not needed:

// remove if unused
// const [importSuccess, setImportSuccess] = useState(false);
and delete any related setter/effect code that’s no longer needed.

In services/geminiService.ts, either import and use marked or remove the unused import:

// remove if unused
// import { marked } from 'marked';
If marked was intended for Markdown parsing, add code that uses it to process responses.