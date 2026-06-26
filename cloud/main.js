// Cloud Code — main.js
// Runs on Parse Server (7.5.2, Node context). Full stdlib available.
// Define the app's triggers, functions, and jobs here. The LLM edits this
// file freely as part of building the app.

Parse.Cloud.define('hello', async () => {
  return { message: 'Hello from Cloud Code!' };
});
