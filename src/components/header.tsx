import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ConsoleStore } from "@/stores/console";
import { EditorStore } from "@/stores/editor";
import {
  DownloadIcon,
  FileTextIcon,
  HamburgerMenuIcon,
  PlayIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

export function Header() {
  return (
    <div className="h-9 flex justify-between bg-primary">
      <Sheet>
        <SheetTrigger asChild>
          <Button>
            <HamburgerMenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pt-12">
          <div className="gap-4 h-full flex flex-col">
            <Button className="gap-2 w-full">
              <PlusIcon />
              New Project
            </Button>
            <Button className="gap-2 w-full">
              <DownloadIcon />
              Save Project
            </Button>
            <Button className="gap-2 w-full mt-auto">
              <FileTextIcon />
              Documentation
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Button
        onClick={() => {
          const { clear, onOpenChange } = ConsoleStore.getState();
          const { runCode } = EditorStore.getState();

          clear();
          onOpenChange(true);
          runCode();
        }}
      >
        <PlayIcon />
      </Button>
    </div>
  );
}
