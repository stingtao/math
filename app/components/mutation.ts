export function mutationHeaders(idempotencyKey = crypto.randomUUID()) {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
  };
}
