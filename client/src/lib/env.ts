const validateEnv = () => {
  const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  ;

  if (!NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_API_BASE_URL");
  }

  if (!NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_API_BASE_URL");
  }

  return {
    NEXT_PUBLIC_API_BASE_URL,
  };
};

export const env = validateEnv();
