export type ApiError = {
  error: {
    code: string;
    message: string;
    issues?: unknown[];
  };
};

export type ApiSuccess<T> = T;
