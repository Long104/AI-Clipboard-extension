import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAi from "openai";
import Stripe from "stripe";
import { env } from "hono/adapter";
// import { getPrisma } from "@/lib/prismaFunction";
import prismaClients from "@/lib/prismaClient";
import { v4 as uuidv4 } from "uuid";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
	"/*",
	cors({
		origin: "*",
		allowHeaders: [
			"Content-Type",
			"X-Custom-Header",
			"Updrade-Insecure-Requests",
		],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
		maxAge: 600,
		credentials: true,
	}),
);

app.post("chatToDocument", async (c) => {
	const openai = new OpenAi({ apiKey: c.env.OPEN_AI_KEY });
	const { documentData, question } = await c.req.json();
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant to the user document i am providing json file  of the markdown  for the document. Using this, answer the user question in the clearest way possible, the document is about" +
					documentData,
			},
			{
				role: "user",
				content: "My question is " + question,
			},
		],
		model: "gpt-4o",
		temperature: 0.5,
	});

	const response = chatCompletion.choices[0].message.content;
	return c.json({ message: response });
});

app.post("/translateDocument", async (c) => {
	const { documentData, targetLanguage } = await c.req.json();

	const summaryResponse = await c.env.AI.run("@cf/facebook/bart-large-cnn", {
		input_text: documentData,
		max_length: 1000,
	});
	const response = await c.env.AI.run("@cf/meta/m2m100-1.2b", {
		text: summaryResponse.summary,
		source_lang: "english",
		target_lang: targetLanguage,
	});

	return new Response(JSON.stringify(response));
});

app.get("/hello", async (c) => {
	return c.json({ message: "hello" });
});

app.post("/summarizeDocument", async (c) => {
	const { documentData } = await c.req.json();
	const messages: any[] = [
		{
			role: "system",
			content:
				"you are an senior developer and you are helping the user to answer their problem.",
		},
		{
			role: "user",
			content:
				"answer this based on the question. If question that is includes multiple-choice options (e.g., A, B, C, D or 1,2,3,4 or if it has set of choice answer), analyze the options and select the best possible answer without explanation just only the choice, but if input has no choice and it have keyword  but only question such as explain..., describe... please explain the answer" +
				documentData,
		},
	];
	const response = await c.env.AI.run(
		"@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any,
		{
			messages,
		},
	);

	return c.json({ message: response });
});

app.post("/checkout", async (c) => {
	const { STRIPE_SECRET_API_KEY } = c.env;
	if (!STRIPE_SECRET_API_KEY) {
		throw new Error("STRIPE_SECRET_API_KEY is not defined in the environment");
	}
	const stripe = new Stripe(STRIPE_SECRET_API_KEY);
	const { product, user } = await c.req.json();
	try {
		const orderId = uuidv4();
		const prisma = await prismaClients.fetch(c.env.DB);
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "thb",
						product_data: {
							name: product.name,
						},
						unit_amount: product.price * 100,
					},
					quantity: product.quantity,
				},
			],
			mode: "payment",
			success_url: `http://localhost:3000/success?id=${orderId}`,
			cancel_url: `http://localhost:3000/cancel?id=${orderId}`,
		});

		console.log("session", session);

		const data = {
			fullName: user.name,
			address: user.address,
			orderId: orderId,
			status: session.status ?? "",
			sessionId: session.id,
		};

		const result = await prisma.orders.create({
			data: data,
		});

		return c.json({
			message: "Checkout success.",
			id: session.id,
			result,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		new Response("Error payment", { status: 400 });
	}
});
app.post("/webhook", async (c) => {
	const { STRIPE_SECRET_API_KEY, STRIPE_WEBHOOK_SECRET } = env(c);
	// const { STRIPE_SECRET_API_KEY, STRIPE_WEBHOOK_SECRET } = context.env;
	const stripe = new Stripe(STRIPE_SECRET_API_KEY);
	const signature = c.req.header("stripe-signature");
	try {
		if (!signature) {
			return c.text("", 400);
		}
		const body = await c.req.text();
		const event = await stripe.webhooks.constructEventAsync(
			body,
			signature,
			STRIPE_WEBHOOK_SECRET,
		);
		switch (event.type) {
			case "payment_intent.created": {
				console.log(event.data.object);
				break;
			}
			default:
				break;
		}
		return c.text("", 200);
	} catch (err) {
		const errorMessage = `!  Webhook signature verification failed. ${
			err instanceof Error ? err.message : "Internal server error"
		}`;
		console.log(errorMessage);
		return c.text(errorMessage, 400);
	}
});
app.get("/order/:id", async (c) => {
	const orderId = c.req.param("id");
	const prisma = await prismaClients.fetch(c.env.DB);
	try {
		const result = prisma.orders.findFirst({
			where: {
				orderId: orderId,
			},
		});
		const selectedOrder = result;
		if (!selectedOrder) {
			throw {
				errorMessage: "Order not found",
			};
		}
		c.json(selectedOrder);
	} catch (error) {
		console.log("error", error);
		c.json({ error: error || "System error" }, 404);
	}
});

export default app;
