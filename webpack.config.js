const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const glob = require('glob');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src/views'),
};

module.exports = (env) => {
  return {
    mode: env.mode,
    devtool: env.mode === 'production' ? false : 'source-map',

    output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    resolve: {
      alias: {
        '@scripts': path.join(__dirname, 'src', 'js'),
        '@styles': path.join(__dirname, 'src', 'scss'),
        '@images': path.join(__dirname, 'src', 'assets', 'img'),
        '@fonts': path.join(__dirname, 'src', 'assets', 'fonts'),
      },
    },

    plugins: [
      // copies files into dist folder

      new HtmlBundlerPlugin({
        // path to templates
        entry: [
          {
            import: 'src/views/index.hbs',
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
        // exclude: [
        //     'src/include/header.html', // Adjust this path as per your file structure
        // ],
        preprocessor: 'handlebars',

        exclude: ['src/partials/header.hbs'],
        minify: true,
      }),
      env.mode === 'production' &&
        new PurgeCSSPlugin({
          paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
          content: ['**/*.js', '**/*.html', '**/*.hbs'],
          //   safelist: {
          //     standard: [/aria/, /data/, /:focus/],
          //     deep: [/aria/, /data/, /^.*\[/],
          //     greedy: [/aria/, /data/, /^.*\[/],
          //   },
        }),
    ],
    stats: {
      loggingDebug: ['sass-loader'],
    },
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      'postcss-preset-env',
                      {
                        stage: 3,
                        features: {
                          'nesting-rules': true,
                          clamp: true,
                          'custom-properties': false,
                        },
                      },
                    ],
                    ['postcss-sort-media-queries'],
                  ],
                },
              },
            },
            'sass-loader',
          ],
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

          parser: {
            dataUrlCondition: {
              // inline images < 2 KB
              maxSize: 500,
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
