import * as z from "zod";

const zodBaseIssue = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
});

const zodErrorMini = z
  .object({ issues: z.array(z.lazy(() => zodIssue)) })
  // Bit of trickery because all we need is the issues key from ZodError
  // but we also have to match z.ZodIssue in the overall schema.
  .transform((v) => v as z.ZodError);

const zodIssue: z.ZodType<z.ZodIssue, z.ZodTypeDef, unknown> = z.union([
  zodBaseIssue.extend({
    code: z.literal("invalid_type"),
    // The `expected` field isn't always one of z.ZodParsedType contrary to how
    // Zod defines. Here's a real world example:
    // Schema: require('zod').enum(['a', 'b', 'c']).parse(undefined)
    // {
    //   expected: "'a' | 'b' | 'c'",
    //   received: 'undefined',
    //   code: 'invalid_type',
    //   path: [],
    //   message: 'Required'
    // }
    expected: z.custom<z.ZodParsedType>((v) => typeof v === "string"),
    received: z.nativeEnum(z.ZodParsedType),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_literal"),
    expected: z.unknown(),
    received: z.unknown(),
  }),
  zodBaseIssue.extend({
    code: z.literal("unrecognized_keys"),
    keys: z.array(z.string()),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_union"),
    unionErrors: z.array(zodErrorMini),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_union_discriminator"),
    options: z.array(
      z.union([
        z.string(),
        z.number(),
        z.symbol(),
        z.bigint(),
        z.boolean(),
        z.null(),
        z.undefined(),
      ]),
    ),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_enum_value"),
    options: z.array(z.union([z.string(), z.number()])),
    received: z.union([z.string(), z.number()]),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_arguments"),
    argumentsError: zodErrorMini,
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_return_type"),
    returnTypeError: zodErrorMini,
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_date"),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_string"),
    validation: z.union([
      z.enum([
        "email",
        "url",
        "emoji",
        "uuid",
        "nanoid",
        "regex",
        "cuid",
        "cuid2",
        "ulid",
        "datetime",
        "date",
        "time",
        "duration",
        "ip",
        "base64",
      ]),
      z.object({ includes: z.string(), position: z.number().optional() }),
      z.object({ startsWith: z.string() }),
      z.object({ endsWith: z.string() }),
    ]),
  }),
  zodBaseIssue.extend({
    code: z.literal("too_small"),
    minimum: z.union([z.number(), z.bigint()]),
    inclusive: z.boolean(),
    exact: z.boolean().optional(),
    type: z.enum(["array", "string", "number", "set", "date", "bigint"]),
  }),
  zodBaseIssue.extend({
    code: z.literal("too_big"),
    maximum: z.union([z.number(), z.bigint()]),
    inclusive: z.boolean(),
    exact: z.boolean().optional(),
    type: z.enum(["array", "string", "number", "set", "date", "bigint"]),
  }),
  zodBaseIssue.extend({
    code: z.literal("invalid_intersection_types"),
  }),
  zodBaseIssue.extend({
    code: z.literal("not_multiple_of"),
    multipleOf: z.union([z.number(), z.bigint()]),
  }),
  zodBaseIssue.extend({
    code: z.literal("not_finite"),
  }),
  zodBaseIssue.extend({
    code: z.literal("custom"),
    params: z.record(z.string()).optional(),
  }),
]);

export const zodIssues = z.array(zodIssue);
