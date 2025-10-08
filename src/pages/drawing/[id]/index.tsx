import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import DrawingHeader from "~/components/header/DrawingHeader";
import { DrawingProvider } from "~/components/header/context/DrawingContext";
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
		<DrawingProvider>
			<main className="flex min-h-screen flex-col overflow-hidden bg-white">
				<DrawingHeader title={design?.name} />
				<div
					className="w-full overflow-hidden"
					style={{ height: "calc(100vh - 56px)" }}
				>
					{isLoading ? (
						<div className="flex h-full items-center justify-center text-gray-500 text-sm">
							Loading design…
						</div>
					) : (
						<DrawingCanvas shapes={design?.shapes} />
					)}
				</div>
			</main>
		</DrawingProvider>
	);
}
