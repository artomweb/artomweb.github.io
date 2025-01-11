const path = require("path");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/app.js",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "bundle.js" : "bundle.js",
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      port: 3000,
      open: true,
      hot: true,
      compress: false,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          include: path.resolve(__dirname, "src"),
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    "cssnano", // Minify CSS in production
                  ],
                },
              },
            },
          ],
        },
        // Add a rule for fonts
        {
          test: /\.(woff2|woff|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][hash][ext][query]",
          },
        },
      ],
    },
    optimization: {
      minimize: isProduction, // Minify in production mode
    },
    devtool: isProduction ? "source-map" : "eval-source-map", // Different source maps for dev and prod
  };
};
