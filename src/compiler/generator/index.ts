import { getGenerator } from "@/compiler/generator/context";
import { TransformData } from "@/compiler/interfaces";
import "../definitions/loadDefinitions";

export function generator(data: TransformData[]) {
  function generate(data: TransformData[]) {
    let code = "";

    while (data.length > 0) {
      const current = data.shift();
      if (!current) return;

      const generator = getGenerator<typeof current>(current.type);
      if (!generator) continue;

      code += generator({ code, data: current, generate });
    }

    return code;
  }

  return generate(data);
}
