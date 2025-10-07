import dynamic from "next/dynamic";
import { DrawingProvider } from "~/components/header/context/DrawingContext";
import DrawingHeader from "~/components/header/DrawingHeader";
const DrawingCanvas = dynamic(
  () => import("~/components/DrawingCanvas"),
  { ssr: false }
);

export default function Drawing() {
	return (
    <DrawingProvider>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] overflow-hidden">
        <DrawingHeader />
        <div className="w-full overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
          <DrawingCanvas />
        </div>
      </main>
    </DrawingProvider>
  );
}