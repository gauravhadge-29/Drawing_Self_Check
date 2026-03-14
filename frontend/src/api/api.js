import axios from 'axios';

/**
 * API layer — all backend communication is centralised here.
 *
 * The FastAPI backend is expected at http://localhost:8000.
 * During `npm run dev`, Vite proxies /validate-drawing to that origin
 * so no CORS headers are needed on the backend for local development.
 */
const BASE_URL = 'http://localhost:7000';

/**
 * uploadDrawing — sends a PDF file to the validation endpoint.
 *
 * @param   {File}    file  The PDF engineering drawing to validate.
 * @returns {Promise<{summary: {pass: number, fail: number}, items: Array}>}
 *
 * Example response shape:
 * {
 *   "summary": { "pass": 8, "fail": 0 },
 *   "items": [
 *     {
 *       "item": 1,
 *       "description": "BASE PLATE",
 *       "expected_qty": 1,
 *       "callout_found": true,
 *       "status": "PASS"
 *     },
 *     ...
 *   ]
 * }
 */
export async function uploadDrawing(file) {
  const formData = new FormData();
  // The field name must match the FastAPI endpoint parameter name.
  formData.append('file', file);

  const response = await axios.post(`${BASE_URL}/validate-drawing`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Surface detailed server error messages in Axios error.response.data.detail
    validateStatus: (status) => status < 500,
  });

  // Treat 4xx responses (bad request, unsupported file, etc.) as errors.
  if (response.status >= 400) {
    const detail = response.data?.detail ?? 'Unknown error from server.';
    throw new Error(detail);
  }

  return response.data;
}
