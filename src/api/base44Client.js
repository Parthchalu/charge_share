import { createClient } from '@base44/sdk';
import { getAccessToken } from '@base44/sdk';

// Create a client without requiring authentication upfront
export const base44 = createClient({
  appId: "68a832ad0722d741fc6f135b",
  getAccessToken
});
