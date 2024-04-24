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
  NotDefined: (prop?: string) =>
    `A variável "${prop}", não foi encontrada, verifique se você a declarou no bloco de variáveis`,
  TypeError: (prop?: string, valueType?: string, propType?: string) =>
    `O valor do tipo "${valueType}" não pode ser atribuindo em uma variável do tipo "${propType}", e neste caso a variável "${prop}" é do tipo "${propType}"`,
};

function getError(errorMsgKey: keyof typeof errors, prop?: string[]) {
  const { error } = ConsoleStore.getState();
  const errorMsg = errors[errorMsgKey](...(prop ?? []));
  error(errorMsg);
  throw new Error(errorMsg);
}

export function runner(code: string) {
  const Prompt = ConsoleStore.getState().prompt.execute;

  type Variables = Record<
    string,
    { type: string; value: string | number | boolean }
  >;

  const RunnerThis = {
    Logger,
    LoggerNewLine,
    Clear,
    Prompt,
    DivInt,
    XOR,
    variables: {} as Variables,
    checkVar(prop: string) {
      return {}.hasOwnProperty.call(this.variables, prop);
    },
    getVar(prop: keyof typeof this.variables) {
      if (this.checkVar(prop)) return this.variables[prop].value;
      getError("NotDefined", [prop]);
    },
    getVarType(prop: keyof typeof this.variables) {
      if (this.checkVar(prop)) return this.variables[prop].type;
      getError("NotDefined", [prop]);
    },
    setVar(prop: keyof typeof this.variables, value: unknown) {
      if (!this.checkVar(prop)) return getError("NotDefined", [prop]);
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
            if (Number.isInteger(typeValue)) return "Inteiro";
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

      this.variables[prop].value = value as string | number | boolean;
    },
  };

  const codeRunner = new Function(code);
  codeRunner.call(RunnerThis);
}
