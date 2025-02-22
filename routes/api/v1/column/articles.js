const router = require('koa-router')();
const permissions = require('../../../../middlewares/permission');
router.post('/', permissions.OnlyUnbannedUser(), async (ctx, next) => {
  //专栏主自己添加文章
  const { body, data, db } = ctx;
  const { threadsId, articlesId, mainCategoriesId, minorCategoriesId } = body;
  const { column, user } = data;
  const userPermissionObject =
    await db.ColumnModel.getUsersPermissionKeyObject();
  const isPermission = await db.ColumnModel.checkUsersPermission(
    column.users,
    user.uid,
    userPermissionObject.column_post_add,
  );
  if (column.uid !== user.uid && !isPermission) ctx.throw(403, '权限不足');
  if (threadsId.length === 0 && articlesId.length === 0)
    ctx.throw(400, '请选择文章');

  if (!mainCategoriesId || mainCategoriesId.length === 0)
    ctx.throw(400, '文章分类不能为空');
  for (const _id of mainCategoriesId.concat(minorCategoriesId)) {
    const c = await db.ColumnPostCategoryModel.findOne({
      _id,
      columnId: column._id,
    });
    if (!c) ctx.throw(400, `ID为${_id}的分类不存在`);
  }
  // const order = await db.ColumnPostModel.getCategoriesOrder(mainCategoriesId);
  const columnPostTypes = await db.ColumnPostModel.getColumnPostTypes();
  const threadColumnPostArr = await db.ThreadModel.aggregate([
    {
      $match: { tid: { $in: threadsId }, uid: user.uid },
    },
    {
      $project: {
        toc: 1,
        oc: 1,
      },
    },
    {
      $lookup: {
        from: 'columnPosts',
        let: { oc_pid: '$oc' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$pid', '$$oc_pid'] },
                  { $eq: ['$columnId', column._id] },
                  { $eq: ['$type', columnPostTypes.thread] },
                ],
              },
            },
          },
        ],
        as: 'content',
      },
    },
  ]);
  const articleColumnPostArr = await db.ArticleModel.aggregate([
    {
      $match: { _id: { $in: articlesId }, uid: user.uid },
    },
    {
      $project: {
        toc: 1,
        _id: 1,
        source: 1,
      },
    },
    {
      $lookup: {
        from: 'columnPosts',
        let: { id_pid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$pid', '$$id_pid'] },
                  { $eq: ['$columnId', column._id] },
                  { $eq: ['$type', columnPostTypes.article] },
                ],
              },
            },
          },
        ],
        as: 'content',
      },
    },
  ]);
  // 已存在的专栏引用，需更新
  const oldColumnPostIds = new Set();
  // 新的，保存
  const newColumnPost = [];
  for (const articleColumnPost of articleColumnPostArr) {
    if (articleColumnPost.content.length > 0) {
      oldColumnPostIds.add(articleColumnPost.content[0]._id);
    } else {
      newColumnPost.push({ ...articleColumnPost, type: 'article' });
    }
  }
  for (const threadColumnPost of threadColumnPostArr) {
    if (threadColumnPost.content.length > 0) {
      oldColumnPostIds.add(threadColumnPost.content[0]._id);
    } else {
      newColumnPost.push({ ...threadColumnPost, type: 'thread' });
    }
  }
  if (oldColumnPostIds.size > 0) {
    for (const _id of oldColumnPostIds) {
      const order = await db.ColumnPostModel.getColumnPostOrder(
        mainCategoriesId,
        minorCategoriesId,
      );
      await db.ColumnPostModel.updateOne(
        {
          _id,
        },
        {
          $set: {
            cid: mainCategoriesId,
            mcid: minorCategoriesId,
            order,
          },
        },
      );
    }
    // await db.ColumnPostModel.updateMany({_id: {$in: [...oldColumnPostIds]}},{
    //   cid: mainCategoriesId,
    //   mcid: minorCategoriesId,
    //   order
    // });
  }
  if (newColumnPost.length > 0) {
    for (const columnPost of newColumnPost) {
      await db
        .ColumnPostModel({
          _id: await db.SettingModel.operateSystemID('columnPosts', 1),
          tid: '',
          from: 'own',
          pid: columnPost.type === 'thread' ? columnPost.oc : columnPost._id,
          columnId: column._id,
          type: columnPost.type,
          order: await db.ColumnPostModel.getColumnPostOrder(
            mainCategoriesId,
            minorCategoriesId,
          ),
          top: columnPost.toc,
          cid: mainCategoriesId,
          mcid: minorCategoriesId,
        })
        .save();
      if (columnPost.type === 'article' && columnPost.source === 'column') {
        // 需要进行更新article中sid
        let sidArray = [];
        const columnPostArray = await db.ColumnPostModel.find({
          pid: columnPost._id,
          type: 'article',
        });
        for (const columnPostItem of columnPostArray) {
          sidArray.push(columnPostItem.columnId);
        }
        sidArray = [...new Set(sidArray)];
        await db.ArticleModel.updateOne(
          { _id: columnPost._id },
          { $set: { sid: sidArray.join('-') } },
        );
      }
    }
  }
  ctx.apiData = {};
  await next();
});
module.exports = router;
