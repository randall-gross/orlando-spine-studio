import { defineMiddleware } from "astro:middleware";

/**
 * Admin path obfuscation middleware.
 *
 * - /studio-ops/*  →  rewrites to /_emdash/*
 * - /_emdash/*     →  404 in production (non-localhost)
 *
 * Uses Astro's reroute to transparently serve the emdash admin
 * at a custom, non-guessable path.
 */

const CUSTOM_PREFIX = "/studio-ops";
const INTERNAL_PREFIX = "/_emdash";

export const onRequest = defineMiddleware(async (context, next) => {
	const path = context.url.pathname;

	// Rewrite custom path → internal emdash path
	if (path.startsWith(CUSTOM_PREFIX)) {
		const rewritten = path.replace(CUSTOM_PREFIX, INTERNAL_PREFIX) + context.url.search;
		return context.rewrite(rewritten);
	}

	// Block direct /_emdash access from non-localhost in production
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

	return next();
});
