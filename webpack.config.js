const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = (env) => {
  console.log(env);

  return {
    devtool: env.WEBPACK_SERVE ? 'source-map' : false,

    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    resolve: {
      alias: {
        '@fonts': path.join(__dirname, 'src', 'fonts'),
        '@images': path.join(__dirname, 'src', 'images'),
      },
    },

    plugins: [
      new HtmlBundlerPlugin({
        // path to templates
        entry: [
          {
            import: 'src/index.html',
            filename: 'index.html',
          },
        ],

        js: {
          // output filename for JS
          filename: '[name].[contenthash:8].js',
        },
        css: {
          // output filename for CSS
          filename: '[name].[contenthash:8].css',
        },

        minify: env.WEBPACK_BUILD ?? false,
      }),
    ],
    stats: {
      loggingDebug: ['sass-loader'],
    },
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
                return `assets/img/[name]-w${width}[ext]`;
              }
              return `assets/img/[name][ext]`;
            },
          },
        },

        {
          test: /\.(ico|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/img/[name].[hash:8][ext][query]',
          },
        },

        {
          test: /\.(ttf|woff2|woff)/,
          type: 'asset',
          generator: {
            // save fonts to file
            filename: 'assets/fonts/[name].[ext]',
          },
        },
      ],
    },
    optimization: {
      // minimize: false,
      minimizer: [
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
          },
          generator: [
            {
              // You can apply generator using `?as=webp`, you can use any name and provide more options
              preset: 'webp',
              implementation: ImageMinimizerPlugin.sharpGenerate,
              options: {
                encodeOptions: {
                  // Please specify only one codec here, multiple codecs will not work
                  webp: {
                    quality: 70,
                  },
                },
              },
            },
            {
              // You can apply generator using `?as=avif`, you can use any name and provide more options
              preset: 'avif',
              implementation: ImageMinimizerPlugin.sharpGenerate,
              options: {
                encodeOptions: {
                  // Please specify only one codec here, multiple codecs will not work
                  avif: {
                    quality: 70,
                  },
                },
              },
            },
          ],
        }),
      ],
    },

    // enable HMR with live reload
    devServer: {
      static: path.resolve(__dirname, 'dist'),
      watchFiles: {
        paths: ['src/**/*.*'],
        options: {
          usePolling: true,
        },
      },
    },
  };
};
