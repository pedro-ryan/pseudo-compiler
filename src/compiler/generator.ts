import { ModifiedAst } from "@/compiler/interfaces";

export function generator(AST: ModifiedAst) {
  function gen(obj: ModifiedAst) {
    let code = "";

    while (obj.length > 0) {
      const current = obj.shift();
      if (!current) return;

      if ("name" in current && "body" in current) {
        code += gen(current.body);
        continue;
      }

      if ("name" in current) {
        code += `this.setVar("${current.name}", ${current.value})\n`;
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
        const name = current.args.name.replaceAll(" ", "_");
        code += `async function _${name}() {\n`;
        code += gen(current.body);
        code += "}\n";

        code += `_${name}.call(this);\n`;
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
