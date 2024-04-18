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
        let args = current.args.map((v) => {
          if ("name" in v) return v.name;

          if (v.type === "String") {
            return `"${v.value}"`;
          }
          return v.value;
        });

        if (current.assign) {
          code += args.join(" = ") + " = ";
          args = [];
        }
        if (current.async) code += "await ";

        code += `this.${current.call}(${args.join(",")});\n`;
        continue;
      }

      if ("keyword" in current && current.keyword === "function") {
        code += `async function ${current.args.name}() {\n`;
        code += gen(current.body);
        code += "}\n";

        code += `${current.args.name}.call(this);\n`;
        continue;
      }

      if ("keyword" in current && current.keyword === "let") {
        const variables = current.args.map((v) => {
          return v.name;
        });

        code += `let ${variables.join(",")};\n`;
      }
    }

    return code;
  }

  return gen(AST);
}
