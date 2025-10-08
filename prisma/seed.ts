import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log("Starting seed...");

	// Create services, materials, and products
	const service = await prisma.service.create({
		data: {
			name: "Standard Countertop Service",
		},
	});

	const material = await prisma.material.create({
		data: {
			name: "Granite - Black Galaxy",
		},
	});

	const product = await prisma.product.create({
		data: {
			name: "Undermount Sink - Model X",
		},
	});

	// Create a sample design with a rectangular shape
	const quote = await prisma.design.create({
		data: {
			name: "Kitchen Countertop - Sample Project",
		},
	});

	// Create the shape
	const shape1 = await prisma.shape.create({
		data: {
			designId: quote.id,
			xPos: 100,
			yPos: 100,
			rotation: 0,
		},
	});

	// Create points for the rectangular shape
	const point1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape1.id },
	});
	const point2 = await prisma.point.create({
		data: { xPos: 96, yPos: 0, shapeId: shape1.id },
	});
	const point3 = await prisma.point.create({
		data: { xPos: 96, yPos: 25, shapeId: shape1.id },
	});
	const point4 = await prisma.point.create({
		data: { xPos: 0, yPos: 25, shapeId: shape1.id },
	});

	// Create edges
	const edge1 = await prisma.edge.create({
		data: {
			shapeId: shape1.id,
			point1Id: point1.id,
			point2Id: point2.id,
		},
	});

	await prisma.edgeShape.create({
		data: {
			edgeId: edge1.id,
			depth: 1.5,
			width: 3,
			type: "Center",
			edges: JSON.stringify([]),
			distance: 96,
			sideAngleLeft: 90,
			sideAngleRight: 90,
		},
	});

	// Create corners
	await prisma.corner.create({
		data: {
			shapeId: shape1.id,
			pointId: point1.id,
			cornerModification: "none",
			type: "None",
			radius: 0,
		},
	});

	// Create cutout with config
	const cutoutConfig1 = await prisma.cutoutConfig.create({
		data: {
			sinkType: "Undermount",
			shape: "Rectangle",
			length: 30,
			width: 18,
			holeCount: 1,
			productId: product.id,
			serviceId: service.id,
		},
	});

	await prisma.cutout.create({
		data: {
			shapeId: shape1.id,
			posX: 48,
			posY: 12.5,
			configId: cutoutConfig1.id,
		},
	});

	console.log("Created design:", quote.name);

	// Add a second, more complex notched shape to the same design
	const shape1b = await prisma.shape.create({
		data: {
			designId: quote.id,
			xPos: 250,
			yPos: 80,
			rotation: 0,
		},
	});

	// Notched polygon: ├┐ like shape
	const s1b_p1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape1b.id },
	});
	const s1b_p2 = await prisma.point.create({
		data: { xPos: 80, yPos: 0, shapeId: shape1b.id },
	});
	const s1b_p3 = await prisma.point.create({
		data: { xPos: 80, yPos: 20, shapeId: shape1b.id },
	});
	const s1b_p4 = await prisma.point.create({
		data: { xPos: 60, yPos: 20, shapeId: shape1b.id },
	});
	const s1b_p5 = await prisma.point.create({
		data: { xPos: 60, yPos: 40, shapeId: shape1b.id },
	});
	const s1b_p6 = await prisma.point.create({
		data: { xPos: 30, yPos: 40, shapeId: shape1b.id },
	});
	const s1b_p7 = await prisma.point.create({
		data: { xPos: 30, yPos: 20, shapeId: shape1b.id },
	});
	const s1b_p8 = await prisma.point.create({
		data: { xPos: 0, yPos: 20, shapeId: shape1b.id },
	});

	// Decorative eased edge on the top run
	const s1b_edgeTop = await prisma.edge.create({
		data: { shapeId: shape1b.id, point1Id: s1b_p1.id, point2Id: s1b_p2.id },
	});
	await prisma.edgeShape.create({
		data: {
			edgeId: s1b_edgeTop.id,
			depth: 1,
			width: 2,
			type: "Center",
			edges: JSON.stringify(["BumpOut"]),
			distance: 80,
			sideAngleLeft: 90,
			sideAngleRight: 90,
		},
	});

	// Add a faucet cutout on the notched shape
	const s1b_cutoutCfg = await prisma.cutoutConfig.create({
		data: {
			sinkType: "Undermount",
			shape: "Rectangle",
			length: 1.5,
			width: 1.5,
			holeCount: 1,
			productId: product.id,
			serviceId: service.id,
		},
	});
	await prisma.cutout.create({
		data: {
			shapeId: shape1b.id,
			posX: 10,
			posY: 5,
			configId: s1b_cutoutCfg.id,
		},
	});

	// Create an L-shaped countertop design
	const lShapeQuote = await prisma.design.create({
		data: {
			name: "L-Shaped Kitchen Countertop",
		},
	});

	const shape2 = await prisma.shape.create({
		data: {
			designId: lShapeQuote.id,
			xPos: 50,
			yPos: 50,
			rotation: 0,
		},
	});

	// Create L-shape points
	const lp1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape2.id },
	});
	const lp2 = await prisma.point.create({
		data: { xPos: 72, yPos: 0, shapeId: shape2.id },
	});
	const lp3 = await prisma.point.create({
		data: { xPos: 72, yPos: 25, shapeId: shape2.id },
	});
	const lp4 = await prisma.point.create({
		data: { xPos: 25, yPos: 25, shapeId: shape2.id },
	});
	const lp5 = await prisma.point.create({
		data: { xPos: 25, yPos: 60, shapeId: shape2.id },
	});
	const lp6 = await prisma.point.create({
		data: { xPos: 0, yPos: 60, shapeId: shape2.id },
	});

	// Create corner with radius at the inside corner
	await prisma.corner.create({
		data: {
			shapeId: shape2.id,
			pointId: lp4.id,
			cornerModification: "radius",
			type: "None",
			radius: 0.5,
		},
	});

	console.log("Created L-shaped design:", lShapeQuote.name);

	// Add a second rectangular shape to the L-shaped design (e.g., backsplash piece)
	const shape2b = await prisma.shape.create({
		data: {
			designId: lShapeQuote.id,
			xPos: 10,
			yPos: 70,
			rotation: 0,
		},
	});
	const s2b_p1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape2b.id },
	});
	const s2b_p2 = await prisma.point.create({
		data: { xPos: 72, yPos: 0, shapeId: shape2b.id },
	});
	const s2b_p3 = await prisma.point.create({
		data: { xPos: 72, yPos: 4, shapeId: shape2b.id },
	});
	const s2b_p4 = await prisma.point.create({
		data: { xPos: 0, yPos: 4, shapeId: shape2b.id },
	});

	// Add a simple eased front edge for the backsplash
	const s2b_edge = await prisma.edge.create({
		data: { shapeId: shape2b.id, point1Id: s2b_p1.id, point2Id: s2b_p2.id },
	});
	await prisma.edgeShape.create({
		data: {
			edgeId: s2b_edge.id,
			depth: 0.5,
			width: 1,
			type: "Center",
			edges: JSON.stringify([]),
			distance: 72,
			sideAngleLeft: 90,
			sideAngleRight: 90,
		},
	});

	// Create a design with waterfall edge
	const waterfallQuote = await prisma.design.create({
		data: {
			name: "Island with Waterfall Edge",
		},
	});

	const shape3 = await prisma.shape.create({
		data: {
			designId: waterfallQuote.id,
			xPos: 200,
			yPos: 150,
			rotation: 0,
		},
	});

	// Create island points
	const ip1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape3.id },
	});
	const ip2 = await prisma.point.create({
		data: { xPos: 48, yPos: 0, shapeId: shape3.id },
	});
	const ip3 = await prisma.point.create({
		data: { xPos: 48, yPos: 36, shapeId: shape3.id },
	});
	const ip4 = await prisma.point.create({
		data: { xPos: 0, yPos: 36, shapeId: shape3.id },
	});

	// Create edge with waterfall
	const waterfallEdge = await prisma.edge.create({
		data: {
			shapeId: shape3.id,
			point1Id: ip2.id,
			point2Id: ip3.id,
		},
	});

	await prisma.waterfallConfig.create({
		data: {
			serviceId: service.id,
			materialId: material.id,
			height: 36,
			edgeId: waterfallEdge.id,
		},
	});

	console.log("Created waterfall design:", waterfallQuote.name);

	// Add a second small support slab on the island design
	const shape3b = await prisma.shape.create({
		data: {
			designId: waterfallQuote.id,
			xPos: 210,
			yPos: 200,
			rotation: 0,
		},
	});
	const s3b_p1 = await prisma.point.create({
		data: { xPos: 0, yPos: 0, shapeId: shape3b.id },
	});
	const s3b_p2 = await prisma.point.create({
		data: { xPos: 20, yPos: 0, shapeId: shape3b.id },
	});
	const s3b_p3 = await prisma.point.create({
		data: { xPos: 20, yPos: 12, shapeId: shape3b.id },
	});
	const s3b_p4 = await prisma.point.create({
		data: { xPos: 0, yPos: 12, shapeId: shape3b.id },
	});

	const supportEdge = await prisma.edge.create({
		data: { shapeId: shape3b.id, point1Id: s3b_p2.id, point2Id: s3b_p3.id },
	});
	await prisma.waterfallConfig.create({
		data: {
			serviceId: service.id,
			materialId: material.id,
			height: 12,
			edgeId: supportEdge.id,
		},
	});
	console.log("Seed completed successfully!");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
