import axios from 'axios';

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getResponseMessage = (data: unknown): string | undefined => {
  if (!isRecord(data) || typeof data.message !== 'string') {
    return undefined;
  }

  const message = data.message.trim();
  return message || undefined;
};

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<unknown>(error)) {
    const responseMessage = getResponseMessage(error.response?.data);
    const axiosMessage = error.message.trim();
    const message = responseMessage ?? (axiosMessage || 'Request failed.');

    return {
      message,
      ...(error.response ? { status: error.response.status } : {}),
      ...(error.code ? { code: error.code } : {}),
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred.' };
};
