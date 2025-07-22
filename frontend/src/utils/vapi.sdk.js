
import Vapi from '@vapi-ai/web';
 
const vapi = new Vapi({
  apiKey: import.meta.env.VITE_VAPI_WEB_TOKEN,
  assistant: import.meta.env.VITE_VAPI_ASSISTANT_ID,
  // must exist
});

export default vapi;