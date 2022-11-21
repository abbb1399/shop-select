import axios from "axios";

export default {
  // 사이즈, 색상
  // https://apigen-server.herokuapp.com/api/621f2588d8d85b8d78eb3e64

  // 동물 선택, 과일 선택, 포장 선택
  // https://apigen-server.herokuapp.com/api/62419aa64139ba24abb709e8

  async fetchItem(context) {
    try {
      const { data } = await axios.get(
        "https://apigen-server.herokuapp.com/api/62419aa64139ba24abb709e8"
      );

      context.commit("setItem", data.data);
    } catch (e) {
      console.log(e);
    }
  },
};
