<template>
  <div class="main">
    <base-spinner v-if="loadingStatus" />
    <select
      v-else
      v-for="(group, selectIndex) in newGroupList"
      :key="selectIndex"
      :disabled="group.selectDisabled"
      @change="onChange($event, selectIndex)"
    >
      <option
        v-for="(list, optionIndex) in group.options"
        :key="optionIndex"
        :value="list.item"
        :disabled="titleList.includes(list.item) || list.count === 0"
        :selected="titleList.includes(list.item)"
        ref="optionTag"
      >
        <span>
          {{ list.item }}
        </span>
        <span v-if="!titleList.includes(list.item) && list.count === 0">
          (품절)
        </span>
        <span
          v-if="
            list.count &&
            list.count !== 0 &&
            selectIndex === newGroupList.length - 1
          "
        >
          ({{ list.count }}개 구매가능)
        </span>
      </option>
    </select>
  </div>
</template>

<script>
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
// 깊은 복사를 위해 lodash의 cloneDeep을 사용 했습니다.
import { cloneDeep } from "lodash";

import BaseSpinner from "../components/BaseSpinner.vue";

export default {
  components: { BaseSpinner },
  setup() {
    const store = useStore();
    const groupList = ref([]);
    const optionTag = ref(null);
    const selectOptions = ref([]);
    const loadingStatus = ref(false);

    const newGroupList = computed(() => {
      return groupList.value;
    });

    const titleList = computed(() => {
      return store.getters.getTitleList;
    });

    const insertTitle = () => {
      groupList.value.forEach((li) => {
        li.options = [{ item: li.title }, ...li.options];
      });
    };

    // Select 태그 재귀돌면서 disabled 처리하는 함수
    const disableSelectTag = (groupListLength) => {
      if (groupListLength === 0) {
        return;
      }
      groupList.value[groupListLength].selectDisabled = true;
      disableSelectTag(groupListLength - 1);
    };

    // 데이터세팅
    const setData = (selectIndex, selectedOptionsArray) => {
      const countedGrouListArray = [];
      groupList.value[selectIndex].options.forEach((li) => {
        const obj = {
          item: li.item ? li.item : li,
          count: getCount(
            li,
            selectIndex === 0 ? [li] : [...selectedOptionsArray, li]
          ),
        };
        countedGrouListArray.push(obj);
      });

      groupList.value[selectIndex].options = countedGrouListArray;
    };

    // 카운트 구하는 함수
    const getCount = (list, selectedArray) => {
      if (list.item) {
        return 0;
      }
      const countLi = cloneDeep(store.getters.getCountList);

      const count = countLi.reduce((curCount, li) => {
        // 배열 교집합
        const interArray = li.combination.filter((item) =>
          selectedArray.includes(item)
        );

        if (JSON.stringify(selectedArray) === JSON.stringify(interArray)) {
          curCount = curCount + li.remainCount;
        }

        return curCount;
      }, 0);

      return count;
    };

    // 온체인지
    const onChange = async (e, selectIndex) => {
      const groupListLength = groupList.value.length;

      // 마지막 Select Tag 선택 시
      if (selectIndex === groupListLength - 1) {
        // 최종 선택된 값들 콘솔로 나타냄
        console.log([...selectOptions.value, e.target.value]);

        // groupList 초기화
        groupList.value = cloneDeep(store.getters.getGroupList);
        await nextTick();
        init();

        return;
      }

      // select태그 값을 선택하면, 그다음(selecetedIndex + 1) select태그가 열리게 (disabled를 false로)
      groupList.value[selectIndex + 1].selectDisabled = false;

      // 선택된 값들을 이리저리 바꿀경우 selected 처리
      const num = optionTag.value.findIndex(
        (el) => el.value === groupList.value[selectIndex + 1].title
      );
      optionTag.value[num].selected = true;

      // 선택된 값들을 이리저리 바꿀경우 데이터 초기화 처리
      groupList.value[selectIndex + 1].options = [
        { item: titleList.value[selectIndex + 1] },
        ...store.getters.getGroupList[selectIndex + 1].options,
      ];

      // 선택된값 배열
      selectOptions.value[selectIndex] = e.target.value;

      // 선택된 값들을 이리저리 바꿀경우 disabled 처리 및 선택된값 배열 수정
      if (selectOptions.value.length - 1 !== selectIndex) {
        for (
          let index = groupListLength - 1;
          index > selectIndex + 1;
          index--
        ) {
          groupList.value[index].selectDisabled = true;
          selectOptions.value.splice(index - 1, 1);
        }
      }

      // 다음 Select(index+1) 데이터 세팅
      setData(selectIndex + 1, selectOptions.value);
    };

    const getData = async () => {
      loadingStatus.value = true;
      await store.dispatch("fetchItem");
      groupList.value = cloneDeep(store.getters.getGroupList);

      init();
      loadingStatus.value = false;
    };

    const init = () => {
      disableSelectTag(groupList.value.length - 1);
      insertTitle();
      setData(0);
    };

    getData();

    return {
      newGroupList,
      titleList,
      onChange,
      optionTag,
      loadingStatus,
    };
  },
};
</script>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10rem;

  select {
    outline: none;
    padding: 0.2rem 0;
    font-size: 1rem;
    width: 12.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
