
export default {
  input: "./src/index.js",
  output: [
    {
      format: 'cjs',
      file: "lib/mini-vue.cjs.js"
    },
    {
      format: 'es',
      file: "lib/mini-vue.es.js"
    }
  ]
}