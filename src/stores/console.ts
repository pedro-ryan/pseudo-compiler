import { create } from "zustand";

interface IConsoleStore {
  logs: Array<{ type: "info" | "error"; value: string }>;
  log: (log: string) => void;
  error: (err: string) => void;
  clear: () => void;

  opened: boolean;
  onOpenChange: (open: boolean) => void;

  prompt: {
    execute: (
      convertType: "string" | "number" | "float" | "boolean"
    ) => Promise<string | number | boolean>;
    respond: (response: string) => void;
    response: string;
    waiting: boolean;
  };
}

const ConsoleStore = create<IConsoleStore>((set) => ({
  logs: [],
  opened: false,
  prompt: {
    execute(convertType) {
      const resetResponse = (waiting = false) => {
        set((state) => {
          return {
            prompt: {
              ...state.prompt,
              response: "",
              waiting,
            },
          };
        });
      };
      resetResponse(true);

      const convertResponse = (response: string) => {
        switch (convertType) {
          case "string":
            return response;
          case "float":
            return parseFloat(response);
          case "number":
            return parseInt(response);
          case "boolean":
            if (response.trim().toLowerCase().startsWith("v")) return true;
            return false;
          default:
            return response;
        }
      };

      return new Promise((resolve) => {
        const unsubscribe = ConsoleStore.subscribe((state, oldState) => {
          if (state.prompt.response !== oldState.prompt.response) {
            const response = convertResponse(state.prompt.response);

            resolve(response);
            resetResponse();
            unsubscribe();
          }
        });
      });
    },
    respond(response) {
      set((state) => ({
        prompt: {
          ...state.prompt,
          response,
        },
      }));
    },
    response: "",
    waiting: false,
  },
  clear() {
    set({ logs: [] });
  },
  log(log) {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          type: "info",
          value: log,
        },
      ],
    }));
  },
  error(err) {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          type: "error",
          value: err,
        },
      ],
    }));
  },
  onOpenChange(opened) {
    set({ opened });
  },
}));

export { ConsoleStore };
