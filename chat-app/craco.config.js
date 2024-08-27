module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.module.rules.push({
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: [
            /node_modules\/react-audio-play/,
            /node_modules\/src\/components\/AudioPlayer\.tsx/,
            /node_modules\/src\/helpers\/icons\/icons\.ts/,
            /node_modules\/src\/helpers\/utils\/formatTime\.ts/,
            /node_modules\/src\/helpers\/utils\/getDeviceEventNames\.ts/,
            /node_modules\/src\/helpers\/utils\/getRangeBox\.ts/,
          ],
        });
        return webpackConfig;
      },
    },
  };
  