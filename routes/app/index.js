const Router = require('koa-router');
const appRouter = new Router();
const meRouter = require('./me');
const threadRouter = require('./thread');
appRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	.use('/me', meRouter.routes(), meRouter.allowedMethods())
	.use('/thread', threadRouter.routes(), threadRouter.allowedMethods());
module.exports = appRouter;