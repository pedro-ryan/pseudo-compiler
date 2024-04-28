import { get, set } from "@/compiler/utils";
import { ConsoleStore } from "@/stores/console";

const prepareLog = (log: unknown) => {
  if (typeof log === "object") {
    return JSON.stringify(log, null, 2);
  }

  if (typeof log === "boolean") {
    return log ? "Verdadeiro" : "Falso";
  }

  return String(log);
};
export const Logger = (log: unknown, newLine = false) => {
  const { appendLog, log: Log } = ConsoleStore.getState();
  const logString = prepareLog(log);
  if (newLine) Log(logString);
  else appendLog(logString);
  console.log(logString);
};

const LoggerNewLine = (log: unknown) => {
  Logger(log, true);
};

const Clear = () => {
  ConsoleStore.getState().clear();
};

const DivInt = (n1: number, n2: number) => {
  return parseInt(String(n1 / n2));
};

const XOR = (x: unknown, y: unknown) => {
  return (x || y) && !(x && y);
};

const errors = {
  NotDefined: (prop?: string, vectorY?: string, vectorX?: string) => {
    if (vectorY) {
      prop += `[${vectorY}`;
      if (vectorX !== "undefined") prop += `, ${vectorX}`;
      prop += "]";
    }
    return `A variável "${prop}", não foi encontrada, verifique se você a declarou no bloco de variáveis`;
  },
  TypeError: (prop?: string, valueType?: string, propType?: string) =>
    `O valor do tipo "${valueType}" não pode ser atribuindo em uma variável do tipo "${propType}", e neste caso a variável "${prop}" é do tipo "${propType}"`,
  NotMatriz: (prop?: string) => {
    return `a variável "${prop}" que você está tentando acessar não é uma matriz`;
  },
  VectorIndexNumber: (prop?: string) => {
    return `a variável "${prop}" é um vetor/matriz e precisa que seu índice seja um numero para pode-la acessar`;
  },
  MatrizNeedX: (prop?: string) => {
    return `a variável "${prop}" é uma matriz sendo assim precisa de dois indices, por exemplo: ${prop}[0,0]`;
  },
  VectorIndexInvalid: (
    prop?: string,
    vectorY?: string,
    vectorX?: string,
    errorIn?: string
  ) => {
    return `o índice "${
      errorIn == "y" ? vectorY : vectorX
    }" passado para a variável "${prop}" é invalido, verifique se ele está entre o(s) intervalo(s) valore(s) predefinidos anteriormente no bloco de variáveis`;
  },
};

function getError(errorMsgKey: keyof typeof errors, prop?: string[]) {
  const { error } = ConsoleStore.getState();
  const errorMsg = errors[errorMsgKey](...(prop ?? []));
  error(errorMsg);
  throw new Error(errorMsg);
}

export function runner(code: string) {
  console.log(get);
  const Prompt = ConsoleStore.getState().prompt.execute;

  type Variables = Record<
    string,
    {
      type: string;
      value: string | number | boolean | Array<string | number | boolean>;
      subType?: "vector" | "matriz";
      validIndex?: number[][];
    }
  >;

  const RunnerThis = {
    Logger,
    LoggerNewLine,
    Clear,
    Prompt,
    DivInt,
    XOR,
    variables: {} as Variables,
    checkVector([prop, vectorY, vectorX]: [
      keyof typeof this.variables,
      number,
      number
    ]) {
      if (
        typeof vectorY !== "number" ||
        (typeof vectorX !== "number" && typeof vectorX !== "undefined")
      ) {
        return getError("VectorIndexNumber", [prop]);
      }
      if (!this.checkVar(prop)) {
        return getError("NotDefined", [prop, `${vectorY}`, `${vectorX}`]);
      }

      const variable = this.variables[prop];
      if (!variable.validIndex || !variable.subType) return false;

      if (variable.subType === "vector" && vectorX) {
        return getError("NotMatriz", [prop]);
      }

      if (variable.subType === "matriz" && typeof vectorX === "undefined") {
        return getError("MatrizNeedX", [prop]);
      }

      const [Y, X] = this.getVectorIndex(prop, vectorY, vectorX);

      const validY = typeof Y === "number" && Y > -1;
      const validX = typeof X === "number" && X > -1;

      if (!validY || (variable.subType === "matriz" && !validX)) {
        console.log(validY);
        const errorIn = !validY ? "y" : "x";
        getError("VectorIndexInvalid", [
          prop,
          `${vectorY}`,
          `${vectorX}`,
          errorIn,
        ]);
      }

      if (variable.subType === "vector") return validY;
      return validX;
    },
    checkVar(prop: string) {
      return {}.hasOwnProperty.call(this.variables, prop);
    },
    checkType(prop: string, value: unknown) {
      const variable = this.variables[prop];

      const translateType = (type: string, typeValue?: unknown) => {
        switch (type) {
          case "string":
            return "Caractere";
          case "boolean":
            return "Logico";
          case "float":
            return "Real";
          case "number":
            if (Number.isInteger(typeValue) || !typeValue) return "Inteiro";
            else return "Real";
        }
      };

      const throwTypeError = () => {
        const valueType = translateType(typeof value, value)!;
        const variableType = translateType(variable.type)!;

        return getError("TypeError", [prop, valueType, variableType]);
      };

      if (variable.type === "string" && typeof value !== "string") {
        return throwTypeError();
      }
      if (variable.type === "boolean" && typeof value !== "boolean") {
        return throwTypeError();
      }
      if (variable.type === "float" && typeof value !== "number") {
        return throwTypeError();
      }
      if (variable.type === "number") {
        if (typeof value !== "number" || !Number.isInteger(value)) {
          return throwTypeError();
        }
      }

      return true;
    },
    getVectorIndex(prop: string, vectorY: number, vectorX: number) {
      const Y = this.variables[prop].validIndex?.[0]?.indexOf(vectorY);
      const X = this.variables[prop].validIndex?.[1]?.indexOf(vectorX);
      if (Y == undefined || Y < 0 || (X && X < 0)) {
        const errorIn = Y! < 0 ? "y" : "x";
        getError("VectorIndexInvalid", [
          prop,
          `${vectorY}`,
          `${vectorX}`,
          errorIn,
        ]);
      }

      return [Y, X];
    },
    getVector(
      prop: keyof typeof this.variables,
      vectorY: number,
      vectorX: number
    ) {
      if (this.checkVector([prop, vectorY, vectorX])) {
        const [Y, X] = this.getVectorIndex(prop, vectorY, vectorX);
        return get(this.variables[prop].value as object, [Y!, X!]);
      }

      getError("NotDefined", [prop, `${vectorY}`, `${vectorX}`]);
    },
    getVar(prop: keyof typeof this.variables) {
      if (this.checkVar(prop)) return this.variables[prop].value;
      getError("NotDefined", [prop]);
    },
    getVarType(prop: keyof typeof this.variables) {
      if (this.checkVar(prop)) return this.variables[prop].type;
      getError("NotDefined", [prop]);
    },
    setVector(
      [prop, vectorY, vectorX]: [keyof typeof this.variables, number, number],
      value: unknown
    ) {
      if (!this.checkVector([prop, vectorY, vectorX])) {
        return getError("NotDefined", [prop, `${vectorY}`, `${vectorX}`]);
      }

      if (!this.checkType(prop, value)) return;

      const [Y, X] = this.getVectorIndex(prop, vectorY, vectorX);
      const setPath = ["value", Y!, X!].filter((v) => typeof v !== "undefined");
      set(this.variables[prop], setPath, value);
    },
    setVar(prop: keyof typeof this.variables, value: unknown) {
      if (!this.checkVar(prop)) return getError("NotDefined", [prop]);

      if (!this.checkType(prop, value)) return;

      this.variables[prop].value = value as string | number | boolean;
    },
  };

  const codeRunner = new Function(code);
  codeRunner.call(RunnerThis);
}
