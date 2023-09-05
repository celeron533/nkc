const { OnlyUser } = require('../../middlewares/permission');
const router = require('koa-router')();
router.get('/', OnlyUser(), async (ctx, next) => {
  const {
    data,
    db,
    params: { mid },
    state: { uid },
  } = ctx;
  const moment = await db.MomentModel.findOnly(
    { _id: mid },
    { visibleType: 1, lock: 1, uid: 1 },
  );
  if (!moment) {
    ctx.throw(400, '未找到动态，请刷新');
  } else if (moment.uid !== uid && !ctx.permission('setMomentVisibleOther')) {
    ctx.throw(400, '权限不足');
  }
  const { visibleType } = moment;
  data.visibleType = visibleType;
  data.success = '成功';
  await next();
});
module.exports = router;
