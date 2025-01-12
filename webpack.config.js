const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

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
        {
          test: /\.(woff|woff2|ttf|eot|otf)$/i,
          type: "asset/resource", // Handle font files as resources
          generator: {
            filename: "fonts/[name].[contenthash][ext]", // Output to dist/fonts/
          },
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
            from: "src/static", // Path to the static folder in your src directory
            to: "", // Copy it to the static folder in dist
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
