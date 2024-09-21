import * as z from "zod";
import { cn } from "@/lib/utils";
import React from "react";
import { zodIssues } from "@/lib/schemas";
import { Button } from "./ui/button";

const detailsThemes = [
  "bg-stone-300 dark:bg-zinc-900",
  "bg-stone-200 dark:bg-zinc-800",
] as const;
type DetailsTheme = (typeof detailsThemes)[number];
function nextTheme(current: DetailsTheme): DetailsTheme {
  return current
    ? detailsThemes[(detailsThemes.indexOf(current) + 1) % detailsThemes.length]
    : detailsThemes[0];
}
const DetailsThemeContext = React.createContext<DetailsTheme>(detailsThemes[0]);

export function ZodRawError(props: {
  input: string;
  className?: string;
}): React.ReactNode {
  const [expanded, setExpanded] = React.useState(false);
  let substr = props.input.slice(0, 256).trim();
  const lines = substr.split("\n");
  if (lines.length > 3) {
    substr = lines.slice(0, 3).join("\n");
  }

  const clipped = substr.length < props.input.length;

  return (
    <div
      className={cn(
        "rounded-3xl bg-sky-300 px-4 py-2 dark:bg-sky-600",
        props.className,
      )}
    >
      <pre className="w-full whitespace-pre-wrap">
        {!expanded && clipped ? `${substr}… ` : props.input}
      </pre>
      {clipped ? (
        <Button
          variant="link"
          className="inline p-0"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
      ) : null}
    </div>
  );
}

export function ZodFormattedError(props: {
  className?: string;
  source: string;
}): React.ReactNode {
  const [issues, err] = extractIssuesJSON(props.source);
  if (err) {
    return (
      <p
        className={cn(
          "rounded-3xl bg-red-200 px-4 py-2 font-mono md:w-fit dark:bg-red-700",
          props.className,
        )}
      >
        {err.toString()}
      </p>
    );
  }

  if (issues == null) {
    return (
      <p
        className={cn(
          "rounded-3xl bg-red-200 px-4 py-2 font-mono md:w-fit dark:bg-red-700",
          props.className,
        )}
      >
        No issues parsed from string
      </p>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-3xl bg-stone-200 md:w-fit dark:bg-zinc-800",
        props.className,
      )}
    >
      <PrettyZodIssues issues={issues} />
    </div>
  );
}

function extractIssuesJSON(err: string): [z.ZodIssue[]] | [undefined, Error] {
  const start = err.indexOf("[");
  if (start < 0) {
    return [undefined, new Error("No ZodError JSON content found in string")];
  }

  let sanitized = err.slice(start);
  const trailerIdx = sanitized.search(/]\s+errors:/);
  if (trailerIdx >= 0) {
    sanitized = sanitized.slice(0, trailerIdx + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(sanitized);
  } catch (e: unknown) {
    return [undefined, new Error(`Failed to parse ZodError JSON:\n${e}`)];
  }

  const result = zodIssues.safeParse(parsed);
  if (!result.success) {
    return [
      undefined,
      new Error(`Failed to rehydrate ZodError:\n${result.error}`),
    ];
  }

  return [result.data];
}

function PrettyZodIssues(props: {
  issues: z.ZodIssue[];
  level?: number;
  titlePrefix?: React.ReactNode;
}): React.ReactNode {
  const bg = React.useContext(DetailsThemeContext);
  const { issues, level = 0, titlePrefix = "" } = props;
  const len = issues.length;
  const summary = (
    <summary className="cursor-pointer text-lg text-red-700 dark:text-red-500">
      {titlePrefix}
      {len === 1 ? `${len} issue` : `${len} issues`}
    </summary>
  );

  const issueNodes = issues.map((issue, index, arr) => {
    let node: React.ReactNode = null;

    let path = issue.path.join(".");
    path = path ? `$.${path}` : "$";
    const pathNode = (
      <p className="text-sm">
        <span className="font-mono dark:text-yellow-400">{path}</span>:{" "}
        {issue.message}
      </p>
    );

    switch (issue.code) {
      case "invalid_literal": {
        node = (
          <Diff
            want={stringify(issue.expected)}
            got={stringify(issue.received)}
          />
        );
        break;
      }
      case "invalid_type": {
        node = (
          <Diff
            want={
              <span className="font-mono dark:text-cyan-500">
                {issue.expected}
              </span>
            }
            got={
              <span className="font-mono dark:text-cyan-500">
                {issue.received}
              </span>
            }
          />
        );
        break;
      }
      case "unrecognized_keys": {
        node = <p>Keys: {issue.keys.join(", ")}</p>;
        break;
      }
      case "invalid_enum_value": {
        node = (
          <Diff
            want={stringify(issue.options)}
            wantLabel="allowed"
            got={stringify(issue.received)}
          />
        );
        break;
      }
      case "invalid_union_discriminator": {
        node = <p>Allowed: {issue.options.join(", ")}</p>;
        break;
      }
      case "invalid_union": {
        const len = issue.unionErrors.length;
        node = (
          <>
            <p className="mb-2 max-w-prose">
              Attemped to validate data against one of {len} union members. None
              of the attempts succeeded and below are the errors that each
              raised:
            </p>
            <div className={cn("rounded-3xl", bg)}>
              {issue.unionErrors.map((err, i) => (
                <div key={i}>
                  <DetailsThemeContext.Provider value={nextTheme(bg)}>
                    <PrettyZodIssues
                      issues={err.issues}
                      level={level + 1}
                      titlePrefix={`Member ${i + 1} of ${len}: `}
                    />
                  </DetailsThemeContext.Provider>
                </div>
              ))}
            </div>
          </>
        );
        break;
      }
    }

    return (
      <li className="flex items-baseline gap-x-2" key={index}>
        {arr.length > 1 ? (
          <span className="shrink-0 grow-0 font-bold tabular-nums">
            Issue {index + 1}
          </span>
        ) : null}
        <div
          className={cn({
            "space-y-2 border-s-2 border-dotted border-red-600 ps-2": true,
            "ms-[5px]": arr.length <= 1,
          })}
        >
          {pathNode}
          {node}
        </div>
      </li>
    );
  });

  return (
    <details className={cn("max-w-full p-4")} open={level === 0}>
      {summary}
      <ol className="flex list-inside flex-col gap-4">{issueNodes}</ol>
    </details>
  );
}

function stringify(val: unknown): React.ReactNode {
  switch (true) {
    case val === null:
      return <span className="font-mono italic text-orange-600">null</span>;
    case typeof val === "undefined":
      return (
        <span className="font-mono italic text-orange-600">undefined</span>
      );
    default:
      return <span className="font-mono">{JSON.stringify(val)}</span>;
  }
}

function Diff(props: {
  want: React.ReactNode;
  wantLabel?: string;
  got: React.ReactNode;
  gotLabel?: string;
}): React.ReactNode {
  const { want, got, wantLabel = "want", gotLabel = "got" } = props;
  return (
    <dl className="grid grid-cols-[max-content,auto] items-baseline gap-x-2">
      <dt className="text-end text-sm font-semibold text-green-700 dark:text-green-600">
        {wantLabel}
      </dt>
      <dd>{want}</dd>
      <dt className="text-end text-sm font-semibold text-red-700 dark:text-red-600">
        {gotLabel}
      </dt>
      <dd>{got}</dd>
    </dl>
  );
}
