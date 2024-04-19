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
          if ("name" in v) return `this.getVar("${v.name}")`;

          if (v.type === "String") {
            return `"${v.value}"`;
          }
          return v.value;
        });

        if (current.assign) {
          const prop = String(args[0]).replaceAll(/.*\("|"\).*/g, "");
          code += `this.setVar("${prop}", `;
          args = [];
        }
        if (current.async) code += "await ";

        code += `this.${current.call}(${args.join(",")})\n`;
        if (current.assign) code += ");\n";
        continue;
      }

      if ("keyword" in current && current.keyword === "function") {
        code += `async function ${current.args.name}() {\n`;
        code += gen(current.body);
        code += "}\n";

        code += `${current.args.name}.call(this);\n`;
        continue;
      }

      if ("keyword" in current && current.keyword === "var") {
        const variables = current.body
          .map((v) => {
            if (!("name" in v)) return;

            let defaultValue: string | number | boolean = '""';
            if (v.type === "Boolean") defaultValue = "false";
            if (v.type === "Number") defaultValue = "0";

            return `${v.name}:${defaultValue}`;
          })
          .filter(Boolean);

        code += `this.variables = {\n`;
        code += variables.join(",\n");
        code += `\n}\n`;
      }
    }

    return code;
  }

  return gen(AST);
}
