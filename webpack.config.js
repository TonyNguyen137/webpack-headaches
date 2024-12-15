const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = (env) => {
  return {
    devtool: env.WEBPACK_SERVE ? 'source-map' : false,

    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    resolve: {
      alias: {
        '@styles': path.join(__dirname, 'src', 'scss'),
        '@images': path.join(__dirname, 'src', 'img'),
        '@fonts': path.join(__dirname, 'src', 'fonts'),
        '@scripts': path.join(__dirname, 'src', 'js'),
      },
    },

    plugins: [
      new HtmlBundlerPlugin({
        // path to templates
        entry: {
          index: path.join(__dirname, 'src/index.html'), // => dist/index.html
        },
        loaderOptions: {
          sources: [
            {
              tag: 'a',
              attributes: ['href'],
              filter: ({ value }) => {
                return !value.endsWith('.html');
              },
            },
          ],
        },

        js: {
          // output filename for JS
          filename: '[name].[contenthash:8].js',
        },
        css: {
          // output filename for CSS
          filename: '[name].[contenthash:8].css',
        },

        preprocessor: 'handlebars',

        minify: env.WEBPACK_BUILD ?? false,
      }),
    ],

    module: {
      rules: [
        {
          test: /\.(scss)$/,
          use: ['css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|jp?g|webp)$/,
          type: 'asset',
          generator: {
            // save images to file
            filename: (ob) => {
              const params = new URLSearchParams(
                ob.module.resourceResolveData.query
              );

              // Get the value of the 'w' parameter
              const width = params.get('w');
              // console.log('WIDTH: ', width);

              if (width) {
                return `assets/[name]-w${width}[ext]`;
              }
              return `assets/[name][ext]`;
            },
          },

          parser: {
            dataUrlCondition: {
              // inline images < 2 KB
              maxSize: 500,
            },
          },
        },
        {
          test: /\.(ttf|woff2|woff)/,
          type: 'asset',
          generator: {
            // save fonts to file
            filename: 'assets/[name].[ext]',
          },
        },
      ],
    },
  };
};
