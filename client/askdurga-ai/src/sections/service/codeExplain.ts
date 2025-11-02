import axios from "axios";
const EXPLAIN_API_URL = import.meta.env.VITE_API_EXPLAIN_CODE;

export async function explainCode(
  language: string,
  code: string
): Promise<string> {
  console.log("request", language, code);
  const response = await axios.post(`${EXPLAIN_API_URL}api/explain-code`, {
    language,
    code,
  });

  console.log("response", response);

  if (response.status !== 200) {
    throw new Error("Failed to fetch explanation");
  }

  return response.data.explanation as string;
}
