import dynamic from "next/dynamic";
const DimensionedPolygon = dynamic(
  () => import("~/components/DimensionedPolygon"),
  { ssr: false }
);

export default function Drawing() {
	return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="font-extrabold text-5xl text-white tracking-tight sm:text-[5rem]">
          Drawing
        </h1>
        <DimensionedPolygon />
      </div>
    </main>
  );
}