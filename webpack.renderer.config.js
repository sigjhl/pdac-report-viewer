const rules = require('./webpack.rules');

// Adding the CSS rule
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Adding the JSX/JS rule with Babel loader
rules.push({
  test: /\.jsx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-react']
    }
  },
  exclude: /node_modules/
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'] // Add extensions for JS, JSX, and CSS
  }
};
