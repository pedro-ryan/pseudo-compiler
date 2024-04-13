import { registerParser } from "@/compiler/parsers";

registerParser("//", (tokens) => {
  const value = [];

  while (tokens.length > 0) {
    const next = tokens.shift();

    if (next?.type === "NewLine") break;

    value.push(next?.value);
  }

  return {
    type: "CommentExpression",
    value: value.join(" "),
  };
});
