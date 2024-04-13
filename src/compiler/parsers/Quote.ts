import { registerParser } from "@/compiler/parsers";

registerParser("Quote", (tokens) => {
  const value = [];

  while (tokens.length > 0) {
    const next = tokens.shift();

    if (next?.type === "Quote") break;

    if (next?.type === "Indentation") {
      value.push("  ");
      continue;
    }

    if (next?.type === "NewLine") {
      value.push("\n");
      continue;
    }

    value.push(next?.value);
  }

  return {
    type: "String",
    value: value.join(" "),
  };
});
