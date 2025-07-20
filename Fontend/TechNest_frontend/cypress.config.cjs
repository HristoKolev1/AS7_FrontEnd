const { defineConfig } = require( "cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
      // adjust to your frontend port
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: false // Disable support file if not needed
  },
});
