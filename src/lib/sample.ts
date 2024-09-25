export const sampleError = `ZodError: [
  {
    "code": "invalid_union",
    "unionErrors": [
      {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "undefined",
            "path": [
              "prompt",
              "url"
            ],
            "message": "Required"
          }
        ],
        "name": "ZodError"
      },
      {
        "issues": [
          {
            "expected": "'en' | 'es' | 'fr' | 'de'",
            "received": "undefined",
            "code": "invalid_type",
            "path": [
              "prompt",
              "fromLocale"
            ],
            "message": "Required"
          },
          {
            "received": "pt",
            "code": "invalid_enum_value",
            "options": [
              "en",
              "es",
              "fr",
              "de"
            ],
            "path": [
              "prompt",
              "toLocale"
            ],
            "message": "Invalid enum value. Expected 'en' | 'es' | 'fr' | 'de', received 'pt'"
          }
        ],
        "name": "ZodError"
      }
    ],
    "path": [
      "prompt"
    ],
    "message": "Invalid input"
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "number",
    "inclusive": true,
    "exact": false,
    "message": "Number must be greater than or equal to 1",
    "path": [
      "maxTokens"
    ]
  }
]`;
