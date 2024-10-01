import React from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { ZodFormattedError, ZodRawError } from "./components/zod-error";
import speakeasyWhiteLogo from "./assets/speakeasy-white.svg";
import speakeasyBlackLogo from "./assets/speakeasy-black.svg";
import zodLogo from "./assets/zod.svg";
import { stringFromBase64, stringToBase64 } from "./lib/base64";
import { sampleError } from "./lib/sample";

const ZodFormattedErrorMemo = React.memo(ZodFormattedError);

function App() {
  const [inputs, setInputs] = React.useState(() => {
    const initial: string[] = [];
    if (typeof window === "undefined") {
      return initial;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const zerror = searchParams.get("e");
    return zerror ? [stringFromBase64(zerror)] : initial;
  });

  React.useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "popstate",
      () => {
        const searchParams = new URLSearchParams(window.location.search);
        const zerror = searchParams.get("e");
        if (zerror) {
          setInputs([stringFromBase64(zerror)]);
        } else {
          setInputs([]);
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    const { target } = e;
    if (!(target instanceof HTMLFormElement)) {
      return;
    }

    e.preventDefault();
    const formData = new FormData(target);
    const val = formData.get("zoderror");
    if (typeof val !== "string" || !val) {
      return;
    }

    setInputs((prev) => [...prev, val]);

    const searchParams = new URLSearchParams({ e: stringToBase64(val) });
    const q = searchParams.toString();
    if (q) {
      window.history.pushState({}, "", `?${q}`);
    }

    target.reset();
  };

  const handleClear: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams(window.location.search);
    const zerror = searchParams.get("e");

    if (inputs.length) {
      setInputs([]);
    }

    if (zerror) {
      window.history.pushState({}, "", "?");
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      target.closest("form")?.requestSubmit();
    }
  };

  return (
    <main className="h-[100dvh]">
      <div className="grid min-h-full w-full grid-rows-[max-content_auto_fit-content(300px)] gap-y-2 border-0">
        <div className="border-b border-muted p-4 md:p-6">
          <div className="flex items-center gap-2">
            <img
              src={zodLogo}
              alt="Zod logo"
              className="h-12 w-12 shrink-0 grow-0 origin-center rotate-180 rounded-full"
            />
            <div className="grow-1">
              <h1 className="text-xl font-semibold leading-none tracking-tight">
                What in Zod's name?
              </h1>
              <p className="max-w-prose text-sm text-muted-foreground">
                You're here because you have a big{" "}
                <code className="text-red-700 dark:text-red-500">ZodError</code>{" "}
                and you're trying to make sense of it. Throw it in the box below
                and we'll try to visualize it for you.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full overflow-auto p-4 md:p-6">
          {inputs.length === 0 ? (
            <div>
              <p className="mb-2 max-w-prose text-sm">
                ZodError strings contain a bit of JSON content. This is the
                array of issues that will be rendered below.
              </p>
              <Button
                onClick={() => setInputs([sampleError])}
                variant="secondary"
              >
                Try an example
              </Button>
            </div>
          ) : null}
          <ul className="space-y-4">
            {inputs.map((input, index) => (
              <li key={index}>
                <ZodRawError className="mb-2 w-fit" input={input} />
                <ZodFormattedErrorMemo source={input} />
              </li>
            ))}
          </ul>
        </div>
        <div className="sticky bottom-0 bg-background p-4 md:p-6">
          <form
            className="mb-2 flex w-full items-center gap-x-2"
            onSubmit={handleSubmit}
          >
            <Textarea
              name="zoderror"
              className="h-full min-h-[76px] w-full grow font-mono text-base"
              placeholder="Paste your ZodError"
              onKeyDown={handleKeyDown}
            />
            <div className="flex shrink-0 grow-0 flex-col gap-1">
              <Button className="grow-1 shrink-1 block" type="submit">
                Explain
              </Button>
              <Button
                className="grow-1 shrink-1 block"
                type="button"
                variant="ghost"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </form>
          <footer className="text-xs">
            <ul className="flex gap-x-2">
              <li>
                <a
                  className="border-b border-transparent pb-[2px] transition-all duration-200 hover:border-current"
                  href="https://www.speakeasy.com"
                >
                  Made by the team at <span className="sr-only">Speakeasy</span>
                  <picture>
                    <source
                      srcSet={speakeasyWhiteLogo}
                      media="(prefers-color-scheme: dark)"
                    />
                    <img
                      className="inline-block h-3 w-auto align-baseline"
                      src={speakeasyBlackLogo}
                      alt=""
                    />
                  </picture>
                </a>
              </li>
              <li className="before:pe-2 before:content-['•']">
                <a
                  className="border-b border-transparent pb-[2px] transition-all duration-200 hover:border-current"
                  href="https://github.com/speakeasy-api/what-in-zods-name"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default App;
