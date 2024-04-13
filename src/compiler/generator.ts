import { ModifiedAst, TFunctionDeclaration } from "@/compiler/interfaces";

export function generator(AST: ModifiedAst) {
  function gen(obj: ModifiedAst) {
    let code = "";

    while (obj.length > 0) {
      let current = obj.shift();
      if (!current) return;

      if (Array.isArray(current.args)) {
        const args = current.args
          .map((v) => {
            if (v.type === "String") {
              return `"${v.value}"`;
            }
            return v.value;
          })
          .join(",");

        code += ` this.${current.keyword}(${args})\n`;
        continue;
      }

      if (current.keyword === "function") {
        current = current as TFunctionDeclaration;
        code += `${current.keyword} ${current.args.name}() {\n`;
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
