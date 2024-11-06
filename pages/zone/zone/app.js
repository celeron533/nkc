import { getDataById } from '../../lib/js/dataConversion';
import Home from '../../lib/vue/zone/views/Home';
import MomentDetail from '../../lib/vue/zone/views/MomentDetail';
import Vuex from 'vuex';
import EditorPage from '../../lib/vue/zone/views/Editor.vue';
import EditorHistoryPage from '../../lib/vue/zone/views/EditorHistory.vue';

Vue.use(Vuex);

const zoneElementId = 'zoneApp';
$(function () {
  const element = document.getElementById(zoneElementId);
  if (element) {
    initZoneVueApp();
  }
});

function initZoneVueApp() {
  const {
    momentsData,
    permissions,
    subUid,
    tab,
    zoneTab,
    type,
    paging,
    zoneTypes,
    articlesPanelData,
    latestZoneArticlePanelStyle,
    currentPage,
  } = getDataById('data');
  const store = new Vuex.Store({
    state: {
      momentsData,
      permissions,
      subUid,
      tab,
      zoneTab,
      type,
      paging,
      zoneTypes,
      articlesPanelData,
      latestZoneArticlePanelStyle,
      currentPage,
      savePosition: {
        y: 0,
        x: 0,
      },
    },
    mutations: {
      setMomentsData(state, data) {
        state.momentsData = data;
      },
      setArticlesPanelData(state, data) {
        state.articlesPanelData = data;
      },
      setLatestZoneArticlePanelStyle(state, data) {
        state.latestZoneArticlePanelStyle = data;
      },
      setPaging(state, paging) {
        state.paging = paging;
      },
      setTab(state, tab) {
        state.tab = tab;
      },
      setType(state, type) {
        state.type = type;
      },
      setPermissions(state, p) {
        state.permissions = p;
      },
      setZoneTab(state, zoneTab) {
        state.zoneTab = zoneTab;
      },
      setZoneTypes(state, zoneTypes) {
        state.zoneTypes = zoneTypes;
      },
      setSavePosition(state, position) {
        state.savePosition = position;
      },
    },
  });
  // 初始化路由信息
  const routes = [
    {
      name: 'Zone',
      path: '/z',
      component: Home,
    },
    {
      name: 'MomentDetail',
      path: '/z/m/:mid',
      component: MomentDetail,
    },
    {
      name: 'MomentEditor',
      path: '/z/editor/rich',
      component: EditorPage,
    },
    {
      name: 'MomentEditorHistory',
      path: '/z/editor/rich/history',
      component: EditorHistoryPage,
    },
  ];
  // 防止路由重复点击报错
  const originalPush = VueRouter.prototype.push;
  const originalReplace = VueRouter.prototype.replace;
  VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
  };
  VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch((err) => err);
  };

  const router = new VueRouter({
    mode: 'history',
    routes,
    scrollBehavior(to, from, savePosition) {
      if (savePosition) {
        // window.scrollTo({
        //   top: savePosition.y,
        //   left: savePosition.x,
        //   behavior: 'smooth',
        // });
        return savePosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
  });
  router.beforeEach((to, from, next) => {
    if (to.name === 'MomentDetail' && from.name === 'Zone') {
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      store.commit('setSavePosition', {
        mid: '',
        x: 0,
        y: scrollPosition,
      });
    }
    next();
  });
  router.afterEach((to, from) => {
    let title = '电波 - 科创网';
    if (to.name === 'MomentDetail') {
      title = '电文详情';
    }
    document.title = title;
  });
  const app = new Vue({
    el: `#${zoneElementId}`,
    router,
    store,
    data: {},
    computed: {},
  });
}
