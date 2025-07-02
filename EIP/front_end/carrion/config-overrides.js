const { override } = require("customize-cra");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = override((config) => {
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/pdfjs-dist/build/pdf.worker.mjs",
          to: "static/js/",
        },
      ],
    })
  );
  return config;
});
