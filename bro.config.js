const pkg = require("./package");

module.exports = {
  apiPath: "stubs/api",
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`,
    },
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    "TravelForge.main": "/TravelForge",
    "TravelForge.results": "/TravelForge/results"
  },
  features: {
    "travelforge": {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    "travelforge.api": "/api",
  },
  // Укажите путь к кастомному HTML-шаблону для prom-режима или оставьте undefined
  htmlTemplatePath: undefined,
};
