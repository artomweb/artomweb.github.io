const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/app.js", // Entry point of your app

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js", // Add content hash for production builds
    },

    devServer: {
      static: {
        directory: path.resolve(__dirname, "src"),
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
                    isProduction && "cssnano", // Minify CSS in production only
                  ].filter(Boolean),
                },
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/*.html",
            to: "[name][ext]",
          },
          {
            from: "src/standingCats",
            to: "standingCats/",
          },
          {
            from: "src/images",
            to: "images/",
          },
          {
            from: "src/fonts",
            to: "fonts/",
          },
        ],
      }),
      // new BundleAnalyzerPlugin(),
    ],

    optimization: {
      // splitChunks: { chunks: "all" },
      minimize: isProduction, // Minify in production mode
      minimizer: [new TerserPlugin()],
      usedExports: true,
    },

    devtool: isProduction ? false : "eval-source-map", // Different source maps for dev and prod
  };
};
