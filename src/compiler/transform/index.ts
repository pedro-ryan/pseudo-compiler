import {
  AstValue,
  Identifier,
  ModifiedAst,
  ModifiedExpression,
} from "@/compiler/interfaces";
import { get, set } from "@/compiler/utils";
import { SyntaxNodeRef, Tree } from "@lezer/common";

type ValueType = ModifiedExpression | Identifier | AstValue;

type GenerateValueActions = {
  removeEntered: () => void;
  setIn: (newSetIn: string | string[]) => void;
  setPath: (newPath: (number | string)[]) => void;
  pathBack: () => void;
};

function generateValue(
  node: SyntaxNodeRef,
  code: string,
  { setIn, removeEntered, setPath }: GenerateValueActions
): ValueType | boolean {
  if (["Algoritmo", "Inicio", "Fim", "Escreva"].includes(node.name)) {
    // Skip
    return false;
  }

  if (["BlockAlgoritmo", "Type", "VariableDefinition"].includes(node.name)) {
    // Skip but children add in parent
    removeEntered();
    return true;
  }

  if (node.name === "AlgorithmFile") {
    return {
      name: "Code",
      body: [],
    };
  }

  if (node.name === "AlgoritmoDeclaration") {
    setPath([0, "body"]);
    return {
      keyword: "function",
      args: {
        name: "",
      },
      body: [],
    };
  }

  if (node.name === "VariableDeclaration") {
    return {
      keyword: "let",
      args: [],
    };
  }

  if (["StringLiteral", "Identifier"].includes(node.name)) {
    let value: ValueType = {
      type: "String",
      value: code.slice(node.from, node.to).replaceAll(/(^["])|(["])$/g, ""),
    };

    if (node.name == "Identifier") {
      value = {
        name: value.value,
      };
    }
    setIn("args");
    return value;
  }

  if (node.name.includes("Statement")) {
    return {
      call: "Logger",
      args: [],
    };
  }

  return false;
}
export function transform(tree: Tree, code: string) {
  const cursor = tree.cursor();

  const entered: string[] = [];
  let path: (string | number)[] = [];
  const block: ModifiedAst = [];

  const addInPath = (value: unknown[]) => {
    path = path.concat(value.length - 1, "body");
  };

  const pathBack = () => {
    path = path.slice(0, -2);
  };

  cursor.iterate(
    (node) => {
      entered.unshift(node.name);
      let value = {} as ValueType;
      let setIn: string | string[] = "body";

      const ValueGenerated = generateValue(node, code, {
        setIn: (newSetIn) => (setIn = newSetIn),
        removeEntered: () => {
          entered.shift();
        },
        setPath: (newPath) => (path = newPath),
        pathBack,
      });
      if (typeof ValueGenerated === "boolean") return ValueGenerated;

      value = ValueGenerated;

      if (!path.length) {
        block.push(value as ModifiedExpression);
        addInPath(block);
        return true;
      }

      const setPath = path.slice(0, -1).concat(setIn);

      const oldValue = get(block, setPath);
      const newValue = Array.isArray(oldValue)
        ? oldValue.concat(value)
        : { ...oldValue, ...value };

      console.log(
        JSON.stringify(block, null, 2),
        JSON.stringify(newValue, null, 2),
        JSON.stringify(setPath)
      );
      set(block, setPath, newValue);

      if (!Array.isArray(newValue)) return false;

      if (node.name == "StringLiteral") pathBack();

      addInPath(newValue);
    },
    (node) => {
      if (entered[0] == node.name) {
        entered.shift();
        pathBack();
      }
    }
  );

  return block;
}
