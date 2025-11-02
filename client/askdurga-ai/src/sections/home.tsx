import React, { useRef, useEffect } from "react";
import { explainCode } from "./service/codeExplain";

// Type definitions
type ChatRole = "user" | "ai";
interface ChatMessage {
  role: ChatRole;
  text: string;
}
interface ChatState {
  history: ChatMessage[];
  loading: boolean;
  lastInput: string;
}

const languageOptions = [
  { value: "english", label: "English (Grammar Correction)" },
  { value: "javascript", label: "JavaScript (Code Explanation)" },
  { value: "python", label: "Python (Code Explanation)" },
  { value: "java", label: "Java (Code Explanation)" },
];

// LocalStorage utilities
function loadHistory(): ChatMessage[] {
  try {
    const data = localStorage.getItem("askdurga_chat_history");
    return data ? (JSON.parse(data) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChatMessage[]): void {
  try {
    localStorage.setItem("askdurga_chat_history", JSON.stringify(history));
  } catch {}
}

// Action state handler with API/service call
async function handleFormAction(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const selectedLang = formData.get("selectedLang") as string;
  const userInput = formData.get("userInput") as string;
  let result = "";

  try {
    result = await explainCode(selectedLang, userInput);
  } catch (err) {
    result = "Sorry, there was a problem communicating with the Durga.";
  }

  const newHistory: ChatMessage[] = [
    ...prevState.history,
    { role: "user", text: userInput },
    { role: "ai", text: result },
  ];
  saveHistory(newHistory);
  return {
    history: newHistory,
    loading: false,
    lastInput: "",
  };
}

const initialChatState: ChatState = {
  history: loadHistory(),
  loading: false,
  lastInput: "",
};

const Home: React.FC = () => {
  // @ts-ignore for React 19 types
  const [state, action, isPending] = React.useActionState<ChatState, FormData>(
    handleFormAction,
    initialChatState
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveHistory(state.history);
  }, [state.history]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // alert("Copied to clipboard!");
    } catch {
      // alert("Copy failed. Please try manually.");
    }
  };

  return (
    <div className="bg-[#18181a] min-h-screen w-full flex">
      {/* Sidebar */}
      <div className="bg-[#222327] border-r border-gray-800 w-64 min-h-screen py-8 px-6 hidden md:flex flex-col">
        <h2 className="text-2xl font-bold text-teal-300 mb-10">AskDurga AI</h2>
        <div className="flex flex-col gap-4">
          <span className="text-gray-400 text-sm font-medium">
            Chat History
          </span>
          {state.history.slice(0, 4).map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg bg-[#2d2f37] p-3 text-sm text-gray-300 ${
                msg.role === "ai" ? "border-l-4 border-teal-400" : ""
              }`}
            >
              {msg.text}
              {msg.role === "ai" && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.text)}
                  className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-700 text-white rounded-md px-2 py-1 text-xs flex items-center gap-1 transition"
                  aria-label="Copy response"
                >
                  {/* Simple clipboard SVG */}
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 16 16"
                  >
                    <rect x="4" y="4" width="8" height="8" rx="2" />
                    <rect
                      x="2"
                      y="2"
                      width="8"
                      height="8"
                      rx="2"
                      className="opacity-40"
                    />
                  </svg>
                  Copy
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        <div className="flex-1 px-4 py-10 flex flex-col gap-6 overflow-y-auto">
          {state.history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xl rounded-xl px-5 py-4 mb-3 whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-teal-700 text-white"
                    : "bg-[#232634] text-gray-200 border border-teal-600"
                }`}
              >
                {msg.text}
                {msg.role !== "user" && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.text)}
                    className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-700 text-white rounded-md px-2 py-1 text-xs flex items-center gap-1 transition"
                    aria-label="Copy response"
                  >
                    {/* Simple clipboard SVG */}
                    <svg
                      width={16}
                      height={16}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 16 16"
                    >
                      <rect x="4" y="4" width="8" height="8" rx="2" />
                      <rect
                        x="2"
                        y="2"
                        width="8"
                        height="8"
                        rx="2"
                        className="opacity-40"
                      />
                    </svg>
                    Copy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          className="bg-[#222327] border-t border-gray-800 px-4 py-6 flex gap-2 items-center"
          action={action}
        >
          <select
            name="selectedLang"
            className="w-52 bg-[#232634] text-gray-400 p-2 rounded-md outline-none"
            defaultValue={languageOptions[0].value}
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <textarea
            name="userInput"
            ref={textareaRef}
            className="flex-1 resize-none h-14 px-4 py-2 rounded-xl bg-[#232634] text-gray-200 outline-none border-none focus:ring-2 focus:ring-teal-500"
            placeholder="AskDurga AI — Type your sentence or code here"
            disabled={isPending}
            defaultValue=""
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-5 py-2 rounded-xl font-semibold hover:scale-[1.03] transition-all duration-200 disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
