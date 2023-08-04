const router = require('koa-router')();
const {
  questionService,
} = require('../../../../services/exam/question.service');
const { OnlyUser } = require('../../../../middlewares/permission');
router.post('/', OnlyUser(), async (ctx, next) => {
  const { state, body } = ctx;
  const { fields, files } = body;
  const form = JSON.parse(fields.form);
  const imageFile = files && files.image ? files.image : null;
  const { type, volume, tags, hasImage, content, contentDesc, answer } = form;
  await questionService.checkPermissionToCreateQuestions(state.uid);
  await questionService.checkQuestionInfo({
    type,
    volume,
    tags,
    content,
    contentDesc,
    answer,
  });
  const question = await questionService.createQuestion({
    type,
    volume,
    tags,
    content,
    contentDesc,
    answer,
    hasImage,
    uid: state.uid,
  });
  if (imageFile) {
    await question.updateImage(imageFile);
  }
  await next();
});
module.exports = router;
