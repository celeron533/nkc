const Router = require('koa-router');
const singleRouter = require('./singleRole');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const roleRouter = new Router();
roleRouter
  .use('/',OnlyOperation(Operations.visitRoleSettings),  async (ctx, next) => {
    const { data, db } = ctx;
    data.roles = await db.RoleModel.find().sort({ toc: 1 });
    await next();
  })
  .get('/',OnlyOperation(Operations.visitRoleSettings), async (ctx, next) => {
    const { data, db } = ctx;
    const { roles } = data;
    data.roles = await Promise.all(
      roles.map(async (r) => {
        const role = r.toObject();
        let q;
        if (role._id === 'default') {
          q = {};
        } else if (role._id === 'scholar') {
          q = {
            xsf: { $gte: 1 },
          };
        } else {
          q = {
            certs: role._id,
          };
        }
        role.userCount = await db.UserModel.countDocuments(q);
        return role;
      }),
    );
    ctx.template = 'experimental/settings/role/roles.pug';
    await next();
  })
  .post('/', OnlyOperation(Operations.addRole), async (ctx, next) => {
    const { tools, db, body, redis } = ctx;
    const { contentLength } = tools.checkString;
    const { _id, displayName, description, auto } = body.role;
    if (!_id) {
      ctx.throw(400, '证书ID不能为空');
    }
    if (contentLength(_id) > 10) {
      ctx.throw(400, '证书ID不能大于20字节');
    }
    const sameIdRole = await db.RoleModel.findOne({ _id });
    if (sameIdRole) {
      ctx.throw(400, '证书ID已存在');
    }
    const reg = /^[a-z]+$/;
    if (!reg.test(_id)) {
      ctx.throw(400, '证书ID只能由英文大小写字母组成');
    }
    if (!displayName) {
      ctx.throw(400, '证书名称不能为空');
    }
    if (contentLength(displayName) > 10) {
      ctx.throw(400, '证书名称不能大于20字节');
    }
    const sameNameRole = await db.RoleModel.findOne({ displayName });
    if (sameNameRole) {
      ctx.throw(400, '证书名称已存在');
    }
    if (!description) {
      ctx.throw(400, '证书简介不能为空');
    }
    if (contentLength(description) > 100) {
      ctx.throw(400, '证书简介不能大于200字节');
    }
    const role = db.RoleModel({
      _id,
      displayName,
      description,
      auto: !!auto,
    });
    await role.save();
    await db.RoleModel.saveRolesToRedis();
    await redis.cacheForums();
    await next();
  })
  .use('/:_id', singleRouter.routes(), singleRouter.allowedMethods());
module.exports = roleRouter;
