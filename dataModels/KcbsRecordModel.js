const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const serverConfig = require('../config/server.json');
const alipay2 = require('../nkcModules/alipay2');
const kcbsRecordSchema = new Schema({
  _id: Number,
  // 花费科创币用户的ID
  from: {
    type: String,
    required: true,
    index: 1
  },
  // 获得科创币用户的ID
  to: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 积分类型
  scoreType: {
    type: String,
    required: true,
    index: 1,
  },
  // 手续费
  fee: {
    type: Number,
    default: 0,
    index: 1,
  },
  // 交易类型
  // digestThread 加精社区文章
  // digestPost 加精社区评论
  // digestComment 加精独立文章评论
  // digestArticle 加精独立文章
  // ...
  //'modifyUsernameAudit','revokeUsernameAudit',''rejectUsernameAudit''
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 转账金额
  num: {
    type: Number,
    required: true,
    index: 1
  },
  // 实际付款金额（元，含手续费）
  payment: {
    type: Number,
    default: null,
  },
  // 备注
  description: {
    type: String,
    default: ''
  },
  // 隐藏备注
  hideDescription: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1
  },
  port: {
    type: String,
    default: '0',
  },
  // 独立文章ID
  articleId: {
    type: String,
    default: '',
    index: 1
  },
  // 独立文章评论ID
  commentId: {
    type: String,
    default: '',
    index: 1
  },
  pid: {
    type: String,
    default: '',
    index: 1
  },
  tid: {
    type: String,
    default: '',
    index: 1
  },
  tUid: {
    type: String,
    default: '',
    index: 1
  },
  problemId: {
    type: String,
    default: '',
    index: 1
  },
  ordersId: {
    type: [String],
    default: [],
  },
  // 涉及的资源的资源id(下载资源操作 attachmentDownload)
  rid: {
    type: String,
    default: '',
    index: 1
  },
  shareToken: {
    type: String,
    default: "",
    index: 1
  },

  // 支付平台
  paymentType: {
    type: String, // wechatPay, aliPay, ''
    // enum: ['weChat', 'aliPay', ''], weChat 已被废弃，当前微信支付用 wechatPay 表示
    default: '',
    index: 1,
  },
  // 支付记录ID
  paymentId: {
    type: String,
    default: '',
    index: 1
  },

  verify: {
    type: Boolean,
    index: 1,
    default: true,
  },
  error: {
    type: String,
    default: ''
  },
  c: {
    type: Schema.Types.Mixed,
    default: {}
  }
  /*
  * c: {
  *  alipayAccount: String,
  *  alipayName: String,
  *  alipayFee: Number,
  *  alipayInterface: Boolean  // 调用阿里接口是否成功 null: 未知，false: 失败， true: 成功
  * }
  * */
}, {
  collection: 'kcbsRecords',
  toObject: {
    getters: true,
    virtuals: true
  }
});

kcbsRecordSchema.virtual('fromUser')
  .get(function() {
    return this._fromUser;
  })
  .set(function(p) {
    this._fromUser = p;
  });

/*
* 执行操作后的加减积分，根据settings中的score判断
* @param {String} type 操作类型
* @param {Object} u 目标用户
* @param {Object} ctx koa上下文
* @param {Number} additionalReward 额外扣除的kcb, 不适用于积分系统，暂时无用
* @author pengxiguaa 2020/6/30
* */
kcbsRecordSchema.statics.insertSystemRecord = async (type, u, ctx, additionalReward) => {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const { redLock } = require('../nkcModules/redLock');
  const lock = await redLock.lock('kcbsRecord', 6000);
  try{
    await KcbsRecordModel.insertSystemRecordContent(type, u, ctx, additionalReward);
    await lock.unlock();
  } catch(err) {
    await lock.unlock();
    throw err;
  }
};

/*
* 执行科创币的加减
* */
kcbsRecordSchema.statics.insertSystemRecordContent = async (type, u, ctx, additionalReward) => {
  const SettingModel = mongoose.model('settings');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const UserModel = mongoose.model('users');
  const ScoreOperationLogModel = mongoose.model('scoreOperationLogs');
  const {address: ip, port, data, state = {}} = ctx;
  if(!u) return;
  let fid = '';
  // 多专业情况下 所有有关积分的数据仅从第一个专业上读取, 获取第一个专业
  if(state._scoreOperationForumsId && state._scoreOperationForumsId.length) {
    fid = state._scoreOperationForumsId[0];
  }
  // 获取积分策略对象
  const operation = await SettingModel.getScoreOperationsByType(type, fid); // 专业ID待传\
  if(!operation) return;
  if(operation.from === 'default') fid = '';
  const enabledScores = await SettingModel.getEnabledScores();
  const scores = {};
  // 获取当天此人当前操作执行的次数
  const operationLogCount = await ScoreOperationLogModel.getOperationLogCount(u, type, fid);
  if(operation.count !== -1 && operation.count <= operationLogCount) return;
  for(const e of enabledScores) {
    const scoreType = e.type;
    scores[scoreType] = operation[scoreType];
  }
  let recordsId = [];
  for(const enabledScore of enabledScores) {
    const scoreType = enabledScore.type;
    const number = scores[scoreType];
    if(number === undefined) continue;
    if(number === 0) continue;
    let from, to;
    let num = Math.abs(number);
    if(number > 0) {
      // 加分
      from = 'bank';
      to = u.uid;
    } else {
      // 减分
      from = u.uid;
      to = 'bank';
    }
    const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
    const newRecords = KcbsRecordModel({
      _id: kcbsRecordId,
      from,
      to,
      num,
      scoreType,
      type,
      ip,
      port,
    });
    if(data.targetUser && data.user) {
      if(data.user !== u) {
        newRecords.tUid = data.user.uid;
      } else {
        newRecords.tUid = data.targetUser.uid;
      }
    }
    let thread, post;
    if(data.thread) {
      thread = data.thread;
    } else if (data.targetThread) {
      thread = data.targetThread;
    }
    if(data.post) {
      post = data.post;
    } else if (data.targetPost) {
      post = data.targetPost;
    }
    if(thread) {
      newRecords.tid = thread.tid;
      newRecords.fid = thread.fid;
    }
    if(post) {
      newRecords.pid = post.pid;
      newRecords.fid = post.fid;
      newRecords.tid = post.tid;
    }
    // 操作涉及到的资源的资源id
    if(data.rid) {
      newRecords.rid = data.rid;
    }
    if(data.problem) newRecords.problemId = data.problem._id;
    await newRecords.save();
    recordsId.push(kcbsRecordId);
  }
  // 已创建积分账单记录
  if(recordsId.length) {
    const scoreOperationLog = ScoreOperationLogModel({
      _id: await SettingModel.operateSystemID('scoreOperationLogs', 1),
      uid: u.uid,
      type,
      ip,
      port,
      fid,
      recordsId
    });
    await scoreOperationLog.save();
    await UserModel.updateUserScores(u.uid);
  }
};

/*// 与银行间的交易记录
kcbsRecordSchema.statics.insertSystemRecord_old = async (type, u, ctx, additionalReward) => {
  additionalReward = additionalReward || 0;
  const UserModel = mongoose.model("users");
  const {nkcModules, address, port, data, db} = ctx;
  const {user} = data;
  if(!user || !u) return;
  // 加载相应科创币设置
  const kcbsType = await db.KcbsTypeModel.findOnly({_id: type});
  // 如果是撤销操作则扣除额外的奖励
  kcbsType.num -= additionalReward;
  if(kcbsType.count === 0) {
    // 此操作未启动
    return;
  } else if(kcbsType.count !== -1) {
    // 获取今日已触发该操作的次数
    const today = nkcModules.apiFunction.today();
    const recordsCount = await db.KcbsRecordModel.countDocuments({
      type,
      $or: [
        {
          from: u.uid,
          to: 'bank'
        },
        {
          from: 'bank',
          to: u.uid
        }
      ],
      toc: {$gte: today}
    });
    // 若次数已达上限则不做任何处理
    if(recordsCount >= kcbsType.count) return;
  }
  // 若kcbsType === -1则不限次数
  const _id = await db.SettingModel.operateSystemID('kcbsRecords', 1);
  const newRecords = db.KcbsRecordModel({
    _id,
    from: 'bank',
    to: u.uid,
    type,
    num: kcbsType.num,
    ip: address,
    port
  });
  // 若该操作科创币为负，则由用户转给银行
  if(kcbsType.num < 0) {
    newRecords.from = u.uid;
    newRecords.to = 'bank';
    newRecords.num = -1*newRecords.num;
  }
  if(data.targetUser) {
    if(data.user !== u) {
      newRecords.tUid = data.user.uid;
    } else {
      newRecords.tUid = data.targetUser.uid;
    }
  }
  let thread, post;
  if(data.thread) {
    thread = data.thread;
  } else if (data.targetThread) {
    thread = data.targetThread;
  }
  if(data.post) {
    post = data.post;
  } else if (data.targetPost) {
    post = data.targetPost;
  }
  if(thread) {
    newRecords.tid = thread.tid;
    newRecords.fid = thread.fid;
  }
  if(post) {
    newRecords.pid = post.pid;
    newRecords.fid = post.fid;
    newRecords.tid = post.tid;
  }
  if(data.problem) newRecords.problemId = data.problem._id;
  // 写入交易记录，紧接着更新用户的kcb数据
  await newRecords.save();
  u.kcb = await UserModel.updateUserKcb(u.uid);
};*/

// 用户间转账记录
kcbsRecordSchema.statics.insertUsersRecord = async (options) => {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model('settings');
  const {
    fromUser, toUser, num, description, post, ip, port, comment, article,
  } = options;
  if(fromUser.uid === toUser.uid) throwErr(400, "无法对自己执行此操作");
  const _id = await SettingModel.operateSystemID('kcbsRecords', 1);
  const creditScore = await SettingModel.getScoreByOperationType('creditScore');
  const record = KcbsRecordModel({
    _id,
    scoreType: creditScore.type,
    from: fromUser.uid,
    to: toUser.uid,
    num,
    description,
    commentId: comment ? comment._id : '',
    articleId: article ? article._id : '',
    pid: post ? post.pid : '',
    ip,
    port,
    type: 'creditKcb'
  });
  await record.save();
  await UserModel.updateUserScores(fromUser.uid);
  await UserModel.updateUserScores(toUser.uid);
  return record;
  // fromUser.kcb = await UserModel.updateUserKcb(fromUser.uid);
  // toUser.kcb = await UserModel.updateUserKcb(toUser.uid);
};


kcbsRecordSchema.statics.extendKcbsRecords = async (records) => {
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const ArticleModel = mongoose.model('articles');
  const {getUrl} = require('../nkcModules/tools');
  const ForumModel = mongoose.model('forums');
  const KcbsTypeModel = mongoose.model('kcbsTypes');
  const SettingModel = mongoose.model('settings');
  const scoreTypes = await SettingModel.getScores();
  const scoreTypesObj = {};
  scoreTypes.map(s => {
    scoreTypesObj[s.type] = s.name;
  });
  const uid = new Set();
  const pid = new Set();
  const tid = new Set();
  const fid = new Set();
  const kcbsTypesId = new Set();
  // articleId
  const aid = new Set();
  for(const r of records) {
    if(r.from !== 'bank') {
      uid.add(r.from);
    }
    if(r.to !== 'bank') {
      uid.add(r.to);
    }
    if(r.pid) pid.add(r.pid);
    if(r.tid) tid.add(r.tid);
    if(r.fid) fid.add(r.fid);
    if(r.tUid) uid.add(r.tUid);
    if(r.articleId) aid.add(r.articleId);
    kcbsTypesId.add(r.type);
  }
  const usersObj = {}, threadsObj = {}, forumsObj = {}, postsObj = {}, typesObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const threads = await ThreadModel.find({tid: {$in: [...tid]}});
  const forums = await ForumModel.find({fid: {$in: [...fid]}});
  const posts = await PostModel.find({pid: {$in: [...pid]}});
  const types = await KcbsTypeModel.find({_id: {$in: [...kcbsTypesId]}});
  const articlesObject = await ArticleModel.getArticlesObjectByArticlesId([...aid]);
  const articlesUrl = {};
  const articles = Object.values(articlesObject);
  for(const a of articles) {
    let articleUrl = '';
    if (a.source === 'column') {
      if (!a.sid) {
        articleUrl = `/article/${a._id}`;
      } else {
        articleUrl = (await ArticleModel.getArticleUrlBySource(a._id, a.source, a.sid.split('-')[0])).articleUrl;
      }
    } else {
      articleUrl = (await ArticleModel.getArticleUrlBySource(a._id, a.source, a.sid)).articleUrl;
    }
    // articlesUrl[a._id] = (await ArticleModel.getArticleUrlBySource(a._id, a.source, a.sid)).articleUrl;
    articlesUrl[a._id] = articleUrl;
  }
  for(const t of types) {
    typesObj[t._id] = t;
  }
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  for(const forum of forums) {
    forumsObj[forum.fid] = forum;
  }
  for(const thread of threads) {
    threadsObj[thread.tid] = thread;
  }
  for(let post of posts) {
    post = post.toObject();
    post.url = await PostModel.getUrl(post);
    postsObj[post.pid] = post;
  }
  return records.map(r => {
    r = r.toObject();
    if(r.tUid) r.targetUser = usersObj[r.tUid];
    if(r.from !== 'bank') {
      r.fromUser = usersObj[r.from];
    }
    if(r.to !== 'bank') {
      r.toUser = usersObj[r.to];
    }
    if(r.tid) r.thread = threadsObj[r.tid];
    if(r.fid) r.forum = forumsObj[r.fid];
    if(r.pid) {
      r.post = postsObj[r.pid];
    }
    r.scoreName = scoreTypesObj[r.scoreType];
    r.kcbsType = typesObj[r.type];

    let url = '';

    if(!url && r.pid) {
      const post = postsObj[r.pid];
      if(post) {
        url = getUrl('post', r.pid);
      }
    }

    if(!url && r.tid) {
      const thread = threadsObj[r.tid];
      if(thread) {
        url = getUrl('thread', r.tid);
      }
    }

    if(!url && r.fid) {
      const forum = forumsObj[r.fid];
      if(forum) {
        url = getUrl('forum', r.fid);
      }
    }

    if(!url && r.articleId) {
      const articleUrl = articlesUrl[r.articleId];
      if(articleUrl) {
        url = articleUrl;
      }
    }

    if(!url && r.commentId) {
      const commentUrl = getUrl('comment', r.commentId);
      if(commentUrl) {
        url = commentUrl;
      }
    }

    r.url = url;

    return r
  });
};

/*
  获取支付宝链接，去充值或付款。付款时需传递参数options.type = 'pay'
  @param options
    uid: 充值用户、付款用户
    money: 金额，分
    ip: 操作人IP地址,
    port: 操作人端口，
    title: 账单标题, 例如：科创币充值
    notes: 账单说明，例如：充值23个科创币
    backParams: 携带的参数，会原样返回
  @return url: 返回链接
  @author pengxiguaa 2019/3/13
*/
kcbsRecordSchema.statics.getAlipayUrl = async (options) => {
  let {uid, money, ip, port, title, notes, backParams, score, fee} = options;
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const SettingModel = mongoose.model('settings');
  money = Number(money);
  if(money > 0) {}
  else {
    throwErr(400, '金额必须大于0');
  }
  const mainScore = await SettingModel.getMainScore();
  const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id: kcbsRecordId,
    scoreType: mainScore.type,
    from: 'bank',
    to: uid,
    type: 'recharge',
    fee,
    num: score,
    payment: money,
    ip,
    port,
    verify: false,
    description: notes
  });
  await record.save();
  const o = {
    money,
    id: kcbsRecordId,
    title,
    notes,
    backParams,
    returnUrl: serverConfig.domain + '/account/finance/recharge?type=back'
  };
  return await alipay2.receipt(o);
};
/*
* 微信支付、支付宝支付 生成账单
* @param {Object} props
*   @param {String} paymentType 支付平台 weChat/aliPay
*   @param {String} paymentId 支付ID
*   @param {String} uid 用户ID,
*   @param {String} ip
*   @param {String} port
*   @param {Number} fee 手续费 元
*   @parma {Number} num 有效金额 分
*   @param {Number} paymentNum 总付款数额 元
*   @param {String} description 有关当前记录的简介
*   @param {Boolean} fromShop 是否来自商城购买商品
*   @param {[String]} ordersId 订单 ID，非商品付款时此字段为空数组
* */
kcbsRecordSchema.statics.createKcbsRecord = async (props) => {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const SettingModel = mongoose.model('settings');
  const {
    paymentType,
    paymentId,
    uid,
    ip,
    port,
    fee,
    num,
    paymentNum,
    description,
    ordersId = [],
  } = props;
  const mainScore = await SettingModel.getMainScore();
  // 仅充值
  const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id: kcbsRecordId,
    scoreType: mainScore.type,
    from: 'bank',
    to: uid,
    type: 'recharge',
    fee,
    num: num,
    payment: paymentNum,
    paymentType,
    paymentId,
    ip,
    port,
    verify: false,
    description,
    ordersId
  });
  await record.save();
}

kcbsRecordSchema.statics.hideSecretInfo = async (records) => {
  for(const record of records) {
    record.c = "";
    if(record.hideDescription) record.description = "「根据相关法律法规和政策，内容不予显示」";
  }
};

/*
* 充值时，当接收到支付平台的支付通知之后，调用次方法改变账单状态并更新用户积分
* */
kcbsRecordSchema.methods.verifyPass = async function() {
  const UserModel = mongoose.model('users');
  const ShopOrdersModel = mongoose.model('shopOrders');
  const {
    verify: _verify,
    ordersId,
    num,
    to,
  } = this;
  if(_verify) return;
  if(!_verify) {
    this.verify = true;
    await this.save();
    if(ordersId && ordersId.length) {
      // 创建商品购买账单并更新商品状态等
      await ShopOrdersModel.createRecordByOrdersId({
        ordersId,
        totalMoney: num,
        uid: to
      });
    } else {
      await UserModel.updateUserScore(this.to, this.scoreType);
    }
  }
  // 修改订单信息等等..
}

module.exports = mongoose.model('kcbsRecords', kcbsRecordSchema);
