import { Ast, ModifiedAst } from "@/compiler/interfaces";

export function transform(AST: Ast) {
  function _transform(obj: Ast) {
    const ModAST: ModifiedAst = [];

    while (obj.length > 0) {
      const node = obj.shift();
      if (!node) continue;

      if (node.type === "FunctionDeclaration") {
        const functionName = node.identifier.value.replaceAll(" ", "_");

        ModAST.push({
          keyword: "function",
          args: {
            name: functionName,
          },
          body: _transform(node.body),
        });
      }

      if (node.type === "CallExpression") {
        ModAST.push({
          keyword: node.name,
          args: node.args ?? [],
        });
      }
    }
    return ModAST;
  }

  return _transform(AST);
}
