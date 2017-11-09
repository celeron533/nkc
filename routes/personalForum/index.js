const Router = require('koa-router');
const router = new Router();

router
  .get('/:uid', async () => {
    const {data, params, db, query, getVisibleFid, settings, generateMatchBase} = ctx;
    const mongoose = settings.database;
    const perpage = settings.paging.perpage;
    const {uid} = params;
    const {PersonalForumModel, UserModel, UsersSubscribeModel} = db;
    const personalForum = PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    data.forum = personalForum;
    const {sortby, digest, tab, page} = query;
    const matchBase = generateMatchBase();
    const $sort = {};
    if(sortby)
      $sort.toc = 1;
    else
      $sort.tlm = 1;
    const targetUser = await UserModel.findOnly({uid});
    const visibleFid = await getVisibleFid();
    const $groupWithCount = {
      _id: null,
      threads: {$push: '$$root'},
      count: {$sum: 1}
    };
    const $returnCount = {
      _id: 0,
      count: 1,
      threads: {
        $slice: [
          '$threads',
          page ? (page - 1) * perpage : 0,
          perpage
        ]
      }
    };
    if(tab === 'reply') {
      const $matchPost = matchBase.set('uid', uid);
      let $matchThread = matchBase;
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('posts').aggregate([
        {$match: $matchPost.toJS()},
        {$group: {
          _id: '$tid',
          posts: {$push: '$$root'}
        }},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 't'
        }},
        {$project: {t: {lastPost: '$posts[0]'}}},
        {$replaceRoot: {newRoot: '$t'}},
        {$match: $matchThread.toJS()},
        {$sort},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'oc.uid',
          foreignField: 'uid',
          as: 'oc.user'
        }},
        {$lookup: {
          from: 'users',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ]);
    }
    else if(tab === 'own') {
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      $matchThread = $matchThread.set('uid', uid);
      if(
        !user || personalForum.moderators.indexOf(user._key) === -1
        || !ctx.ensurePermission('POST', '/t/x/digest')
      ) {
        //if u r not the forum-moderator/moderator, u can't access hide threads
        $matchThread = $matchThread.set('hideInMid', false);
      }
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread.toJS()},
        {$sort},
        {$group: {
          _id: '$tid',
          threads: {$push: '$$root'}
        }},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ])
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts});
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('posts').aggregate([
        {$match: $postMatch},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$match: $matchThread},
        {$sort},
        {$lookup: {
          from: 'posts',
          localField: 'thread.oc',
          foreignField: 'pid',
          as: 'thread.oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ])
    }
    else if(tab === 'discuss') {
      $matchThread = $matchThread.set('toMid', uid);
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      if(
        !user || personalForum.moderators.indexOf(user._key) === -1
        || !ctx.ensurePermission('POST', '/t/x/digest')
      ) {
        $matchThread = $matchThread.set('hideInToMid', false);
      }
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread},
        {$sort},
        {$group: $groupWithCount},
        {$project: $returnCount},
        {$unwind: '$threads'},
        {$lookup: {
          from: 'posts',
          localField: 'threads.oc',
          foreignField: 'pid',
          as: 'threads.oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.oc.uid',
          foreignField: 'uid',
          as: 'threads.oc.user'
        }},
        {$lookup: {
          from: 'posts',
          localField: 'threads.lm',
          foreignField: 'pid',
          as: 'threads.lm'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.lm.uid',
          foreignField: 'uid',
          as: 'threads.lm.user'
        }},
      ])
    }
    else if(tab === 'subscribe') {
      const {subscribeUsers} = await UsersSubscribeModel.findOnly(uid);
      let $matchThread = matchBase.set('uid', {$in: subscribeUsers});
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread},
        {$sort},
        {$group: $groupWithCount},
        {$project: $returnCount},
        {$unwind: '$threads'},
        {$lookup: {
          from: 'posts',
          localField: 'threads.oc',
          foreignField: 'pid',
          as: 'threads.oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.oc.uid',
          foreignField: 'uid',
          as: 'threads.oc.user'
        }},
        {$lookup: {
          from: 'posts',
          localField: 'threads.lm',
          foreignField: 'pid',
          as: 'threads.lm'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.lm.uid',
          foreignField: 'uid',
          as: 'threads.lm.user'
        }},
      ])
    }
    else if(tab === 'all') {
      const $post1 = matchBase.set('uid', uid);
      const {recPosts} = personalForum;
      const $post2 = matchBase.set('pid', {$in: recPosts});
      data.threads = await mongoose.connection.db.collection('threads').aggregate([

      ])
    }
  });