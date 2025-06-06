import Aura from "@primevue/themes/aura";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

{
  const mode = process.env.MODE ?? "development";
  const environmentPath = path.resolve(process.cwd(), `envs/.env.${mode}`);
  const existEnvironment = fs.existsSync(environmentPath);

  if (existEnvironment) {
    dotenv.config({ path: environmentPath });
    console.log(`Loaded environment variables from ${environmentPath}`);
  } else {
    console.warn(`.env 파일이 ${environmentPath}에 존재하지 않습니다.`);
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/icon",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "@primevue/nuxt-module",
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: "primevue",
            order: "tailwind-base, primevue, tailwind-utilities",
          },
        },
      },
    },
  },
  css: ["~/assets/scss/module.scss"],
  ssr: false,
  devServer: {
    host: "0.0.0.0",
  },
});
