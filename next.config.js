/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  redirects: async () => {
    const destination = "/casino/games/dice";
    return [
      {
        source: "/",
        destination,
        permanent: true,
      },
      {
        source: "/casino",
        destination,
        permanent: true,
      },
      {
        source: "/casino/games",
        destination,
        permanent: true,
      },
    ];
  },

  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
      },
    };
    return config;
  },

  output: "standalone",
  compress: false, // Offload gzip compression to nginx
};

export default config;
