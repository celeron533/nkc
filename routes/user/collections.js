const Router = require('koa-router');
const collectionsRouter = new Router();
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;

collectionsRouter
  .get('/:category', async (ctx, next) => {
    const {db, data} = ctx;
    const {category} = ctx.params;
    const user = data;
    const {ThreadModel} = db;
    const targetUserUid = ctx.params.uid;
    let targetUser = {};
    if(user && user.uid === targetUserUid) {
      targetUser = user;
    }else {
      targetUser = await db.UserModel.findOnly({uid: targetUserUid});
    }
    data.forumList = await dbFn.getAvailableForums(ctx);
    data.targetUser = targetUser;
    let categoryNames = await db.CollectionModel.aggregate([
      {$match: {uid: targetUserUid}},
      {$sort: {toc: 1}},
      {$group: {_id: '$category'}},
    ]);
    categoryNames = categoryNames.map(n => {
      return (n._id? n._id: '未分类');
    });
    data.categoryNames = categoryNames;
    let queryDate = {
      uid: targetUserUid,
      category: category
    };
    let collectionCount = await db.CollectionModel.count(queryDate);
    if(collectionCount <= 0) queryDate.category = categoryNames[0];
    // 过滤掉有退回标记的帖子
    let categoryCollection1 = await db.CollectionModel.find(queryDate).sort({toc: -1});
    let categoryCollection = [];
    for(var i in categoryCollection1){
      var b = await ThreadModel.find({tid: categoryCollection1[i].tid,recycleMark: true})
      if(b.length === 0){
        categoryCollection.push(categoryCollection1[i])
      }
    }
    await Promise.all(categoryCollection.map(async c => {
    	await c.extendThread().then(t => t.extendForum()).then(f => f.extendParentForum());
    }));
    data.category = queryDate.category;
    data.categoryCollection = categoryCollection;
    ctx.template = 'interface_collections.pug';
    await next();
  })
  .patch('/:cid', async (ctx, next) => {
    const {db,data} = ctx;
    const {cid, category} = ctx.body;
    const obj = {};
    if(category) obj.category = category;
    const collection = await db.CollectionModel.findOne({cid: cid});
    if(data.user.uid !== collection.uid) ctx.throw(403,'抱歉，你没有资格修改别人的收藏');
    await collection.update(obj);
    await next();
  })
  .del('/:cid', async (ctx, next) => {
    const {db, data} = ctx;
    const {cid} = ctx.params;
    const collection = await db.CollectionModel.findOne({cid: cid});
    if(data.user.uid !== collection.uid) ctx.throw(403,'抱歉，你没有资格删除别人的收藏');
    await collection.remove();
    await next();
  });

module.exports = collectionsRouter;