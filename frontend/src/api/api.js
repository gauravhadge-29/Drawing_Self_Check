import axios from 'axios';

/**
 * API layer — all backend communication is centralised here.
 *
 * The FastAPI backend is expected at http://localhost:7000.
 * Set VITE_API_BASE_URL to override for different environments.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

/**
 * uploadDrawing — sends a PDF file to the validation endpoint.
 *
 * @param   {File}    file  The PDF engineering drawing to validate.
 * @returns {Promise<{
 *   summary: {pass: number, fail: number},
 *   callout_validation: Array,
 *   material_validation: Object
 * }>}
 *
 * Example response shape:
 * {
 *   "summary": { "pass": 8, "fail": 0 },
 *   "callout_validation": [
 *     {
 *       "item": 1,
 *       "description": "BASE PLATE",
 *       "expected_qty": 1,
 *       "callout_found": true,
 *       "status": "PASS"
 *     },
 *     ...
 *   ],
 *   "material_validation": {
 *     "material": "EN8",
 *     "surface_finish": "BLACKODISING",
 *     "status": "PASS",
 *     "allowed_finishes": ["BLACKODISING"]
 *   }
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
