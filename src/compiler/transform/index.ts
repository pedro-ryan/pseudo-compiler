import { get, set } from "@/compiler/utils";
import { Tree } from "@lezer/common";
import "../definitions/loadDefinitions";
import { TransformData, TransformerHelpers } from "../interfaces";
import { getTransformer } from "./context";

export function transform(tree: Tree, code: string) {
  const cursor = tree.cursor();

  const entered: string[] = [];
  let path: (string | number)[] = [];
  let block: TransformData[] = [];

  cursor.iterate(
    (node) => {
      const transformer = getTransformer(node.name);

      console.log(node.name, transformer);
      if (!transformer) return false;

      let childrenIn: string = "";
      let skipChildren = false;

      const helpers: TransformerHelpers = {
        node,
        getText(toGetNode) {
          const scopedNode = toGetNode ?? node;
          return code.slice(scopedNode.from, scopedNode.to);
        },
        childrenIn(In) {
          entered.unshift(node.name);
          childrenIn = In;
        },
        getChild(...props) {
          return node.node.getChild(...props);
        },
        skipChildren() {
          skipChildren = true;
        },
      };

      const data = transformer(helpers);

      if (!data || typeof data === "boolean") return data;

      const oldValue = get(block, path) ?? [];
      if (!Array.isArray(oldValue)) {
        throw new Error("old value is not array ? hmmm check the transform");
      }

      const newValue = oldValue.concat(data);

      console.log(
        JSON.stringify(block, null, 2),
        node.name,
        JSON.stringify(newValue, null, 2),
        JSON.stringify(path)
      );
      if (path.length) {
        set(block, path, newValue);
      } else {
        block = newValue;
      }

      if (childrenIn) {
        path = path.concat(newValue.length - 1, childrenIn);
      }
      if (skipChildren) return false;
    },
    (node) => {
      if (entered[0] == node.name) {
        entered.shift();
        path = path.slice(0, -2);
      }
    }
  );

  return block;
}
