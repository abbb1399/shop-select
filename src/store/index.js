import { createStore } from "vuex";

import itemModule from "./item/index.js";

const store = createStore({
  modules: {
    item: itemModule,
  },
});

export default store;
