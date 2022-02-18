const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  did: {
    type: Number,
    default: null,
    index: 1
  },
  published: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 当前文章是否包含草稿
  hasDraft: {
    type: Boolean,
    default: true,
    index: 1
  },
  // 引用文章的模块类型
  source: {
    type: String, // column, alone
    required: true,
    index: 1
  },
  // 引用文章的模块类型所对应的 ID
  sid: {
    type: String,
    default: '',
    index: 1
  },
  // 其他引用模块类型
  references: {
    type: String,
    default: [],
    index: 1
  }
}, {
  collection: 'articles'
});

/*
* 向 book 中添加文章，创建 article、document
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章富文本内容，可为空
*   @param {String} uid 作者，不可为空
* @return {Object} 创建的 article 对象
* */
schema.statics.createArticle = async (props) => {
  const {title, content, coverFile, uid} = props;
  const toc = new Date();
  const ArticleModel = mongoose.model('articles');
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const aid = await SettingModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    coverFile,
    title,
    content,
    toc,
    source: documentSource,
    sid: aid
  });
  const article = new ArticleModel({
    _id: aid,
    uid,
    toc,
    did: document.did,
  });
  await article.save();
  return article;
}
schema.static.countDocument = async (queryCriteria)=>{
  const ArticleModel = mongoose.model('articles');
  const count =await ArticleModel.find(queryCriteria);
  return count
}
schema.methods.getBetaDocumentCoverId = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(documentSource, this._id);
  return betaDocument? betaDocument.cover: '';
};

/*
* 修改 book 中的文章
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章内容，可为空
*   @param {String} cover 原封面 ID，可为空
*   @param {File} coverFile 新的封面图文件对象
* */
schema.methods.modifyArticle = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {title, content, cover, coverFile} = props;
  const {did} = this;
  const toc = new Date();
  await DocumentModel.updateDocumentByDid(did, {
    title,
    content,
    cover,
    coverFile,
    tlm: toc,
  });
  await this.updateOne({
    $set: {
      tlm: toc
    }
  });
}
/*
* 发布 article
* 如果有正式版就将正式版设为历史
* 将测试版设为正式版
* */
schema.methods.publishArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {did} = this;
  await DocumentModel.publishDocumentByDid(did);
}

schema.methods.getStableDocId = async function () {
  const {did} = this;
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.findOne({
    did,
    type: 'stable'
  });
  return document? document._id: null
}

schema.methods.getNote = async function() {
  const NoteModel = mongoose.model('notes');
  const stableDocId = await this.getStableDocId();
  return {
    type: 'document',
    targetId: stableDocId,
    notes: await NoteModel.getNotesByDocId(stableDocId)
  }
}
/*
* 保存 article
* 将测试版变为历史版
* */
schema.methods.saveArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.copyBetaToHistoryBySource(documentSource, this._id);
}
schema.statics.checkArticleInfo = async (article) => {
  const {title, content} = article;
  const {checkString} = require('../nkcModules/checkData');
  checkString(title, {
    name: '文章标题',
    minTextLength: 1,
    maxLength: 500
  });
  checkString(content, {
    name: '文章内容',
    maxLength: 200000,
    minTextLength: 1,
    maxTextLength: 10000,
  });
}
const {timeFormat} = require('../nkcModules/tools');
const {htmlToPlain} = require("../nkcModules/nkcRender");
// 过滤一维数组中的对象的key
schema.statics.filterAndExtendData = async (allowKey, data, resIds)=>{
  const newData = []
  data.forEach((item,i)=>{
    item = item.toObject()
    const newItem = {}
    for (const key in item) {
      if (Object.hasOwnProperty.call(item, key)) {
        if(allowKey.includes(key)){
          if(key === 'toc'){
            newItem['time'] = timeFormat(item[key])
            continue;
          }else if(key === 'content'){
            newItem[key] = htmlToPlain(item[key], 30)
            continue;
          }
          newItem[key] = item[key]
        }
      }
    }
    newItem['ids'] = resIds[i]
    newData.push(newItem)
  })
  return newData
};
schema.methods.getEditorBetaDocumentContent = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  return DocumentModel.getEditorBetaDocumentContentBySource(documentSource, this._id);
};

/*
* 拓展articles
* */
schema.statics.extendArticles = async function(articles) {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const BooksModel = mongoose.model('books');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const articlesId = [];
  for(const article of articles) {
    articlesId.push(article._id);
  }
  const documents = await DocumentModel.find({
    type: {
      $in: ['beta', 'stable']
    },
    source: documentSource,
    sid: {
      $in: articlesId
    }
  });
  const articlesObj = {};
  for(const d of documents) {
    const {type, sid} = d;
    if (!articlesObj[sid]) articlesObj[sid] = {};
    articlesObj[sid][type] = d;
  }
  const results = [];
  const bookObj = {};
  const books = await BooksModel.find({list: {$in: articlesId}});
  for(const book of books) {
    articlesId.map(id => {
      if(book.list.includes(id)) {
        bookObj[id] = book;
      }
    })
  }
  for(const article of articles) {
    const {
      _id,
      toc,
      uid,
    } = article;
    const articleObj = articlesObj[_id];
    if(!articleObj) continue;
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if(!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const {title, did} = document;
    const result = {
      _id,
      uid,
      bid: bookObj[article._id]._id,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      title: title || '未填写标题',
      bookUrl: `/book/${bookObj[article._id]._id}`,
      bookName:  bookObj[article._id].name,
      url: getUrl('bookContent', bookObj[article._id]._id, article._id),
      time: timeFormat(toc),
      did,
    };
    results.push(result);
  }
  return results;
}
module.exports = mongoose.model('articles', schema);
