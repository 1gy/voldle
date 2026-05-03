/// <reference types="vitest" />
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	// GitHub Pages serves this app under /voldle/. Keep dev at "/" so the
	// local server stays reachable at the repo root.
	base: command === "build" ? "/voldle/" : "/",
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
	},
}));
