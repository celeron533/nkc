const Router = require('koa-router');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { getJsonStringTextSlice } = require('../../nkcModules/json');
const { Public } = require('../../middlewares/permission');
const router = new Router();

router
  .use('/', Public(), async (ctx, next) => {
    const { data, db, internalData } = ctx;

    const serverSettings = await db.SettingModel.getSettings('server');
    const pageTitle = `${serverSettings.websiteName}`;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    data.permissions = {
      isSuperModerator: ctx.permission('superModerator'),
    };
    data.pageTitle = pageTitle;
    internalData.fidOfCanGetThreads = fidOfCanGetThreads;

    await next();
  })
  .use('/', Public(), async (ctx, next) => {
    // 公共数据
    const { query, data } = ctx;
    const communityTypes = {
      thread: 'thread',
      post: 'post',
      digest: 'digest',
    };

    const { t = communityTypes.thread } = query;

    if (!communityTypes[t]) {
      ctx.throw(400, '未知的操作类型');
    }

    data.communityTypes = communityTypes;
    data.t = t;
    data.pageTitle = `最新文章 - 论坛 - ${data.pageTitle}`;
    data.activeTab = data.communityTab.new;
    ctx.template = 'community/new/new.pug';
    await next();
  })
  // 回复
  .get('/', Public(), async (ctx, next) => {
    const { db, internalData, query, data, nkcModules } = ctx;
    if (data.t !== data.communityTypes.post) {
      return await next();
    }
    const { page = 0 } = query;
    const { fidOfCanGetThreads } = internalData;
    const q = {
      type: { $in: ['post', 'thread'] },
      mainForumsId: { $not: { $elemMatch: { $nin: fidOfCanGetThreads } } },
    };
    const pageSettings = await db.SettingModel.getSettings('page');
    const count = await db.PostModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.homeThreadList,
    );
    let posts = await db.PostModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const parentPostsId = [];
    const newPosts = [];
    const quotePostsIdObj = {};
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      if (
        post.reviewed === false ||
        post.disabled === true ||
        post.toDraft === true
      ) {
        continue;
      }
      //全站精选
      const _fidOfCanGetThreads = new Set(fidOfCanGetThreads).size;
      const _mainForumsId = new Set(post.mainForumsId).size;
      const allForumsId = fidOfCanGetThreads.concat(post.mainForumsId);
      const _allForumsId = new Set(allForumsId).size;
      if (_fidOfCanGetThreads + _mainForumsId === _allForumsId) {
        continue;
      }
      //获取用户父级postId的post
      if (post.parentPostId) {
        parentPostsId.push(post.parentPostId);
      }
      //获取引用的回复
      if (post.quote) {
        const [quotePostId] = post.quote.split(':');
        quotePostsIdObj[post.pid] = quotePostId;
        parentPostsId.push(quotePostId);
      }
      newPosts.push(post);
    }
    posts = newPosts;
    posts = await db.PostModel.extendActivityPosts(posts);
    const parentPosts = await db.PostModel.find(
      {
        mainForumsId: {
          $not: { $elemMatch: { $nin: fidOfCanGetThreads } },
        },
        reviewed: true,
        toDraft: { $ne: true },
        disabled: false,
        pid: { $in: parentPostsId },
      },
      {
        pid: 1,
        uid: 1,
        toc: 1,
        c: 1,
        anonymous: 1,
        l: 1,
      },
    );
    const parentPostsObj = {};
    const usersObj = {};

    const usersId = [];
    for (let i = 0; i < parentPosts.length; i++) {
      const { uid, pid, anonymous } = parentPosts[i];
      parentPostsObj[pid] = parentPosts[i];
      if (anonymous) {
        continue;
      }
      usersId.push(uid);
    }
    const users = await db.UserModel.find(
      { uid: { $in: usersId } },
      {
        username: 1,
        uid: 1,
        avatar: 1,
      },
    );
    for (let i = 0; i < users.length; i++) {
      const { uid } = users[i];
      users[i].avatar = nkcModules.tools.getUrl('userAvatar', users[i].avatar);
      usersObj[uid] = users[i];
    }

    let anonymousUser = nkcModules.tools.getAnonymousInfo();
    anonymousUser = {
      uid: null,
      username: anonymousUser.username,
      avatar: anonymousUser.avatarUrl,
    };
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const quotePostId = quotePostsIdObj[post.pid];
      const parentPostId = quotePostId || post.parentPostId;
      let parentPost = null;
      if (parentPostId) {
        const originPost = parentPostsObj[parentPostId];
        if (!originPost) {
          continue;
        }
        let user = usersObj[originPost.uid];
        if (!user) {
          user = anonymousUser;
        }
        parentPost = {
          toc: originPost.toc,
          url: nkcModules.tools.getUrl('post', originPost.pid),
          content:
            originPost.l === 'json'
              ? getJsonStringTextSlice(originPost.c, 200)
              : nkcModules.nkcRender.htmlToPlain(originPost.c, 200),
          user: {
            uid: user.uid,
            avatar: user.avatar,
            username: user.username,
          },
        };
      }
      if (parentPost && parentPost.user.uid) {
        parentPost.user.homeUrl = nkcModules.tools.getUrl(
          'userHome',
          parentPost.user.uid,
        );
      }
      post.parentPost = parentPost;
    }
    data.paging = paging;
    data.posts = posts;
    await next();
  })
  // 文章
  .get('/', Public(), async (ctx, next) => {
    const { db, internalData, query, data, nkcModules } = ctx;
    if (
      ![data.communityTypes.thread, data.communityTypes.digest].includes(data.t)
    ) {
      return await next();
    }
    const { s, page = 0 } = query;
    const { fidOfCanGetThreads } = internalData;
    const { user } = data;
    const q = {
      mainForumsId: {
        $not: { $elemMatch: { $nin: fidOfCanGetThreads } },
      },
    };
    if (data.t === data.communityTypes.digest) {
      q.digest = true;
    }
    let canManageFid = [];
    if (user) {
      canManageFid = await db.ForumModel.canManagerFid(
        data.userRoles,
        data.userGrade,
        data.user,
      );
    }
    if (user) {
      if (!ctx.permission('superModerator')) {
        q.$or = [
          {
            reviewed: true,
          },
          {
            reviewed: false,
            mainForumsId: {
              $in: canManageFid,
            },
          },
        ];
      }
    } else {
      q.reviewed = true;
    }

    const pageSettings = await db.SettingModel.getSettings('page');
    const count = await db.ThreadModel.countDocuments(q);
    let sort = { tlm: -1 };
    if (s === 'toc') {
      sort = { ttoc: -1 };
    }
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.homeThreadList,
    );
    let threads = await db.ThreadModel.find(q, {
      uid: 1,
      tid: 1,
      toc: 1,
      oc: 1,
      lm: 1,
      tlm: 1,
      fid: 1,
      hasCover: 1,
      mainForumsId: 1,
      hits: 1,
      count: 1,
      digest: 1,
      reviewed: 1,
      columnsId: 1,
      categoriesId: 1,
      disabled: 1,
      recycleMark: 1,
      ttoc: 1,
    })
      .skip(paging.start)
      .limit(paging.perpage)
      .sort(sort);

    const superModerator = ctx.permission('superModerator');
    threads = threads.filter((thread) => {
      if (thread.disabled || thread.recycleMark) {
        if (!user) {
          return false;
        }
        if (!superModerator) {
          let isModerator = false;
          const mainForumsId = thread.mainForumsId;
          for (const fid of mainForumsId) {
            if (canManageFid.includes(fid)) {
              isModerator = true;
              break;
            }
          }
          if (!isModerator) {
            return false;
          }
        }
      }
      return true;
    });
    data.s = s;
    data.latestCommunityArticlePanelStyle =
      pageSettings.articlePanelStyle.latestCommunity;
    data.latestCommunityToppedArticlePanelStyle =
      pageSettings.articlePanelStyle.latestCommunityTopped;
    data.paging = paging;
    const latestToppedThreads = await db.ThreadModel.getLatestToppedThreads(
      fidOfCanGetThreads,
    );
    data.articlesPanelData = await db.ThreadModel.extendArticlesPanelData(
      threads,
    );
    data.toppedArticlesData = await db.ThreadModel.extendArticlesPanelData(
      latestToppedThreads,
    );
    ctx.setCookie(
      'recentCommunity',
      {
        path: `/c/new?page=${page}&t=${data.t}&s=${s ? data.s : 'tlm'}`,
      },
      {
        httpOnly: false,
        signed: false,
      },
    );
    // ctx.template = 'community/new/new.pug';
    await next();
  });
module.exports = router;
