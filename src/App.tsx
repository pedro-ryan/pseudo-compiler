import { Editor } from "@/components/editor";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

function App() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen">
      <Header />
      <Editor />
      <Footer />
    </div>
  );
}

export default App;
