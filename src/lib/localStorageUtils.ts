export function loadState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.warn(`Error loading state for key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.warn(`Error saving state for key "${key}" to localStorage:`, error);
  }
}
