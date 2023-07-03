const Router = require('koa-router');
const router = new Router();
const { ThrowCommonError } = require('../../nkcModules/error');
router.put('/', async (ctx, next) => {
  const { db, params } = ctx;
  const { nid, isShield } = params;
  const { status } = await db.NewNoticesModel.findOnly({ nid }, { status: 1 });
  const noticeStatus = await db.NewNoticesModel.noticeStatus();
  //判断用户是否有权限屏蔽
  if (!ctx.permission('editNoticeContent')) {
    ThrowCommonError(403, '您没有相应的权限，或等级不足');
  }
  //判断通告是否已经屏蔽
  if (status === 'shield' && isShield) {
    ThrowCommonError(403, '该通告已经屏蔽，请不要重复操作');
  } else if (status === 'shield' && !isShield) {
    await db.NewNoticesModel.updateOne(
      { nid },
      { status: noticeStatus.normal },
    );
  } else {
    await db.NewNoticesModel.updateOne(
      { nid },
      { status: noticeStatus.shield },
    );
  }
  await next();
});
module.exports = router;
