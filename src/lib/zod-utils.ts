import { ZodError } from "zod";

export function zodErrorMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
