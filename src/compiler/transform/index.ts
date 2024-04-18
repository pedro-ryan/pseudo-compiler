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
  const getText = () => {
    return code.slice(node.from, node.to);
  };

  if (["Algoritmo", "Inicio", "Fim", "Escreva", "Leia"].includes(node.name)) {
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

  if (["Number", "Float"].includes(node.name)) {
    setIn("args");
    const stringNumber = getText();
    const type = stringNumber.indexOf(".") > -1 ? "Float" : "Number";

    const value =
      type === "Float" ? parseFloat(stringNumber) : parseInt(stringNumber);

    return {
      type,
      value,
    };
  }

  if (node.name === "BooleanLiteral") {
    setIn("args");
    return {
      type: "Boolean",
      value: getText() === "Verdadeiro" ? true : false,
    };
  }

  if (["StringLiteral", "Identifier"].includes(node.name)) {
    setIn("args");
    let value: ValueType = {
      type: "String",
      value: getText().replaceAll(/(^["])|(["])$/g, ""),
    };

    if (node.name == "Identifier") {
      value = {
        name: value.value,
      };
    }
    return value;
  }

  if (node.name.includes("Leia")) {
    return {
      call: "Prompt",
      async: true,
      assign: true,
      args: [],
    };
  }

  if (node.name.includes("Escreva")) {
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
        node.name,
        JSON.stringify(newValue, null, 2),
        JSON.stringify(setPath)
      );
      set(block, setPath, newValue);

      if (!Array.isArray(newValue)) return false;

      if (["StringLiteral", "Identifier"].includes(node.name)) pathBack();

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
