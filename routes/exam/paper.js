const Router = require('koa-router');
const { questionService } = require('../../services/exam/question.service');
const paperRouter = new Router();
const { paperService } = require('../../services/exam/paper.service');

paperRouter
  .get('/', async (ctx, next) => {
    const { db, query, nkcModules, state } = ctx;
    let { cid } = query;
    cid = Number(cid);
    const category = await db.ExamsCategoryModel.findOnly({ _id: cid });
    if (category.disabled) {
      ctx.throw(403, '该科目的下的考试已被屏蔽，请刷新');
    }
    const { uid } = state;

    // const timeLimit = 45 * 60 * 1000;
    let questionCount = 0;
    // 该考卷下有未完成的考试
    let paper = await db.ExamsPaperModel.findOne({
      uid: uid,
      cid,
      submitted: false,
      timeOut: false,
    });
    if (paper) {
      return ctx.redirect(`/exam/paper/${paper._id}?created=true`);
    }
    // 限制条件
    const examSettings = await db.SettingModel.findOnly({ _id: 'exam' });
    const { count, countOneDay, waitingTime } = examSettings.c;
    const paperCount = await db.ExamsPaperModel.countDocuments({
      uid,
      toc: { $gte: nkcModules.apiFunction.today() },
    });
    if (paperCount >= countOneDay) {
      ctx.throw(
        403,
        `一天之内只能参加${countOneDay}次考试，今日您的考试次数已用完，请明天再试。`,
      );
    }
    const now = Date.now();
    const generalSettings = await db.UsersGeneralModel.findOne({
      uid,
    });
    let { stageTime } = generalSettings.examSettings;
    // const allPaperCount = await db.ExamsPaperModel.countDocuments({uid: uid, toc: {$gte: waitingTime*24*60*60*1000}});
    const allPaperCount = await db.ExamsPaperModel.countDocuments({
      uid,
      toc: { $gte: stageTime },
    });
    stageTime = new Date(stageTime).getTime();
    if (allPaperCount >= count) {
      if (now > stageTime + waitingTime * 24 * 60 * 60 * 1000) {
        await generalSettings.updateOne({ 'examSettings.stageTime': now });
      } else {
        ctx.throw(
          403,
          `您观看考题数量过多或考试次数达到${count}次，需等待${waitingTime}天后才能再次参加考试，请于${new Date(
            stageTime + waitingTime * 24 * 60 * 60 * 1000,
          ).toLocaleString()}之后再试。`,
        );
      }
    }
    const { passScore, time, from, volume } = category;
    // // 45分钟之内进入相同的考卷
    // paper = await db.ExamsPaperModel.findOne({
    //   uid,
    //   cid,
    //   toc: { $gte: Date.now() - timeLimit },
    // }).sort({ toc: -1 });
    // // if (paper) {
    // //   const record = paper.record.map((r) => {
    // //     return {
    // //       qid: r.qid,
    // //     };
    // //   });
    // //   // 随机交换数组元素位置
    // //   nkcModules.apiFunction.shuffle(record);
    // //   qidArr = record.map((r) => r.qid);
    // // } else {
    // 加载不同考卷的题目
    const condition = {
      volume,
      auth: true,
      disabled: false,
    };
    //检测试题是否满足数量
    await questionService.canTakeQuestionNumbers(from, condition);
    const questions = [];
    const questionsId = [];
    for (const f of from) {
      const { count, tag } = f;
      const conditionQ = {
        ...condition,
        tags: { $in: [tag] },
        _id: { $ne: questionsId },
      };
      const selectedQuestions = await db.QuestionModel.aggregate([
        {
          $match: conditionQ,
        },
        {
          $sample: { size: count }, // 选择指定数量的随机题目
        },
        {
          $project: { _id: 1, type: 1, content: 1, answer: 1 },
        },
      ]);
      selectedQuestions.forEach((item) => {
        const { _id, type, content, answer } = item;
        questions.push({ qid: _id, type, content, answer });
        questionsId.push(item._id);
      });
      questionCount += count;
    }
    if (questions.length < questionCount) {
      ctx.throw(400, '当前科目的题库试题不足，请选择其他科目参加考试。');
    }
    //保证题目的随机性
    nkcModules.apiFunction.shuffle(questions);
    questions.forEach((item) => {
      nkcModules.apiFunction.shuffle(item.answer);
    });
    paper = db.ExamsPaperModel({
      _id: await db.SettingModel.operateSystemID('examsPapers', 1),
      uid,
      cid,
      ip: ctx.address,
      record: questions,
      passScore,
      time,
    });
    await paper.save();
    // 跳转到考试页面
    return ctx.redirect(`/exam/paper/${paper._id}`);
  })
  .get('/:_id', async (ctx, next) => {
    const { db, data, params, query, nkcModules, state } = ctx;
    const { created } = query;
    if (created === 'true') {
      data.created = true;
    }
    const { uid } = state;
    const { _id } = params;
    const paper = await db.ExamsPaperModel.findOnly({ _id, uid });
    if (paper.timeOut) {
      ctx.throw(403, '考试已结束');
    }
    if (paper.submitted) {
      ctx.throw(403, '考试已结束');
    }
    const category = await db.ExamsCategoryModel.findOnly({ _id: paper.cid });
    if (category.disabled) {
      ctx.throw(403, '考试所在的科目已被屏蔽');
    }
    const questions = [];
    const { record } = paper;
    for (const r of record) {
      const { hasImage } = await db.QuestionModel.findOnly({ _id: r.qid });
      const { qid, type, content, answer } = r;
      questions.push({
        qid,
        type,
        content,
        answer,
        hasImage,
      });
    }
    data.questions = questions;
    data.paper = {
      toc: paper.toc,
      category: category,
      _id: paper._id,
    };
    data.category = category;
    data.examSettings = (await db.SettingModel.findOnly({ _id: 'exam' })).c;
    data.countToday = await db.ExamsPaperModel.countDocuments({
      uid: uid,
      toc: { $gte: nkcModules.apiFunction.today() },
    });
    ctx.template = 'exam/paper.pug';
    await next();
  })
  .post('/:_id', async (ctx, next) => {
    const { params, db, data, body, state } = ctx;
    const { user } = data;
    const { uid } = state;
    const { _id } = params;
    const paper = await db.ExamsPaperModel.findOnly({
      _id: Number(_id),
      uid,
    });
    if (paper.timeOut) {
      ctx.throw(403, '考试已结束');
    }
    if (paper.submitted) {
      ctx.throw(403, '考试已结束');
    }
    const time = Date.now();
    const category = await db.ExamsCategoryModel.findOnly({ _id: paper.cid });
    if (category.disabled) {
      ctx.throw(403, `该科目下的考试已被屏蔽`);
    }
    //用户填写的问题
    const { questions } = body;
    //考卷的问题
    const { record } = paper;
    //用户总分
    let score = 0;
    let q = {};
    for (let i = 0; i < record.length; i++) {
      const r = record[i];
      const { selected, _id, fill } = questions[i];
      //判断试卷问题的顺序是否一致
      if (r.qid !== _id) {
        ctx.throw(400, '试卷题目顺序有误，本次考试无效，请重新考试。');
      }
      //选择题
      if (r.type === 'ch4') {
        const correctQ = r.answer.filter((item) => item.correct);
        //判断用户的选项数量是否满足
        if (correctQ.length === selected.length) {
          //筛选出选对了哪些答案
          r.answer.forEach((item, index) => {
            if (selected.includes(index)) {
              item.selected = true;
            }
          });
          const picked = r.answer.filter(
            (item, index) => selected.includes(index) && item.correct,
          );
          //选对了的答案数量要完全一致
          if (picked.length === correctQ.length) {
            r.correct = true;
            score++;
          }
        }
      } else if (r.type === 'ans') {
        //填空题
        r.answer[0].fill = fill;
        if (r.answer[0].text === fill) {
          r.correct = true;
          score++;
        }
      }
    }
    q.record = record;
    q.score = score;
    q.passed = paper.passScore <= q.score;
    q.submitted = true;
    q.tlm = time;

    if (q.passed) {
      const userObj = {};
      userObj[`volume${category.volume}`] = true;
      if (category.volume === 'B') {
        userObj.volumeA = true;
      }
      await db.UserModel.updateOne({ uid }, userObj);
      for (const id of category.rolesId) {
        if (id) {
          await db.UserModel.updateOne({ uid }, { $addToSet: { certs: id } });
        }
      }
    }
    await db.ExamsPaperModel.updateOne({ _id: Number(_id), uid }, q);
    if (q.passed) {
      // 生成注册码
      data.token = await paperService.createActivationCodeByPaperId(_id);
    }
    data.passed = q.passed;
    await next();
  });
module.exports = paperRouter;
