export const GEMINI_KEY_REQUIRED_CODE = "GEMINI_KEY_REQUIRED" as const;

export const GEMINI_HELP_URL = "https://aistudio.google.com/api-keys";
export const GEMINI_SETTINGS_PATH = "/settings/ai";

export const GEMINI_CONTACT = {
  name: "Mushfiq",
  linkedin: "https://www.linkedin.com/in/mushfiq-rahman/",
  whatsapp: "01686076447",
  whatsappUrl: "https://wa.me/8801686076447",
} as const;

export const GEMINI_DISABLED_HEADLINE = "Turn on AI for your account";

export const GEMINI_DISABLED_SUMMARY =
  "Add your free Google Gemini API key in Settings to unlock Quick entry, Money Coach, and monthly reports.";

export const GEMINI_DISABLED_FREE_NOTE =
  "It takes about a minute to create a key in Google AI Studio. Google usage limits apply.";

export const GEMINI_DISABLED_API_ERROR =
  "✨ AI is not enabled yet. Add your Gemini API key in Settings.";

export function buildGeminiKeyRequiredPayload() {
  return {
    code: GEMINI_KEY_REQUIRED_CODE,
    error: GEMINI_DISABLED_API_ERROR,
    helpUrl: GEMINI_HELP_URL,
    settingsPath: GEMINI_SETTINGS_PATH,
    contact: GEMINI_CONTACT,
  };
}

export function isGeminiKeyRequiredResponse(data: {
  code?: string;
}): boolean {
  return data.code === GEMINI_KEY_REQUIRED_CODE;
}
