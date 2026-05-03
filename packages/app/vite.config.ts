/// <reference types="vitest" />
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
	// GitHub Pages serves this app under /voldle/. Apply the subpath whenever
	// we're producing or serving the production artifact (build + preview);
	// dev stays at "/" so the local server is reachable at the repo root.
	base: command === "build" || isPreview ? "/voldle/" : "/",
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
}));
