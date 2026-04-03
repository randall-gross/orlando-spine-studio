import { defineMiddleware } from "astro:middleware";

/**
 * Admin path obfuscation middleware.
 *
 * - /studio-ops/*  →  rewrites to /_emdash/*
 * - ALL responses  →  rewrite /_emdash in Location headers to /studio-ops
 * - /_emdash/*     →  404 in production for non-localhost
 */

const CUSTOM_PREFIX = "/studio-ops";
const INTERNAL_PREFIX = "/_emdash";

function patchLocationHeader(response: Response): Response {
	const location = response.headers.get("location");
	if (!location || !location.includes(INTERNAL_PREFIX)) return response;

	const headers = new Headers(response.headers);
	headers.set("location", location.replaceAll(INTERNAL_PREFIX, CUSTOM_PREFIX));
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export const onRequest = defineMiddleware(async (context, next) => {
	const path = context.url.pathname;

	// Rewrite custom path → internal emdash path
	if (path.startsWith(CUSTOM_PREFIX)) {
		const rewritten = path.replace(CUSTOM_PREFIX, INTERNAL_PREFIX) + context.url.search;
		return patchLocationHeader(await context.rewrite(rewritten));
	}

	// Block direct /_emdash access in production from non-localhost
	if (path.startsWith(INTERNAL_PREFIX) && import.meta.env.PROD) {
		const host = context.request.headers.get("host") || "";
		const isLocal =
			host.startsWith("localhost") ||
			host.startsWith("127.0.0.1") ||
			host.startsWith("[::1]");

		if (!isLocal) {
			return new Response(null, { status: 404 });
		}
	}

	// For ALL responses (including public pages that emdash might redirect
	// to /_emdash/admin/setup), patch the Location header
	const response = await next();
	return patchLocationHeader(response);
});
