import { useState } from 'react';
import type { FocusRequestController } from '../types/pronunciation.types';

// A counter a component watches to take the focus: bumping it is the request. The field uses one (history
// pick, clear); the submit button another (retry unmounts the button that had the focus, WCAG 2.4.3).
export function useFocusRequest(): FocusRequestController {
  const [id, setId] = useState(0);
  return { id, request: () => setId((current) => current + 1) };
}
