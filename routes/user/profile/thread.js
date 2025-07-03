module.exports = async (ctx, next) => {
  const {db, data, state, query, params, nkcModules} = ctx;
  const {user, targetUser} = data;
  const {page = 0} = query;
  const {pageSettings} = state;
  const source = await db.ReviewModel.getDocumentSources();
  // 获取用户能够访问的专业ID
  const accessibleFid = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
  let canManageFid = [];
  if(data.user) {
    canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
  }
  const superModerator = ctx.permission("superModerator");
  //获取用户的文章
  const q = {
    uid: targetUser.uid,
    // mainForumsId: {
    //   $in: accessibleFid
    // }
    mainForumsId: { $not: { $elemMatch: { $nin: accessibleFid } } },
  };
  if(user) {
    // 不具有特殊专家权限的用户
    if(!ctx.permission("superModerator")) {
      // 获取用户能够管理的专业ID
      // 三种情况：
      // 1. 已审核
      // 2. 未审核，且是自己的发表的内容
      // 3. 未审核，且是自己有权限管理的专业里的内容
      q.$or = [
        {
          reviewed: true
        },
        {
          reviewed: false,
          uid: user.uid
        },
        {
          reviewed: false,
          mainForumsId: {
            $in: canManageFid
          }
        }
      ]
    }
  } else {
    q.reviewed = true;
  }
  const count = await db.ThreadModel.countDocuments(q);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  let threads = await db.ThreadModel.find(q, {
    tid: 1,
    hasCover: 1,
    uid: 1,
    oc: 1,
    toc: 1,
    reviewed: 1,
    disabled: 1,
    recycleMark: 1,
    mainForumsId: 1
  }).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  threads = await db.ThreadModel.extendThreads(threads, {
    forum: false,
    firstPost: true,
    firstPostUser: false,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: true,
    htmlToText: true,
    reviewReason: true,
  });
  const haveReviewPermission = ctx.permission('review');
  const results = [];
  let modifyPostTimeLimit = 0;
  if(user){
    modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimitMS(user.uid);
  }
  // const modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimitMS(user.uid);
  for (const thread of threads) {
    if(
      !ctx.permission("getPostAuthor") &&
      (!user || user.uid !== targetUser.uid) &&
      thread.firstPost.anonymous
    ) continue;
    if(thread.disabled || thread.recycleMark) {
      // 根据权限过滤掉 屏蔽、退休的内容
      if(user) {
        // 不具有特殊权限且不是自己
        if(!superModerator && user.uid !== targetUser.uid) {
          const mainForumsId = thread.mainForumsId || [];
          let has = false;
          for(const fid of mainForumsId) {
            if(canManageFid.includes(fid)) {
              has = true;
            }
          }
          if(!has) continue;
        }
      } else {
        continue;
      }
    }
    // 增加 编辑权限
    const post = await db.PostModel.findOnly({pid: thread.oc});
    const isComment = !!post.parentPostId;
    const isThread = post.type === 'thread';
    // const postType = isThread? 'thread': 'post';
    let edit = null;
    // 编辑
    if(
      // 回复或不是基金的文章
      (!isThread || thread.type !== 'fund') && user &&
      (post.uid === user.uid || ctx.permission('modifyOtherPosts'))
    ) {
      if(modifyPostTimeLimit >= (Date.now() - new Date(post.toc).getTime())) {
        // 未超过修改的最大时间
        edit = true;
      }
    }
    const result = {
      edit,
      isComment,
      editType: post.type,
      postType: "postToForum",
      tid: thread.tid,
      cover: thread.firstPost.cover,
      time: thread.toc,
      pid: thread.oc,
      abstract: nkcModules.nkcRender.replaceLink(thread.firstPost.abstract),
      title: nkcModules.nkcRender.replaceLink(thread.firstPost.t),
      content: nkcModules.nkcRender.replaceLink(thread.firstPost.c),
      anonymous: thread.firstPost.anonymous,
      link: `/t/${thread.tid}`,
      reviewed: thread.reviewed,
    };
    result.toDraft = thread.recycleMark;
    result.disabled = thread.disabled;
    let threadLogOne;
    if(result.toDraft) {
      threadLogOne = await db.DelPostLogModel.findOne({"threadId": thread.tid, "postType": "thread", "modifyType": false}).sort({toc: -1});
    } else if (result.disabled) {
      threadLogOne = await db.DelPostLogModel.findOne({"threadId": thread.tid, "postType": "thread", "modifyType": false}).sort({toc: -1});
    } else {
      threadLogOne = await db.ReviewModel.findOne({sid: thread.firstPost.pid, source: source.post}).sort({toc: -1});
    }
    if(threadLogOne && (haveReviewPermission || result.toDraft)) {
      result.reviewReason = threadLogOne.reason;
    }
    results.push(result);
  }
  data.paging = paging;
  data.posts = results;
  if(user && user.uid===targetUser.uid){
    // 可以显示管理推送到专栏显示的按钮
    data.permissions.type = 'thread';
  }
  
  await next();
}
