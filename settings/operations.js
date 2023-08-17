/*
 * 目前，访问任何一个路由都对应一个操作
 * 一个路由对应一个操作，一个操作可对应多个路由
 * 除了路由操作以外，还存在非路由操作
 * 后台证书设置页可配置动态操作给证书，起到控制权限的作用
 * */

// 固定的、无需在后台证书权限处配置的操作，不会经过全局权限判断
const FixedOperations = {
  getServerInfo: 'getServerInfo',
  getAccountInfo: 'getAccountInfo',
  getAccountCard: 'getAccountCard',
  getAccountDrawer: 'getAccountDrawer',
  api_get_recycle_recycleBin: 'api_get_recycle_recycleBin',
  getReviewData: 'getReviewData',
  getUserPublicInfo: 'getUserPublicInfo',
  modifyUserMemo: 'modifyUserMemo',
  getUserMemo: 'getUserMemo',
  getQuestionTag: 'getQuestionTag',
  putQuestionTag: 'putQuestionTag',
  deleteQuestionTag: 'deleteQuestionTag',
  getQuestionTags: 'getQuestionTags',
  createQuestionTag: 'createQuestionTag',
  openPublicExam: 'openPublicExam',
  takePublicExam: 'takePublicExam',
  submitPublicExam: 'submitPublicExam',
  createExamQuestion: 'createExamQuestion',
  modifyExamQuestion: 'modifyExamQuestion',
  visitExamQuestionEditor: 'visitExamQuestionEditor',
  visitPublicExam: 'visitPublicExam',
  getExamsPaper: 'getExamsPaper',
  postExamsPaper: 'postExamsPaper',
  registerExamCheck: 'registerExamCheck',
};

// 需要在后台配置给相应证书的操作，会经过全局的权限判断
const DynamicOperations = {
  modifyOtherPosts: 'modifyOtherPosts',
  modifyOtherArticles: 'modifyOtherArticles',
  displayRecycleMarkThreads: 'displayRecycleMarkThreads',
  displayDisabledPosts: 'displayDisabledPosts',
  displayPostHideHistories: 'displayPostHideHistories',
  displayFundNoVerifyBills: 'displayFundNoVerifyBills',
  displayFundBillsSecretInfo: 'displayFundBillsSecretInfo',
  displayFundApplicationFormSecretInfo: 'displayFundApplicationFormSecretInfo',
  getAnyBodyPhoto: 'getAnyBodyPhoto', // 忽略相册、证书照片的权限
  removeAnyBodyPhoto: 'removeAnyBodyPhoto', // 忽略相册、证书照片的权限
  canSendToEveryOne: 'canSendToEveryOne', // 跳过`仅接收好友信息`限制
  creditXsf: 'creditXsf',
  modifyAllQuestions: 'modifyAllQuestions', // 可修改审核过的试题
  viewAllPaperRecords: 'viewAllPaperRecords', // 可查看所有的考试记录
  removeAllQuestion: 'removeAllQuestion', // 可删除别人出的试题
  superModerator: 'superModerator', // 超级专家，所有专业的专家权限
  getAnyBodyShopCert: 'getAnyBodyShopCert', // 可查看任何人的商城凭证
  viewUserAllFansAndFollowers: 'viewUserAllFansAndFollowers', // 可查看用户的所有关注的人和粉丝
  showSecretSurvey: 'showSecretSurvey', // 查看隐藏的调查结果
  showSurveyCertLimit: 'showSurveyCertLimit', // 发起调查时可更具证书限制参与的用户
  getAllMessagesResources: 'getAllMessagesResources', // 查看所有的短消息资源
  topAllPost: 'topAllPost', // 置顶任何人的回复
  modifyAllResource: 'modifyAllResource', // 可修改任何人的附件
  visitAllUserProfile: 'visitAllUserProfile', // 可查看任何人的个人中心
  managementNote: 'managementNote', // 可屏蔽编辑任何人的笔记
  viewUserScores: 'viewUserScores', // 可在用户名片页查看用户的积分
  viewUserCode: 'viewUserCode', // 可查看任意用户的动态码
  viewUserArticle: 'viewUserArticle', //查看任意用户的文章
  modifyAllPostOrder: 'modifyAllPostOrder', //可以调整任意用户的文章回复顺序
  visitHome: 'visitHome',
  discuz: 'discuz',
  previewDocument: 'previewDocument',
  viewHistoryDocument: 'viewHistoryDocument',
  historyEditDocument: 'historyEditDocument',
  previewDraft: 'previewDraft',
  viewHistoryDraft: 'viewHistoryDraft',
  historyEditDraft: 'historyEditDraft',
  getActivityPoster: 'getActivityPoster',
  uploadActivityPoster: 'uploadActivityPoster',
  getUserAvatar: 'getUserAvatar',
  uploadUserAvatar: 'uploadUserAvatar',
  modifyUserBanner: 'modifyUserBanner',
  getShopLogo: 'getShopLogo',
  uploadShopLogo: 'uploadShopLogo',
  uploadResources: 'uploadResources',
  getResources: 'getResources',
  modifyResources: 'modifyResources',
  getResourceInfo: 'getResourceInfo',
  buyResource: 'buyResource',
  resourceDetail: 'resourceDetail',
  getResourceCover: 'getResourceCover',
  getMediums: 'getMediums',
  getOrigins: 'getOrigins',
  getDefaultImage: 'getDefaultImage',
  getAttachmentIcon: 'getAttachmentIcon',
  getPersonalForumAvatar: 'getPersonalForumAvatar',
  getPersonalForumBanner: 'getPersonalForumBanner',
  uploadPhoto: 'uploadPhoto',
  getPhoto: 'getPhoto',
  deletePhoto: 'deletePhoto',
  getSmallPhoto: 'getSmallPhoto',
  visitEditor: 'visitEditor',
  visitExamPaperList: 'visitExamPaperList',
  viewQuestionRecord: 'viewQuestionRecord',
  viewPaperRecord: 'viewPaperRecord',
  addExamsCategory: 'addExamsCategory',
  visitEditCategory: 'visitEditCategory',
  modifyExamsCategory: 'modifyExamsCategory',
  visitExamsQuestionAuth: 'visitExamsQuestionAuth',
  submitExamsQuestionAuth: 'submitExamsQuestionAuth',
  removeQuestion: 'removeQuestion',
  enabledQuestion: 'enabledQuestion',
  disabledQuestion: 'disabledQuestion',
  getQuestionImage: 'getQuestionImage',
  modifyQuestionAuthStatus: 'modifyQuestionAuthStatus',
  visitExamQuestionManagement: 'visitExamQuestionManagement',
  visitExperimentalStatus: 'visitExperimentalStatus',
  experimentalLogin: 'experimentalLogin',
  experimentalNoteSettings: 'experimentalNoteSettings',
  experimentalThreadCategorySettings: 'experimentalThreadCategorySettings',
  visitToolsManager: 'visitToolsManager',
  experimentalComplaintSettings: 'experimentalComplaintSettings',
  experimentalIPSettings: 'experimentalIPSettings',
  experimentalVisitSettings: 'experimentalVisitSettings',
  experimentalVerificationSettings: 'experimentalVerificationSettings',
  experimentalEditorSettings: 'experimentalEditorSettings',
  experimentalStickerSettings: 'experimentalStickerSettings',
  experimentalThreadSettings: 'experimentalThreadSettings',
  experimentalTransferKCB: 'experimentalTransferKCB',
  experimentalHidePostSettings: 'experimentalHidePostSettings',
  experimentalToppingSettings: 'experimentalToppingSettings',
  experimentalUsernameSettings: 'experimentalUsernameSettings',
  experimentalLoginSettings: 'experimentalLoginSettings',
  experimentalCacheSettings: 'experimentalCacheSettings',
  visitShopSettings: 'visitShopSettings',
  visitShopRefundList: 'visitShopRefundList',
  visitShopRefundDetail: 'visitShopRefundDetail',
  shopAgreeRefundApply: 'shopAgreeRefundApply',
  shopDisagreeRefundApply: 'shopDisagreeRefundApply',
  visitShopRefundSettings: 'visitShopRefundSettings',
  modifyShopRefundSettings: 'modifyShopRefundSettings',
  visitiShopProducts: 'visitiShopProducts',
  shopAdminBanProductSale: 'shopAdminBanProductSale',
  shopAdminClearBanSale: 'shopAdminClearBanSale',
  visitShopAuth: 'visitShopAuth',
  setShopAuth: 'setShopAuth',
  delShelfAuth: 'delShelfAuth',
  visitShopOpenStoreApplys: 'visitShopOpenStoreApplys',
  approveApplyStore: 'approveApplyStore',
  rejectApplyStore: 'rejectApplyStore',
  visitHomeSettingCarousel: 'visitHomeSettingCarousel',
  changeHomeSettingCarousel: 'changeHomeSettingCarousel',
  deleteHomeSettingCarousel: 'deleteHomeSettingCarousel',
  visitHomeSettingFeatured: 'visitHomeSettingFeatured',
  changeHomeSettingFeatured: 'changeHomeSettingFeatured',
  visitHomeSettingRecommendation: 'visitHomeSettingRecommendation',
  changeHomeSettingRecommendation: 'changeHomeSettingRecommendation',
  visitHomeSettingPopular: 'visitHomeSettingPopular',
  changeHomeSettingPopular: 'changeHomeSettingPopular',
  visitProtocolSetting: 'visitProtocolSetting',
  postNewProtocol: 'postNewProtocol',
  visitProtocolType: 'visitProtocolType',
  updateProtocolType: 'updateProtocolType',
  deleteProtocolType: 'deleteProtocolType',
  visitSmsSettings: 'visitSmsSettings',
  modifySmsSettings: 'modifySmsSettings',
  testSendMessage: 'testSendMessage',
  visitExperimentalEmailSettings: 'visitExperimentalEmailSettings',
  modifyEmailSettings: 'modifyEmailSettings',
  testSendEmail: 'testSendEmail',
  visitWebBaseSettings: 'visitWebBaseSettings',
  modifyWebBase: 'modifyWebBase',
  visitHomeTopSettings: 'visitHomeTopSettings',
  modifyHomeTopSettings: 'modifyHomeTopSettings',
  visitHomeNoticeSettings: 'visitHomeNoticeSettings',
  modifyHomeNoticeSettings: 'modifyHomeNoticeSettings',
  deleteHomeNotice: 'deleteHomeNotice',
  visitHomeListSettings: 'visitHomeListSettings',
  modifyHomeListSettings: 'modifyHomeListSettings',
  uploadHomeBigLogo: 'uploadHomeBigLogo',
  experimentalAppSettings: 'experimentalAppSettings',
  visitRoleSettings: 'visitRoleSettings',
  addRole: 'addRole',
  visitRoleUsers: 'visitRoleUsers',
  deleteRole: 'deleteRole',
  modifyRole: 'modifyRole',
  uploadRoleIcon: 'uploadRoleIcon',
  visitOperationSetting: 'visitOperationSetting',
  addOperationType: 'addOperationType',
  modifyOperation: 'modifyOperation',
  visitOperationType: 'visitOperationType',
  modifyOperationType: 'modifyOperationType',
  deleteOperationType: 'deleteOperationType',
  visitEUserSettings: 'visitEUserSettings',
  modifyEUserInfo: 'modifyEUserInfo',
  visitEUserInfo: 'visitEUserInfo',
  getUserAllScores: 'getUserAllScores',
  visitUserSensitiveInfo: 'visitUserSensitiveInfo',
  modifyUserSensitiveInfo: 'modifyUserSensitiveInfo',
  experimentalForumsSettings: 'experimentalForumsSettings',
  visitUsersGradeSettings: 'visitUsersGradeSettings',
  modifyUsersGradeSettings: 'modifyUsersGradeSettings',
  experimentalScoreSettings: 'experimentalScoreSettings',
  visitKcbSettings: 'visitKcbSettings',
  modifyKcbSettings: 'modifyKcbSettings',
  modifyWithdrawRecord: 'modifyWithdrawRecord',
  visitXsfSettings: 'visitXsfSettings',
  modifyXsfSettings: 'modifyXsfSettings',
  logParamsSetting: 'logParamsSetting',
  visitPageSettings: 'visitPageSettings',
  modifyPageSettings: 'modifyPageSettings',
  visitExamSettings: 'visitExamSettings',
  modifyExamSettings: 'modifyExamSettings',
  visitEMessageSettings: 'visitEMessageSettings',
  modifyEMessageSettings: 'modifyEMessageSettings',
  experimentalShareSettings: 'experimentalShareSettings',
  visitEPostSettings: 'visitEPostSettings',
  modifyEPostSettings: 'modifyEPostSettings',
  experimentalDocumentPostSettings: 'experimentalDocumentPostSettings',
  experimentalSubSettings: 'experimentalSubSettings',
  experimentalRegisterSettings: 'experimentalRegisterSettings',
  experimentalSafeSettings: 'experimentalSafeSettings',
  unverifiedPhonePage: 'unverifiedPhonePage',
  modifyBackendPassword: 'modifyBackendPassword',
  weakPasswordCheck: 'weakPasswordCheck',
  weakPasswordCheckResult: 'weakPasswordCheckResult',
  experimentalUserAuth: 'experimentalUserAuth',
  experimentalReviewSettings: 'experimentalReviewSettings',
  experimentalKeywordSettings: 'experimentalKeywordSettings',
  experimentalColumnSettings: 'experimentalColumnSettings',
  experimentalLibrarySettings: 'experimentalLibrarySettings',
  experimentalDownloadSettings: 'experimentalDownloadSettings',
  experimentalUploadSettings: 'experimentalUploadSettings',
  visitERedEnvelope: 'visitERedEnvelope',
  experimentalRechargeSettings: 'experimentalRechargeSettings',
  sensitiveWords: 'sensitiveWords',
  experimentalFundSettings: 'experimentalFundSettings',
  manageOauthApp: 'manageOauthApp',
  visitSystemInfo: 'visitSystemInfo',
  sendSystemInfo: 'sendSystemInfo',
  modifySystemInfo: 'modifySystemInfo',
  deleteSystemInfo: 'deleteSystemInfo',
  fuzzySearchUser: 'fuzzySearchUser',
  visitPublicLogs: 'visitPublicLogs',
  experimentalFilterLogs: 'experimentalFilterLogs',
  experimentalResourceLogs: 'experimentalResourceLogs',
  updateResourceInfo: 'updateResourceInfo',
  visitExperimentalBlacklist: 'visitExperimentalBlacklist',
  visitExperimentalShop: 'visitExperimentalShop',
  visitRecycleMarkThreads: 'visitRecycleMarkThreads',
  deletePublicLogs: 'deletePublicLogs',
  visitSecretLogs: 'visitSecretLogs',
  visitMessageLogs: 'visitMessageLogs',
  visitShareLogs: 'visitShareLogs',
  visitExperimentalLogs: 'visitExperimentalLogs',
  visitBehaviorLogs: 'visitBehaviorLogs',
  visitScoreLogs: 'visitScoreLogs',
  visitExperimentalKcb: 'visitExperimentalKcb',
  visitExperimentalDiffKcb: 'visitExperimentalDiffKcb',
  resetExperimentalDiffKcb: 'resetExperimentalDiffKcb',
  visitExperimentalXsf: 'visitExperimentalXsf',
  visitExperimentalRecharge: 'visitExperimentalRecharge',
  visitExperimentalWithdraw: 'visitExperimentalWithdraw',
  visitExperimentalExam: 'visitExperimentalExam',
  experimentalWarningLog: 'experimentalWarningLog',
  experimentalReviewLog: 'experimentalReviewLog',
  viewSmscodeRecord: 'viewSmscodeRecord',
  viewEmailcodeRecord: 'viewEmailcodeRecord',
  experimentalUserCodeLog: 'experimentalUserCodeLog',
  experimentalPayment: 'experimentalPayment',
  visitExperimentalConsole: 'visitExperimentalConsole',
  visitAuthList: 'visitAuthList',
  visitUserAuth: 'visitUserAuth',
  cancelSubmitVerify: 'cancelSubmitVerify',
  modifyUserVerifyStatus: 'modifyUserVerifyStatus',
  auditorVisitVerifiedUpload: 'auditorVisitVerifiedUpload',
  experimentalToolsFilter: 'experimentalToolsFilter',
  nkcManagement: 'nkcManagement',
  nkcManagementHome: 'nkcManagementHome',
  showActivityEnter: 'showActivityEnter',
  nkcManagementSticker: 'nkcManagementSticker',
  nkcManagementNote: 'nkcManagementNote',
  nkcManagementPost: 'nkcManagementPost',
  nkcManagementDocument: 'nkcManagementDocument',
  nkcManagementColumn: 'nkcManagementColumn',
  nkcManagementSection: 'nkcManagementSection',
  nkcManagementApplyForum: 'nkcManagementApplyForum',
  nkcManagementSecurityApplication: 'nkcManagementSecurityApplication',
  nkcManagementOS: 'nkcManagementOS',
  visitForumsCategory: 'visitForumsCategory',
  addForum: 'addForum',
  visitForumHome: 'visitForumHome',
  postToForum: 'postToForum',
  deleteForum: 'deleteForum',
  getForumChildForums: 'getForumChildForums',
  visitForumCard: 'visitForumCard',
  visitForumLatest: 'visitForumLatest',
  viewForumVisitors: 'viewForumVisitors',
  viewForumFollowers: 'viewForumFollowers',
  visitForumInfoSettings: 'visitForumInfoSettings',
  saveForumDeclare: 'saveForumDeclare',
  saveForumLatestBlockNotice: 'saveForumLatestBlockNotice',
  modifyForumInfo: 'modifyForumInfo',
  visitForumMergeSettings: 'visitForumMergeSettings',
  modifyMergeSettings: 'modifyMergeSettings',
  addForumKind: 'addForumKind',
  delForumKind: 'delForumKind',
  visitForumCategorySettings: 'visitForumCategorySettings',
  modifyForumCategory: 'modifyForumCategory',
  addForumCategory: 'addForumCategory',
  removeForumCategory: 'removeForumCategory',
  visitForumPermissionSettings: 'visitForumPermissionSettings',
  modifyForumPermission: 'modifyForumPermission',
  forumScoreSettings: 'forumScoreSettings',
  forumReviewSettings: 'forumReviewSettings',
  unSubscribeForum: 'unSubscribeForum',
  subscribeForum: 'subscribeForum',
  visitForumLibrary: 'visitForumLibrary',
  createForumLibrary: 'createForumLibrary',
  visitFundHome: 'visitFundHome',
  visitAddFund: 'visitAddFund',
  visitFundInfo: 'visitFundInfo',
  visitFundBills: 'visitFundBills',
  addFundBill: 'addFundBill',
  visitFundBill: 'visitFundBill',
  modifyFundBill: 'modifyFundBill',
  deleteFundBill: 'deleteFundBill',
  visitAddFundBill: 'visitAddFundBill',
  visitMyFund: 'visitMyFund',
  visitFundBlacklist: 'visitFundBlacklist',
  fundBlacklistPost: 'fundBlacklistPost',
  visitFundObjectList: 'visitFundObjectList',
  addFund: 'addFund',
  deleteFundObject: 'deleteFundObject',
  visitFundObjectHome: 'visitFundObjectHome',
  singleFundSettings: 'singleFundSettings',
  agreeFundTerms: 'agreeFundTerms',
  submitFundApplicationForm: 'submitFundApplicationForm',
  visitFundObjectBills: 'visitFundObjectBills',
  fundDonation: 'fundDonation',
  visitHistoryFundList: 'visitHistoryFundList',
  visitHistoryFund: 'visitHistoryFund',
  visitDisabledFundList: 'visitDisabledFundList',
  visitUnSubmitFundApplicationList: 'visitUnSubmitFundApplicationList',
  visitGiveUpFundApplicationList: 'visitGiveUpFundApplicationList',
  visitFundApplicationForm: 'visitFundApplicationForm',
  restoreFundApplicationForm: 'restoreFundApplicationForm',
  modifyApplicationForm: 'modifyApplicationForm',
  deleteApplicationForm: 'deleteApplicationForm',
  visitFundApplicationReport: 'visitFundApplicationReport',
  addFundApplicationReport: 'addFundApplicationReport',
  visitFundApplicationReportAudit: 'visitFundApplicationReportAudit',
  submitFundApplicationReportAudit: 'submitFundApplicationReportAudit',
  deleteFundApplicationReport: 'deleteFundApplicationReport',
  visitFundApplicationFormSettings: 'visitFundApplicationFormSettings',
  visitFundApplicationAudit: 'visitFundApplicationAudit',
  submitFundApplicationAudit: 'submitFundApplicationAudit',
  stopFundApplicationForm: 'stopFundApplicationForm',
  timeoutFundApplicationForm: 'timeoutFundApplicationForm',
  withdrawFundApplicationForm: 'withdrawFundApplicationForm',
  refundFundApplicationForm: 'refundFundApplicationForm',
  modifyFundApplicationMember: 'modifyFundApplicationMember',
  submitFundApplicationVote: 'submitFundApplicationVote',
  visitFundApplicationComplete: 'visitFundApplicationComplete',
  submitFundApplicationComplete: 'submitFundApplicationComplete',
  visitFundApplicationCompleteAudit: 'visitFundApplicationCompleteAudit',
  submitFundApplicationCompleteAudit: 'submitFundApplicationCompleteAudit',
  visitFundApplicationRemittance: 'visitFundApplicationRemittance',
  submitFundApplicationRemittance: 'submitFundApplicationRemittance',
  visitFundApplyRemittance: 'visitFundApplyRemittance',
  submitFundApplyRemittance: 'submitFundApplyRemittance',
  confirmationFundRemittance: 'confirmationFundRemittance',
  fundApplicationFormExcellent: 'fundApplicationFormExcellent',
  modifyFundApplicationFormStatus: 'modifyFundApplicationFormStatus',
  fundApplicationFormRefund: 'fundApplicationFormRefund',
  visitLogin: 'visitLogin',
  submitLogin: 'submitLogin',
  logout: 'logout',
  getPersonalResources: 'getPersonalResources',
  getPersonalMedia: 'getPersonalMedia',
  getPersonalLifePhotos: 'getPersonalLifePhotos',
  column_get: 'column_get',
  column_article_get: 'column_article_get',
  column_single_get: 'column_single_get',
  column_single_settings: 'column_single_settings',
  homeHotColumn: 'homeHotColumn',
  homeToppedColumn: 'homeToppedColumn',
  column_single_settings_post: 'column_single_settings_post',
  column_single_subscribe: 'column_single_subscribe',
  column_single_settings_contribute: 'column_single_settings_contribute',
  column_single_settings_transfer: 'column_single_settings_transfer',
  column_single_settings_close: 'column_single_settings_close',
  column_single_settings_page: 'column_single_settings_page',
  column_single_settings_fans: 'column_single_settings_fans',
  column_single_contribute: 'column_single_contribute',
  column_single_status: 'column_single_status',
  column_single_disabled: 'column_single_disabled',
  column_single_contact: 'column_single_contact',
  column_single_page: 'column_single_page',
  visitPost: 'visitPost',
  modifyPost: 'modifyPost',
  getPostOption: 'getPostOption',
  quotePost: 'quotePost',
  cancelXsf: 'cancelXsf',
  creditKcb: 'creditKcb',
  modifyKcbRecordReason: 'modifyKcbRecordReason',
  visitPostHistory: 'visitPostHistory',
  disableHistories: 'disableHistories',
  rollbackPost: 'rollbackPost',
  digestPost: 'digestPost',
  unDigestPost: 'unDigestPost',
  'post-vote-up': 'post-vote-up',
  'post-vote-down': 'post-vote-down',
  postWarningPost: 'postWarningPost',
  postWarningPatch: 'postWarningPatch',
  getPostAuthor: 'getPostAuthor',
  anonymousPost: 'anonymousPost',
  modifyPostNoticeContent: 'modifyPostNoticeContent',
  disablePostNotice: 'disablePostNotice',
  getPostNotices: 'getPostNotices',
  topPost: 'topPost',
  getPostResources: 'getPostResources',
  hidePost: 'hidePost',
  getPostComments: 'getPostComments',
  postCommentControl: 'postCommentControl',
  visitAddProblem: 'visitAddProblem',
  submitProblem: 'submitProblem',
  visitProblemList: 'visitProblemList',
  visitProblem: 'visitProblem',
  modifyProblem: 'modifyProblem',
  deleteProblem: 'deleteProblem',
  addProblemsType: 'addProblemsType',
  modifyProblemsType: 'modifyProblemsType',
  deleteProblemsType: 'deleteProblemsType',
  visitMobileRegister: 'visitMobileRegister',
  submitRegister: 'submitRegister',
  getRegisterCode: 'getRegisterCode',
  registerSubscribe: 'registerSubscribe',
  search: 'search',
  sendChangeMobileMessage: 'sendChangeMobileMessage',
  sendBindMobileMessage: 'sendBindMobileMessage',
  sendRegisterMessage: 'sendRegisterMessage',
  sendGetBackPasswordMessage: 'sendGetBackPasswordMessage',
  sendLoginMessage: 'sendLoginMessage',
  sendWithdrawMessage: 'sendWithdrawMessage',
  sendDestroyMessage: 'sendDestroyMessage',
  sendUnbindMobileMessage: 'sendUnbindMobileMessage',
  sendPhoneMessage: 'sendPhoneMessage',
  getThreadByQuery: 'getThreadByQuery',
  visitThread: 'visitThread',
  postToThread: 'postToThread',
  editThreadPostOrder: 'editThreadPostOrder',
  modifyReasonThreadReturn: 'modifyReasonThreadReturn',
  collectThread: 'collectThread',
  toppedThread: 'toppedThread',
  unToppedThread: 'unToppedThread',
  pushThread: 'pushThread',
  homeTop: 'homeTop',
  homeAd: 'homeAd',
  closeThread: 'closeThread',
  openThread: 'openThread',
  subThread: 'subThread',
  unSubThread: 'unSubThread',
  searchUser: 'searchUser',
  visitUserCard: 'visitUserCard',
  getUserHomeCard: 'getUserHomeCard',
  userProfile: 'userProfile',
  getUserHomeInfo: 'getUserHomeInfo',
  visitVerifiedUpload: 'visitVerifiedUpload',
  visitSelfProblems: 'visitSelfProblems',
  visitSelfProblemDetails: 'visitSelfProblemDetails',
  clearUserInfo: 'clearUserInfo',
  hideUserHome: 'hideUserHome',
  unBannedUser: 'unBannedUser',
  bannedUser: 'bannedUser',
  visitUserTransaction: 'visitUserTransaction',
  visitUserSubThreads: 'visitUserSubThreads',
  visitUserInfoSettings: 'visitUserInfoSettings',
  modifyUsername: 'modifyUsername',
  modifyUserInfo: 'modifyUserInfo',
  visitUserResumeSettings: 'visitUserResumeSettings',
  modifyUserResume: 'modifyUserResume',
  visitUserTransactionSettings: 'visitUserTransactionSettings',
  modifyUserTransaction: 'modifyUserTransaction',
  visitUserSocialSettings: 'visitUserSocialSettings',
  modifyUserSocial: 'modifyUserSocial',
  visitUserPhotoSettings: 'visitUserPhotoSettings',
  modifyUserPhotoSettings: 'modifyUserPhotoSettings',
  visitUserWaterSettings: 'visitUserWaterSettings',
  modifyUserWaterSettings: 'modifyUserWaterSettings',
  visitUserCertPhotoSettings: 'visitUserCertPhotoSettings',
  modifyUserCertPhotoSettings: 'modifyUserCertPhotoSettings',
  visitPasswordSettings: 'visitPasswordSettings',
  modifyPassword: 'modifyPassword',
  visitMobileSettings: 'visitMobileSettings',
  modifyMobile: 'modifyMobile',
  unbindMobile: 'unbindMobile',
  bindMobile: 'bindMobile',
  applyToChangeUnusedPhoneNumber: 'applyToChangeUnusedPhoneNumber',
  visitEmailSettings: 'visitEmailSettings',
  sendEmail: 'sendEmail',
  bindEmail: 'bindEmail',
  changeEmail: 'changeEmail',
  unbindEmail: 'unbindEmail',
  visitVerifySettings: 'visitVerifySettings',
  verify3VideoUpload: 'verify3VideoUpload',
  verify2ImageUpload: 'verify2ImageUpload',
  visitUserRedEnvelopeSettings: 'visitUserRedEnvelopeSettings',
  modifyUserRedEnvelopeSettings: 'modifyUserRedEnvelopeSettings',
  userDisplaySettings: 'userDisplaySettings',
  userBindAlipayAccounts: 'userBindAlipayAccounts',
  userBindBankAccounts: 'userBindBankAccounts',
  visitDraftList: 'visitDraftList',
  addDraft: 'addDraft',
  deleteDraft: 'deleteDraft',
  subscribeUser: 'subscribeUser',
  unSubscribeUser: 'unSubscribeUser',
  visitUserBills: 'visitUserBills',
  transferKcbToUser: 'transferKcbToUser',
  destroyAccount: 'destroyAccount',
  violationRecord: 'violationRecord',
  applyForum: 'applyForum',
  applyForumInvitation: 'applyForumInvitation',
  phoneVerify: 'phoneVerify',
  sendPhoneVerifyCode: 'sendPhoneVerifyCode',
  getUserOtherAccount: 'getUserOtherAccount',
  editorAutoUploadImage: 'editorAutoUploadImage',
  visitFindPasswordByMobile: 'visitFindPasswordByMobile',
  findPasswordVerifyMobile: 'findPasswordVerifyMobile',
  modifyPasswordByMobile: 'modifyPasswordByMobile',
  visitFindPasswordByEmail: 'visitFindPasswordByEmail',
  findPasswordSendVerifyEmail: 'findPasswordSendVerifyEmail',
  modifyPasswordByEmail: 'modifyPasswordByEmail',
  findPasswordVerifyEmail: 'findPasswordVerifyEmail',
  faq: 'faq',
  visitAppDownload: 'visitAppDownload',
  APPUpgrade: 'APPUpgrade',
  selectLocation: 'selectLocation',
  APPcheckout: 'APPcheckout',
  APPGetNav: 'APPGetNav',
  APPGetMy: 'APPGetMy',
  APPGetAccountInfo: 'APPGetAccountInfo',
  appGetDownload: 'appGetDownload',
  appVisitProfile: 'appVisitProfile',
  APPgetScoreChange: 'APPgetScoreChange',
  downloadApp: 'downloadApp',
  visitActivityIndex: 'visitActivityIndex',
  blockCurrentActivity: 'blockCurrentActivity',
  unBlockCurrentActivity: 'unBlockCurrentActivity',
  activityReleaseIndex: 'activityReleaseIndex',
  activityReleasePost: 'activityReleasePost',
  activityListIndex: 'activityListIndex',
  visitActivitySingle: 'visitActivitySingle',
  activityApplyPost: 'activityApplyPost',
  cancelActivityApply: 'cancelActivityApply',
  activityEditPost: 'activityEditPost',
  myActivityApplyIndex: 'myActivityApplyIndex',
  myActivityReleaseIndex: 'myActivityReleaseIndex',
  postToActivity: 'postToActivity',
  getActivityModify: 'getActivityModify',
  postActivityModify: 'postActivityModify',
  delActivityModify: 'delActivityModify',
  sendActivityMessage: 'sendActivityMessage',
  getShareToken: 'getShareToken',
  visitShareLink: 'visitShareLink',
  visitMessagePage: 'visitMessagePage',
  messageGetData: 'messageGetData',
  messageBlackList: 'messageBlackList',
  getFriendsApplication: 'getFriendsApplication',
  messagePostData: 'messagePostData',
  sendMessageToUser: 'sendMessageToUser',
  getMessageFile: 'getMessageFile',
  modifyMessageSettings: 'modifyMessageSettings',
  modifyMessageStatus: 'modifyMessageStatus',
  userWithdrawnMessage: 'userWithdrawnMessage',
  messageSearchUser: 'messageSearchUser',
  messageDataGet: 'messageDataGet',
  sendAnApplicationToAddAFriend: 'sendAnApplicationToAddAFriend',
  messageCategory: 'messageCategory',
  getFriendNotePicture: 'getFriendNotePicture',
  visitHomeSubscription: 'visitHomeSubscription',
  visitLottery: 'visitLottery',
  getRedEnvelope: 'getRedEnvelope',
  closeRedEnvelope: 'closeRedEnvelope',
  visitShopIndex: 'visitShopIndex',
  visitProductSingle: 'visitProductSingle',
  pushGoodsToHome: 'pushGoodsToHome',
  changeProductParams: 'changeProductParams',
  banSaleProductParams: 'banSaleProductParams',
  visitManageRouter: 'visitManageRouter',
  visitShopOrderIndex: 'visitShopOrderIndex',
  modifyStoreInfo: 'modifyStoreInfo',
  visitShelfIndex: 'visitShelfIndex',
  productToShelf: 'productToShelf',
  visitManageHome: 'visitManageHome',
  visitManageIndex: 'visitManageIndex',
  visitStoreInfoIndex: 'visitStoreInfoIndex',
  visitFreightTemplate: 'visitFreightTemplate',
  saveFreightTemplate: 'saveFreightTemplate',
  modifyStoreDecorationSign: 'modifyStoreDecorationSign',
  modifyStoreDecorationService: 'modifyStoreDecorationService',
  modifyStoreDecorationSearch: 'modifyStoreDecorationSearch',
  visitFeaturedProductList: 'visitFeaturedProductList',
  modifyStoreDecorationFeatured: 'modifyStoreDecorationFeatured',
  addStoreClassFeatured: 'addStoreClassFeatured',
  delStoreClassFeatured: 'delStoreClassFeatured',
  getStoreSingleClassify: 'getStoreSingleClassify',
  addStoreSingleClassify: 'addStoreSingleClassify',
  visitStoreDecorationIndex: 'visitStoreDecorationIndex',
  modifyStoreDecoration: 'modifyStoreDecoration',
  visitShopClassifyIndex: 'visitShopClassifyIndex',
  addStoreClassify: 'addStoreClassify',
  delStoreClassify: 'delStoreClassify',
  sendGoods: 'sendGoods',
  editGoodsLogositics: 'editGoodsLogositics',
  sendGoodsNoLog: 'sendGoodsNoLog',
  editOrder: 'editOrder',
  editOrderTrackNumber: 'editOrderTrackNumber',
  visitStoreOrderDetail: 'visitStoreOrderDetail',
  visitStoreOrderRefund: 'visitStoreOrderRefund',
  submitStoreOrderRefund: 'submitStoreOrderRefund',
  visitStoreOrderLogositics: 'visitStoreOrderLogositics',
  storeCancelOrder: 'storeCancelOrder',
  editSellMessage: 'editSellMessage',
  editCostRecord: 'editCostRecord',
  editOrderPrice: 'editOrderPrice',
  orderListToExcel: 'orderListToExcel',
  visitStoreGoodsList: 'visitStoreGoodsList',
  visitStoreGoodsParamEdit: 'visitStoreGoodsParamEdit',
  submitEditToParam: 'submitEditToParam',
  visitStoreGoodsProductEdit: 'visitStoreGoodsProductEdit',
  submitEditToProduct: 'submitEditToProduct',
  productShelfRightNow: 'productShelfRightNow',
  productStopSale: 'productStopSale',
  productGoonSale: 'productGoonSale',
  visitOpenStoreIndex: 'visitOpenStoreIndex',
  openStoreApply: 'openStoreApply',
  visitStoreIndex: 'visitStoreIndex',
  addProductToCart: 'addProductToCart',
  visitShopCart: 'visitShopCart',
  modifyCartData: 'modifyCartData',
  visitShopBill: 'visitShopBill',
  submitShopBill: 'submitShopBill',
  billParamAddOne: 'billParamAddOne',
  billParamPlusOne: 'billParamPlusOne',
  visitUserOrder: 'visitUserOrder',
  submitToPay: 'submitToPay',
  visitUserOrderRefund: 'visitUserOrderRefund',
  visitOrderLogistics: 'visitOrderLogistics',
  confirmOrderReceipt: 'confirmOrderReceipt',
  visitSingleOrderDetail: 'visitSingleOrderDetail',
  modifyShopOrderDeliveryInfo: 'modifyShopOrderDeliveryInfo',
  visitShopPay: 'visitShopPay',
  kcbPay: 'kcbPay',
  getAlipayUrl: 'getAlipayUrl',
  userApplyRefund: 'userApplyRefund',
  shopUploadCert: 'shopUploadCert',
  saveShopCerts: 'saveShopCerts',
  shopGetCert: 'shopGetCert',
  shopDeleteCert: 'shopDeleteCert',
  saveNewEditPicture: 'saveNewEditPicture',
  getOriginId: 'getOriginId',
  visitProtocol: 'visitProtocol',
  accountRecharge: 'accountRecharge',
  rechargePost: 'rechargePost',
  accountWithdraw: 'accountWithdraw',
  accountExchange: 'accountExchange',
  visitUserContribute: 'visitUserContribute',
  account_subscribe: 'account_subscribe',
  complaintGet: 'complaintGet',
  complaintPost: 'complaintPost',
  complaintResolvePost: 'complaintResolvePost',
  review: 'review',
  column_apply: 'column_apply',
  getColumnInfo: 'getColumnInfo',
  columnEditor: 'columnEditor',
  moveThreads: 'moveThreads',
  movePostsToDraft: 'movePostsToDraft',
  movePostsToRecycle: 'movePostsToRecycle',
  unblockPosts: 'unblockPosts',
  survey_get: 'survey_get',
  survey_post: 'survey_post',
  survey_single_get: 'survey_single_get',
  survey_single_post: 'survey_single_post',
  getLibraryInfo: 'getLibraryInfo',
  modifyLibraryFolder: 'modifyLibraryFolder',
  libraryUpload: 'libraryUpload',
  createLibraryFolder: 'createLibraryFolder',
  moveLibraryFolder: 'moveLibraryFolder',
  deleteLibraryFolder: 'deleteLibraryFolder',
  getLibraryLogs: 'getLibraryLogs',
  pdfReader: 'pdfReader',
  stickerCenter: 'stickerCenter',
  modifySticker: 'modifySticker',
  getSticker: 'getSticker',
  getSharedStickers: 'getSharedStickers',
  viewNote: 'viewNote',
  addNote: 'addNote',
  deleteNote: 'deleteNote',
  modifyNote: 'modifyNote',
  visitToolsList: 'visitToolsList',
  visitTool: 'visitTool',
  uploadTool: 'uploadTool',
  updateTool: 'updateTool',
  deleteTool: 'deleteTool',
  hideTool: 'hideTool',
  enableSiteTools: 'enableSiteTools',
  ipinfo: 'ipinfo',
  checkBlacklist: 'checkBlacklist',
  addUserToBlacklist: 'addUserToBlacklist',
  removeUserFromBlacklist: 'removeUserFromBlacklist',
  getAttachment: 'getAttachment',
  getVerifications: 'getVerifications',
  receiveWeChatPaymentInfo: 'receiveWeChatPaymentInfo',
  postWeChatPayInfo: 'postWeChatPayInfo',
  receiveAliPayPaymentInfo: 'receiveAliPayPaymentInfo',
  postAliPayInfo: 'postAliPayInfo',
  linkToTarget: 'linkToTarget',
  reportLinkToTarget: 'reportLinkToTarget',
  visitCommunity: 'visitCommunity',
  getWatermark: 'getWatermark',
  getAppsWatermark: 'getAppsWatermark',
  getSiteSpecific: 'getSiteSpecific',
  creationCenter: 'creationCenter',
  creationCenterDeleteList: 'creationCenterDeleteList',
  creationCenterMoveList: 'creationCenterMoveList',
  creationCenterAddList: 'creationCenterAddList',
  publishArticle: 'publishArticle',
  publishMoment: 'publishMoment',
  publishMomentComment: 'publishMomentComment',
  PIMPublic: 'PIMPublic',
  test: 'test',
  getLeftDrawData: 'getLeftDrawData',
  getUserDrawData: 'getUserDrawData',
  getUserNavData: 'getUserNavData',
  mathJax: 'mathJax',
  getBook: 'getBook',
  bookInvitation: 'bookInvitation',
  resourceCategory: 'resourceCategory',
  publishComment: 'publishComment',
  getComments: 'getComments',
  modifyComment: 'modifyComment',
  deleteComment: 'deleteComment',
  disabledComment: 'disabledComment',
  getCommentPermission: 'getCommentPermission',
  getCommentIpInfo: 'getCommentIpInfo',
  digestComment: 'digestComment',
  unDigestComment: 'unDigestComment',
  visitZoneArticle: 'visitZoneArticle',
  manageZoneArticleCategory: 'manageZoneArticleCategory',
  visitZoneSingleMoment: 'visitZoneSingleMoment',
  zoneMomentVote: 'zoneMomentVote',
  getZoneMomentOption: 'getZoneMomentOption',
  getZoneMomentComments: 'getZoneMomentComments',
  deleteZoneMomentComment: 'deleteZoneMomentComment',
  zoneMomentCommentVote: 'zoneMomentCommentVote',
  getZoneMomentCommentOptions: 'getZoneMomentCommentOptions',
  deleteArticle: 'deleteArticle',
  getArticleOptions: 'getArticleOptions',
  unblockArticle: 'unblockArticle',
  deleteArticleDraft: 'deleteArticleDraft',
  collectionArticle: 'collectionArticle',
  digestArticle: 'digestArticle',
  unDigestArticle: 'unDigestArticle',
  deleteMoment: 'deleteMoment',
  managementMoment: 'managementMoment',
  getMomentOption: 'getMomentOption',
  getMomentIpInfo: 'getMomentIpInfo',
  getCreditSettings: 'getCreditSettings',
  getDigestSettings: 'getDigestSettings',
  OAuthAuthentication: 'OAuthAuthentication',
  getUserArticles: 'getUserArticles',
  columnManage: 'columnManage',
  getThreadCategories: 'getThreadCategories',
  manageQuestionTags: 'manageQuestionTags',
};

const Operations = { ...DynamicOperations, ...FixedOperations };

module.exports = {
  Operations,
  DynamicOperations,
  FixedOperations,
};
