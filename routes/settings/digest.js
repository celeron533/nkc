const router = require('koa-router')();
const { OnlyUnbannedUser } = require('../../middlewares/permission');
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, db } = ctx;
  data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
  data.digestRewardScore = await db.SettingModel.getScoreByOperationType(
    'digestRewardScore',
  );
  await next();
});

module.exports = router;
