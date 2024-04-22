import { TransformData } from "@/compiler/interfaces";

type helpers<T extends TransformData> = {
  code: string;
  data: T;
  generate: (data: TransformData[]) => string | undefined;
};

interface Generator<T extends TransformData> {
  (helpers: helpers<T>): string | void;
}

const generators: Record<string, Generator<never>> = {};

export function setGenerator<T extends TransformData>(
  type: TransformData["type"],
  generator: Generator<T>
) {
  generators[type] = ({ code, ...rest }) => {
    const result = generator({ code, ...rest });
    if (result) return result;
  };
}

export function getGenerator<T extends TransformData>(
  generator: TransformData["type"]
): Generator<T> {
  return generators[generator] as Generator<T>;
}
