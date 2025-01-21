const Router = require('koa-router');
const router = new Router();
const OffsiteLinkModel = require('../../dataModels/OffsiteLinkModel');
const SettingModel = require('../../dataModels/SettingModel');
const { Public } = require('../../middlewares/permission');
router
  .get('/', Public(), async (ctx, next) => {
    const { data, header } = ctx;
    const { t = '' } = ctx.query;
    const { user } = data;
    const url = Buffer.from(t, 'base64').toString();
    if (!url) {
      ctx.throw(400, '目标链接不能为空');
    }
    const doc = await OffsiteLinkModel.create({
      target: url,
      referer: header.referer,
      uid: user ? user.uid : null,
      port: ctx.port,
      ip: ctx.address,
    });
    const threadSettings = await SettingModel.getSettings('thread');
    const serverSettings = await SettingModel.getSettings('server');
    data.id = doc._id;
    data.target = t;
    data.confirm = threadSettings.offsiteLink.confirm;
    data.siteName = serverSettings.websiteAbbr;
    ctx.template = 'link/link.pug';
    return next();
  })
  // 用户确认继续访问站外链接前，上报状态，或者下发访问控制
  .post('/report', Public(), async (ctx, next) => {
    const { body } = ctx;
    const { user } = ctx.data;
    const { accept, id } = body;
    await OffsiteLinkModel.updateOne(
      { uid: user ? user.uid : null, _id: id },
      {
        $set: {
          accessAt: Date.now(),
          isComplete: accept,
          port: ctx.port,
          ip: ctx.address,
        },
      },
    );
    return next();
  });

module.exports = router;
