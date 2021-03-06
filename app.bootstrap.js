const mount = require('koa-mount');
const static = require('koa-static');
module.exports = async app => {
  app.use(mount('/download', static(app.config.nfs)));
  app.use(async (ctx, next) => {
    ctx.onResponseError(error => {
      ctx.status = 422;
      ctx.body = {
        error: error.message
      }
    });
    await next();
  });
};