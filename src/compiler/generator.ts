import { ModifiedAst } from "@/compiler/interfaces";

export function generator(AST: ModifiedAst) {
  function gen(obj: ModifiedAst) {
    let code = "";

    while (obj.length > 0) {
      const current = obj.shift();
      if (!current) return;

      if ("name" in current) {
        code += gen(current.body);
        continue;
      }

      if ("call" in current) {
        const args = current.args
          .map((v) => {
            if (v.type === "String") {
              return `"${v.value}"`;
            }
            return v.value;
          })
          .join(",");

        code += ` this.${current.call}(${args})\n`;
        continue;
      }

      if ("keyword" in current && current.keyword === "function") {
        code += `async function ${current.args.name}() {\n`;
        code += gen(current.body);
        code += "}\n";

        code += `${current.args.name}.call(this)\n`;
        continue;
      }
    }

    return code;
  }

  return gen(AST);
}
