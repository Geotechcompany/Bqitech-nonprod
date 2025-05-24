import { useState } from "react";
import type { ActionResponse } from "@/types/action";

interface UseActionStateResult<T> {
  execute: (data: T) => Promise<ActionResponse | undefined>;
  isLoading: boolean;
  error: string | null;
}

interface ErrorWithMessage {
  message: string;
}

export function useActionState<T>(
  action: (data: T) => Promise<ActionResponse>
): UseActionStateResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (data: T) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await action(data);
      if (!response.success) {
        if (typeof response.error === "string") {
          setError(response.error);
        } else if (response.error && typeof (response.error as ErrorWithMessage).message === 'string') {
          setError((response.error as ErrorWithMessage).message);
        } else if (typeof response.error === "object") {
          setError("An unexpected error occurred");
        }
        return undefined;
      }
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
