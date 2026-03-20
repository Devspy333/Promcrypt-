import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const resolvedState = typeof newState === 'function' ? (newState as Function)(prev) : newState;
      
      // If the state hasn't changed, don't add to history
      if (JSON.stringify(prev) === JSON.stringify(resolvedState)) {
        return prev;
      }

      const newHistory = history.slice(0, pointer + 1);
      newHistory.push(resolvedState);
      
      setHistory(newHistory);
      setPointer(newHistory.length - 1);
      
      return resolvedState;
    });
  }, [history, pointer]);

  const undo = useCallback(() => {
    if (pointer > 0) {
      setPointer(pointer - 1);
      setState(history[pointer - 1]);
    }
  }, [history, pointer]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer(pointer + 1);
      setState(history[pointer + 1]);
    }
  }, [history, pointer]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return [state, set, { undo, redo, canUndo, canRedo }] as const;
}
