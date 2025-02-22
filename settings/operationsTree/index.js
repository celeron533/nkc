// 通过url和请求方法确定操作类型
// PARAMETER代表url中不确定的值，如 '/u/uid/settings/info' 中的uid是个变化的值
const resourceObj = require('./resource');
const {
  avatar,
  banner,
  poster,
  avatar_small,
  forum_avatar,
  r,
  rt,
  cover,
  frameImg,
  resources,
  pfa,
  pfb,
  fundLogo,
  fundBanner,
} = resourceObj;
const api = require('./api');
const mathJax = require('./mathJax');
const document = require('./document');
const draft = require('./draft');
const editor = require('./editor');
const edit = require('./edit');
const exam = require('./exam');
const e = require('./experimental');
const f = require('./forum');
const survey = require('./survey');
const creation = require('./creation');
const fund = require('./fund');
const login = require('./login');
const logout = require('./logout');
const me = require('./me');
const column = require('./column');
const test = require('./test');
const weChat = require('./weChat');
const m = require('./columns');
const p = require('./post');
const problem = require('./problem');
const register = require('./register');
const search = require('./search');
const sendMessage = require('./sendMessage');
const t = require('./thread');
const u = require('./user');
const page = require('./page');
const download = require('./download');
const forgotPassword = require('./forgotPassword');
const app = require('./app');
const message = require('./message');
const activity = require('./activity');
const s = require('./share');
const friend = require('./friend');
const subscription = require('./homeSubscription');
const lottery = require('./lottery');
const shop = require('./shop');
const account = require('./account');
const complaint = require('./complaint');
const rs = require('./resources');
const protocol = require('./protocol');
const review = require('./review');
const threads = require('./threads');
const library = require('./library');
const libraries = require('./libraries');
const nkc = require('./nkc');
const reader = require('./reader');
const sticker = require('./sticker');
const stickers = require('./stickers');
const note = require('./note');
const tools = require('./tools');
const ipinfo = require('./ipinfo');
const blacklist = require('./blacklist');
const attachment = require('./attachment');
const verifications = require('./verifications');
const payment = require('./payment');
const link = require('./link');
const community = require('./community');
const watermark = require('./watermark');
const drawData = require('./drawData');
const logo = require('./logo');
const { Operations } = require('../operations');
const book = require('./book');
const rc = require('./rc');
const comment = require('./comment');
const zone = require('./zone');
const subscribe = require('./subscribe');
const article = require('./article');
const moment = require('./moment');
const settings = require('./settings');
const latest = require('./latest');
const oauth = require('./oauth');
const tc = require('./tc');
const browser = require('./browser');
const apps = require('./apps');
const attachIcon = require('./attachIcon');
const photo = require('./photo');
const photo_small = require('./photo_small');
const rm = require('./rm');
const ro = require('./ro');
const shopLogo = require('./shopLogo');
const operationTree = {
  home: {
    GET: 'visitHome', // 首页

    // 适配dz
    'forum.php': {
      GET: Operations.discuz,
    },
    'index.php': {
      GET: Operations.discuz,
    },
    'read.php': {
      GET: Operations.discuz,
    },
    read: {
      PARAMETER: {
        GET: Operations.discuz,
        PARAMETER: {
          GET: Operations.discuz,
          PARAMETER: {
            GET: Operations.discuz,
          },
        },
      },
    },
    'home.php': {
      GET: Operations.discuz,
    },
    document, // 预览文章或历史
    draft, //预览草稿或历史
    poster, //活动海报
    avatar, // 用户头像
    avatar_small,
    banner, // 用户背景
    shopLogo, //店铺logo

    forum_avatar, // 专业logo

    r, // 资源
    rs,
    rt, // 小号图 150
    rm, // 中号图 640
    ro, // 原图 3840

    default: resourceObj.default,

    cover, // 文章封面

    frameImg, // 视频封面

    resources, // 网站logo

    pfa, // 专栏logo

    pfb, // 专栏banner

    fundLogo, // 基金项目logo

    fundBanner, // 基金项目banner

    photo, // 照片
    photo_small,

    editor, // 编辑器
    edit,

    exam, // 考试

    e, // 后台管理

    nkc, // 前台管理

    f, //专业

    fund, // 基金

    login, // 登录

    logout, // 退出登录

    me, // 自己

    m, // 专栏

    p, // 回复

    problem, // 报告问题

    register, // 注册

    search, // 搜索

    sendMessage, // 短信

    t, // 文章

    u, // 用户

    download, // 编辑器自动上传图片

    forgotPassword,

    page,

    app, // 手机app

    activity, //活动

    s, // 分享

    message, // 信息（新）

    friend, // 好友

    subscription, // 首页我的关注

    lottery, // 抽奖页

    shop, //商城

    protocol, // 论坛协议

    account, // 个人中心

    complaint, // 用户投诉

    review, // 审核

    column, // 专栏申请

    threads, // 文章批量管理

    survey, // 投票、调查问卷、打分

    library, // 文库
    libraries, // 文库

    reader, // 阅读器 pdf

    sticker, // 表情中心
    stickers, // 共享表情
    note, // 批注
    tools, // 网站工具
    ipinfo, // ip信息
    blacklist, // 黑名单
    a: attachment, // 网站附件， 通用接口
    verifications, // 图形验证码相关
    payment, // 支付相关
    l: link, // 外链跳转
    c: community, // 社区
    z: zone, // 电波
    wm: watermark, //水印
    logo, // 网站 logo
    creation, // 用户创作中心
    test,
    draw: drawData, //获取手机浏览器左侧滑动框
    mathJax, // 编辑器预览公式
    book, // 书籍
    rc, // 资源分组
    comment, // 评论系统
    // zone, // 空间
    g: subscribe, // 关注
    article, // 独立文章
    moment, // 动态
    settings, // 加载系统设置
    n: latest, // 最新页
    oauth, // 第三方登录
    api, // 纯数据接口
    tc, // 多维分类
    browser, // 浏览器版本检测
    apps, // 资源页
    wx: weChat,
    attachIcon,
  },
};
module.exports = {
  operationTree,
};
