const CracoAntDesignPlugin = require("craco-antd");

module.exports = {
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          "@primary-color": "#B14592",
          "@border-radius-base": "6px",
          "@font-size-base": "16px"
        },
      },
    },
  ],
};