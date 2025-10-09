import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import DrawingLoading from "~/components/DrawingLoading";
import DrawingHeader from "~/components/header/DrawingHeader";
import { DrawingProvider } from "~/components/header/context/DrawingContext";
import { ShapeProvider } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";

const DrawingCanvas = dynamic(() => import("~/components/DrawingCanvas"), {
	ssr: false,
});

export default function Drawing() {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;

	const { data: design, isLoading } = api.design.getById.useQuery(
		{ id: designId ?? "" },
		{ enabled: typeof designId === "string" },
	);  

	return (
    <>
      {isLoading ? 
        <DrawingLoading />
        :
        <DrawingProvider>
          <main className="flex min-h-screen flex-col overflow-hidden bg-white">
            
            <ShapeProvider>
            <DrawingHeader title={design?.name} />
              <div
                className="w-full overflow-hidden"
                style={{ height: "calc(100vh - 56px)" }}
              >
                <DrawingCanvas shapes={design?.shapes} />
              </div>
            </ShapeProvider>
          </main>
        </DrawingProvider>
      }
    </>
	);
}
