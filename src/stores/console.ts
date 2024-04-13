import { create } from "zustand";

interface IConsoleStore {
  logs: Array<{ type: "info" | "error"; value: string }>;
  log: (log: string) => void;
  error: (err: string) => void;
  clear: () => void;

  opened: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConsoleStore = create<IConsoleStore>((set) => ({
  logs: [],
  opened: false,
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
