import { Transformer } from "../interfaces";

const transformers: Record<string, Transformer> = {};

export function setTransformer(
  NodeName: string | string[],
  transformer: Transformer
) {
  if (typeof NodeName === "string") {
    return (transformers[NodeName] = transformer);
  }

  NodeName.forEach((name) => setTransformer(name, transformer));
}

export function getTransformer(NodeName: string): Transformer | null {
  return transformers[NodeName];
}
