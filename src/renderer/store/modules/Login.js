const state = {
  isLogin: false,
  token: null,
  role: null
};

const mutations = {
  LOGIN_SUCCESS(state, action) {
    console.log(state, action.payload);
    state.isLogin = true;
  }
};

const actions = {
  login({ commit }, p) {
    // do something async
    commit("LOGIN_SUCCESS", p);
  }
};
export default {
  state,
  mutations,
  actions
};
