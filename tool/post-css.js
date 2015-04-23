var cssnext = require('cssnext')
var postcss = require('postcss')

module.exports = function (ctx, done) {
  var result = postcss()
    .use(cssnext())
    .process(ctx.src, {
      map: { prev: ctx.map } // Preserve source map !
    })

  ctx.src = result.css
  ctx.map = result.map.toJSON()

  done(null, ctx)
}
