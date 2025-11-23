
import { generativeAI } from '../lib/ai-client';

// Simplified type for the result of a file upload to a storage service.
interface FileUploadResult {
  filePath: string;
  uploadId: string; // Or any other identifier from your storage service.
  mimeType: string;
  fileName: string;
}

/**
 * Starts an import job by invoking a generative AI model.
 *
 * This function sends a structured prompt to the AI model to analyze a file
 * (document or text). The prompt instructs the model to act as a financial
 * analyst, extract key information, and format the output as JSON.
 *
 * @param {FileUploadResult} file - The result of the file upload, containing metadata.
 * @param {'document' | 'text'} importType - The type of import being performed.
 * @returns {Promise<{ jobId: string }>} A promise that resolves with the job ID
 *                                      from the AI service.
 */
export const startImportJob = async (
  file: FileUploadResult,
  importType: 'document' | 'text'
): Promise<{ jobId: string }> => {
  try {
    const model = 'gemini-1.5-pro-latest';

    // The AI prompt, customized based on the import type.
    const prompt = `
      Analyze the provided ${importType} and extract financial data.
      - You are a financial analyst reviewing a document.
      - Your task is to extract all relevant information and structure it as JSON.
      - The output should be a JSON object with a single key: "results".
      - The "results" key should contain an array of objects, where each object represents a distinct data set (e.g., "Actuals" or "Budgets").
      - Each data set object must have the following properties:
        - "dataType": "Actuals" | "Budget"
        - "sourceName": string (e.g., the original file name or sheet)
        - "data": an array of objects, where each object is a row from the source.
      - If you cannot determine the data type, classify it as "Actuals".
    `;

    // Start the generative AI task.
    const result = await generativeAI.startTask({
      model,
      prompt,
      files: [{
        filePath: file.filePath,
        mimeType: file.mimeType,
        displayName: file.fileName,
      }],
      taskType: 'batch', // Asynchronous processing.
    });

    // Extract the job ID from the AI service response.
    const jobId = result.id;
    if (!jobId) {
      throw new Error('Failed to get job ID from AI service.');
    }

    return { jobId };

  } catch (error) {
    console.error('Error starting Gemini import job:', error);
    throw new Error('Failed to start the AI analysis job.');
  }
};


/**
 * Deletes a file from the import location.
 *
 * Note: This is a placeholder. In a real application, this function would
 * interact with your storage service (e.g., Firebase Storage, Google Cloud Storage)
 * to delete the specified file.
 *
 * @param {string} filePath - The path of the file to delete.
 * @returns {Promise<void>}
 */
export const deleteImportFile = async (filePath: string): Promise<void> => {
  console.warn(
    `[INFO] File deletion requested for: ${filePath}. In a real implementation, ` +
    `this would trigger a cloud function or backend service to handle the deletion.`
  );
  // In a real-world scenario, you would make an API call to your backend
  // to securely delete the file from your storage bucket.
  // For example:
  // await fetch('/api/deleteFile', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  -  // body: JSON.stringify({ filePath }),
  // });
  return Promise.resolve();
};
