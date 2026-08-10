import { createServerFn } from "@tanstack/react-start";
import { translateInputSchema, translateSiteTexts } from "@/lib/translate.server";

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => translateInputSchema.parse(data))
  .handler(async ({ data }) => translateSiteTexts(data));
