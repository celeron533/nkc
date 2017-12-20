const Router = require('koa-router');
const operationRouter = require('./operation');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const settings = require('../../settings');
const {perpage} = settings.paging;
const postRouter = new Router();

postRouter
  .get('/:pid', async (ctx, next) => {
    const {data, db} = ctx;
    const {pid} = ctx.params;
    const post = await db.PostModel.findOnly({pid});
    if(!await post.ensurePermission(ctx)) ctx.throw(401, '权限不足');
    await post.extendUser();
    await post.extendResources();
    data.post = post;
    ctx.template = 'interface_page.pug';
    await next();
  })
  .patch('/:pid', async (ctx, next) => {
    const {t, c} = ctx.body.post;
    if(c.lenght < 6) ctx.throw(400, '内容太短，至少6个字节');
    const {pid} = ctx.params;
    const {data, db} = ctx;
    const {user} = data;
    if(!c) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    if(targetThread.oc === pid && !t) ctx.throw(400, '标题不能为空!');
    const targetUser = await targetPost.extendUser();
    if(user.uid !== targetPost.uid && !await targetThread.ensurePermissionOfModerators(ctx))
      ctx.throw(401, '您没有权限修改别人的回复');
    const objOfPost = Object.assign(targetPost, {}).toObject();
    objOfPost._id = undefined;
    const histories = new db.HistoriesModel(objOfPost);
    await histories.save();
    const {atUsers, quote, r} = await dbFn.getArrayForAtResourceAndQuote(c);
    const oldAtUsers = targetPost.atUsers;
    atUsers.map(async atUser => {
      let flag = false;
      for (let oldAtUser of oldAtUsers) {
        if(atUser.uid === oldAtUser.uid) {
          flag = true;
          break;
        }
      }
      if(!flag) {
        const at = new db.InviteModel({
          pid,
          invitee: atUser.uid,
          inviter: user.uid
        });
        await at.save();
        const userPersonal = await db.UsersPersonalModel.findOnly({uid: atUser.uid});
        await userPersonal.increasePsnl('at', 1);
      }
    });
    let rpid = '';
    if(quote && quote[2]) {
      rpid = quote[2];
      const username = quote[1];
      if(rpid !== targetPost.pid) {
        const quoteUser = await db.UserModel.find({username: username});
        const quoteUserPersonal = await db.UsersPersonalModel.findOnly({uid: quoteUser.uid});
        const newReplies = new db.RepliesModel({
          fromPid: pid,
          toPid: rpid,
          toUid: quoteUser.uid
        });
        await newReplies.save();
        await quoteUserPersonal.increasePsnl('replies', 1);
      }
    }
    const obj = {
      uidlm: user.uid,
      iplm: ctx.request.socket._peername.address,
      t: t,
      c: c,
      tlm: Date.now(),
      atUsers,
      r,
      rpid
    };
    const q = {
      tid: targetThread.tid
    };
    await targetPost.update(obj);
    if(!await targetThread.ensurePermissionOfModerators(ctx)) q.disabled = false;
    let {page} = await targetThread.getStep({pid, disabled: q.disabled});
    let postId = `#${pid}`;
    page = `?page=${page}`;
    data.redirect = `/t/${targetThread.tid + page + postId}`;
    data.targetUser = targetUser;
    await targetUser.updateUserMessage();
    await next();
  })
  .use('/:pid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = postRouter;