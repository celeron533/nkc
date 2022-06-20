import {getDataById} from "../../lib/js/dataConversion";
import Moments from '../../lib/vue/zone/Moments';
import MomentEditor from "../../lib/vue/zone/MomentEditor";
import {visitUrl} from "../../lib/js/pageSwitch";
import {getState} from "../../lib/js/state";

const {uid} = getState();
const momentElementId = 'latestZoneMoments';

$(function() {
  const element = document.getElementById(momentElementId);
  if(element) {
    initMomentVueApp();
  }
});


function initMomentVueApp() {
  const {momentsData, permissions} = getDataById('data');
  const app = new Vue({
    el: `#${momentElementId}`,
    components: {
      moments: Moments,
      'moment-editor': MomentEditor
    },
    data: {
      momentsData,
      permissions,
      logged: !!uid,
    },
    methods: {
      published() {
        visitUrl(`/n/zone`);
      }
    }
  });
}
