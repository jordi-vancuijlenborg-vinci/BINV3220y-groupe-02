// Préfixe des appels au backend ; le proxy Vite le retire avant de transmettre.
export const API_URL = "/api";

/** Erreur d'un appel à l'API, avec le statut HTTP reçu. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Vrai quand l'API signale une session absente, expirée ou invalide. */
export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

/**
 * Vérifie le statut de la réponse, puis valide son contenu JSON avec un type guard.
 * À n'utiliser que pour une réponse avec corps (pas après un 204 No Content).
 */
export const readJson = async <T>(
  response: Response,
  isExpected: (value: unknown) => value is T,
  failureMessage: string,
): Promise<T> => {
  if (!response.ok) {
    let message = failureMessage;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "object" &&
        body.error !== null &&
        "message" in body.error &&
        typeof body.error.message === "string"
      ) {
        message = body.error.message;
      }
    } catch {
      // Keep the generic message when the error response is not JSON.
    }
    throw new ApiError(response.status, `${message} (statut ${response.status})`);
  }
  const data: unknown = await response.json();
  if (!isExpected(data)) {
    throw new Error("Réponse inattendue de l'API");
  }
  return data;
};
