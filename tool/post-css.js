var cssnext = require('cssnext')
var postcss = require('postcss')

module.exports = function (ctx, done) {
  postcss()
    .use(cssnext())
    .process(ctx.src, {
      from: 'css/styles.css',
      map: { inline: false }
    })
    .then(function (result) {
      ctx.src = result.css
      ctx.map = result.map
      done(null, ctx)
    })
    .catch(done)
}
