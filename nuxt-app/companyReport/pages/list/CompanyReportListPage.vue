<template>
  <div class="background-image">
    <v-container class="custom-padding">
      <div>
        <v-row>
          <v-col cols="12">
            <h2 class="section-title">전체 보고서</h2>
          </v-col>
        </v-row>
        <!-- 기업 필터 -->
        <v-row>
          <v-col cols="12">
            <p @click="toggleFilter" class="filter-text">
              <v-icon left class="filter-icon">mdi-filter-variant</v-icon>
              기업 필터 <v-icon>mdi-chevron-down</v-icon>
            </p>
          </v-col>
        </v-row>
        <!-- 필터가 열리고 닫히는 부분 -->
        <v-slide-y-transition>
          <v-row v-show="showFilterTags" class="filter-tags-container">
            <v-col cols="12">
              <v-row class="align-center mb-4">
                <v-col cols="1" class="filter-group-title">
                  <strong>카테고리</strong>
                </v-col>
                <v-col cols="6">
                  <v-chip-group v-if="!resetCategory" v-model="selectedCategories" class="category-select-group" multiple column>
                    <v-btn @click="clearSelectedCategory" class="reset-chip" style="background-color:white; border-radius: 20px; height: 33px; margin-right: 10px; margin-top: 3px; box-shadow: none; border: 1px solid lightgray;">
                      <v-icon left>mdi-refresh</v-icon>
                      초기화
                    </v-btn>
                    <v-chip
                      v-for="(category, index) in categories"
                      :key="index"
                      :value="category"
                      outlined
                      :class="{
                        'chip-selected': selectedCategories.includes(category),
                      }"
                      class="category-chip"
                    >
                      {{ category }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
              <!-- 키워드 선택 제목과 키워드 필터를 같은 열에 배치 -->
              <v-row class="align-center mb-4">
                <v-col cols="1" class="filter-group-title">
                  <strong>키워드</strong>
                </v-col>
                <v-col cols="6">
                  <v-chip-group v-if="!resetChips" v-model="selectedKeywords" multiple column>
                    <v-btn @click="clearSelectedKeywords" class="reset-chip" style="background-color:white; border-radius: 20px; height: 33px; margin-right: 10px; margin-top: 3px; box-shadow: none; border: 1px solid lightgray">
                      <v-icon left>mdi-refresh</v-icon>
                      초기화
                    </v-btn>
                    <v-chip
                      v-for="(keyword, index) in keywords"
                      :key="index"
                      :value="keyword"
                      outlined
                      :class="{
                        'chip-selected': selectedKeywords.includes(keyword),
                      }"
                      class="filter-chip"
                    >
                      {{ keyword }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
              <!-- 카테고리 선택 제목과 카테고리 필터를 같은 열에 배치 -->
            </v-col>
          </v-row>
        </v-slide-y-transition>
        <!-- 검색 입력 -->
        <v-row class="my-8" justify="center">
          <v-col cols="10">
            <div class="search">
              <input
                type="text"
                class="search-input"
                v-model="searchQuery"
                placeholder="검색하고 싶은 기업명을 입력하세요"
              />
              <button class="search-button" @click="onSearch"></button>
            </div>
          </v-col>
        </v-row>
      </div>
      <!-- 기업 리스트업 -->
      <v-row
        class="companyReport-container"
        v-if="allCompanyReportListVisible && paginatedCompanyReportList.length > 0"
      >
        <v-col
          v-for="(companyReport, index) in paginatedCompanyReportList"
          :key="index"
          cols="12"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card
            class="companyReport-card"
            @click="goToCompanyReportReadPage(companyReport.companyReportId, companyReport.companyReportName)"
            hover
            outlined
          >
            <div class="companyReport-img-container">
              <v-img
                class="companyReport-scaled-img"
                :src="getImageUrl(companyReport.companyReportTitleImage)"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular indeterminate color="grey lighten-5" />
                  </v-row>
                </template>
              </v-img>
            </div>
            <v-card-title class="companyReport-title">{{
              companyReport.companyReportName
            }}</v-card-title>
            <v-card-subtitle class="companyReport-price"
              >{{ companyReport.companyReportPrice }}원</v-card-subtitle
            >
          </v-card>
        </v-col>
      </v-row>
      <!-- 로딩 화면 -->
      <v-row v-else-if="allCompanyReportListVisible" class="report-loader" justify="center" align="center">
        <v-col cols="auto">
          <div class="typewriter ml-10">
            <div class="slide"><i></i></div>
            <div class="paper"></div>
            <div class="keyboard"></div>
          </div>
          <p class="text-center mt-5">기업 요약을 만들고 있습니다</p>
        </v-col>
      </v-row>
      <!-- 페이지네이션 -->
      <v-row v-if="filteredCompanyReportList.length > itemsPerPage">
        <v-col cols="12" class="text-center">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(filteredCompanyReportList.length / itemsPerPage)"
            @input="changePage"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCompanyReportStore } from "../../stores/companyReportStore";
import { useAccountStore } from "../../../account/stores/accountStore";
import { useAuthenticationStore } from "../../../authentication/stores/authenticationStore";
import { useGoogleAuthenticationStore } from "../../../googleAuthentication/stores/googleAuthenticationStore";
import { useNaverAuthenticationStore } from "../../../naverAuthentication/stores/naverAuthenticationStore";
import { useUserLogStore } from "../../../userLog/store/userLogStore";

const router = useRouter();
const companyReportStore = useCompanyReportStore();
const userLogStore = useUserLogStore();
const accountStore = useAccountStore();
const authenticationStore = useAuthenticationStore();
const googleAuthenticationStore = useGoogleAuthenticationStore();
const naverAuthenticationStore = useNaverAuthenticationStore();

// 페이지 관련 변수
const currentPage = ref(1);
const itemsPerPage = ref(30);

// 필터링 및 검색 관련 변수
const selectedKeywords = ref([]);
const keywords = ref(["플랫폼", "정보보안", "빅데이터", "소프트웨어", "하드웨어", "클라우드", "컨설팅", "헬스케어", "메타버스", "인프라", "게임", "의료", "AI", "디스플레이", "마케팅/광고", "영상 분석", "네트워크", "금융지원"]);
const categories = ref(["매출액 1조 이상", "매출액 1000억 이상 1조 미만", "매출액 1000억 미만"]);
const selectedCategories = ref([]);
const searchQuery = ref("");
const showFilterTags = ref(false);

// 보고서 관련 변수
const allCompanyReportListVisible = ref(true);
const topN = ref(3);
const topList = ref([]);
const topNCompanyReportList = ref([]);

onMounted(async () => {
  const response = await companyReportStore.requestTopNCompanyReportListToDjango(topN.value);
  topList.value = response.data;

  topNCompanyReportList.value = companyReportStore.companyReportList.filter(
    (companyReport) => {
      return topList.value.some((topId) => topId === companyReport.companyReportId);
    }
  );
});

const filteredCompanyReportList = computed(() => {
  let reports = companyReportStore.companyReportList;

  // 검색어 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    reports = reports.filter((report) => report.companyReportName.toLowerCase().includes(query));
  }

  // 선택된 필터가 없거나 전체 상태일 때는 모든 보고서 반환
  if (selectedCategories.value.length === 0 && selectedKeywords.value.length === 0) {
    return reports;
  }

  reports.forEach((report) => {
    let categoryMatchCount = 0;
    let keywordMatchCount = 0;

    // 카테고리 매칭 계산
    if (selectedCategories.value.length > 0 && report.companyReportCategory) {
      const categoryArray = report.companyReportCategory.split(",");
      categoryMatchCount = selectedCategories.value.reduce(
        (count, category) => (categoryArray.includes(category) ? count + 1 : count),
        0
      );
    }

    // 키워드 매칭 계산
    if (selectedKeywords.value.length > 0 && report.keyword) {
      const keywordsArray = report.keyword.split(",");
      keywordMatchCount = selectedKeywords.value.reduce(
        (count, keyword) => (keywordsArray.includes(keyword) ? count + 1 : count),
        0
      );
    }

    report.matchCount = categoryMatchCount + keywordMatchCount;
  });

  // 필터링 로직 적용
  if (selectedCategories.value.length > 0 && selectedKeywords.value.length > 0) {
    // 카테고리와 키워드 모두 선택된 경우
    reports = reports.filter((report) => {
      const categoryArray = report.companyReportCategory ? report.companyReportCategory.split(",") : [];
      const keywordArray = report.keyword ? report.keyword.split(",") : [];
      
      return selectedCategories.value.some(category => categoryArray.includes(category)) &&
             selectedKeywords.value.some(keyword => keywordArray.includes(keyword));
    });
  } else {
    // 카테고리만 선택된 경우
    if (selectedCategories.value.length > 0) {
      reports = reports.filter((report) => {
        const categoryArray = report.companyReportCategory ? report.companyReportCategory.split(",") : [];
        return selectedCategories.value.some(category => categoryArray.includes(category));
      });
    }
    
    // 키워드만 선택된 경우
    if (selectedKeywords.value.length > 0) {
      reports = reports.filter((report) => {
        const keywordArray = report.keyword ? report.keyword.split(",") : [];
        return selectedKeywords.value.some(keyword => keywordArray.includes(keyword));
      });
    }
  }

  return reports.sort((a, b) => b.matchCount - a.matchCount);
});

// 페이지네이션 처리된 보고서 리스트 계산
const paginatedCompanyReportList = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCompanyReportList.value.slice(startIndex, startIndex + itemsPerPage.value);
});

// 필터 토글
function toggleFilter() {
  showFilterTags.value = !showFilterTags.value;
}

const resetChips = ref(false);
const resetCategory = ref(false);

function clearSelectedCategory() {
  if (selectedCategories.value.length == 0) ;

  selectedCategories.value.splice(0, selectedCategories.value.length);
  resetCategory.value = true;
  selectedCategories.value = []
  nextTick(() => {
    selectedCategories.value.splice(0, selectedCategories.value.length);
    resetCategory.value = false;
  });
}

function clearSelectedKeywords() {
  if (selectedKeywords.value.length == 0) ;

  selectedKeywords.value.splice(0, selectedKeywords.value.length);
  resetChips.value = true;
  selectedKeywords.value = []
  nextTick(() => {
    selectedKeywords.value.splice(0, selectedKeywords.value.length);
    resetChips.value = false;
    })
  ;
}

// 페이지 이동
function goToCompanyReportReadPage(companyReportId, companyReportName) {
  router.push({
    path: `/companyReport/read/${companyReportId}`,
    query: { companyReportName: companyReportName },
  });
  
  // 로그인한 일반 사용자의 상품 클릭 수 기록
  const email = sessionStorage.getItem("email");
  const isAdmin = (authenticationStore.isKakaoAdmin || naverAuthenticationStore.isNaverAdmin || googleAuthenticationStore.isGoogleAdmin || accountStore.isNormalAdmin);

  if (email && !isAdmin) {
    userLogStore.requestCountClickToDjango({
      email: email,
      companyReport_id: companyReportId,
      purchase: false,
    });
  }
};

function changePage(page) {
  currentPage.value = page;
}

const getImageUrl = (imageName) => {
  if (!imageName) {
    return new URL(`/assets/images/fixed/AIM_BI_Simple.png`, import.meta.url).href;
  }
  return new URL(`/assets/images/uploadImages/${imageName}`, import.meta.url).href;
};


useHead({
  title: `전자공시시스템(DART) 기반 기업 핵심 정보 분석 | `,
  meta: [
    {
      name: 'description',
      content: '기업의 사업 내용, 공략 포인트, 재무제표, 핵심만 요약했습니다. 전자공시시스템(DART) 기반 기업 핵심 정보 분석 🎯AIM에서 확인해보세요.',
    },
    {
      hid: 'keywords',
      name: 'keywords',
      content: '취업 준비, 면접 준비, 개발자 취업 준비, 개발자 이직 준비, 개발자 자소서, 개발자 취업 사이트, it취업, it 회사, 기업 분석 사이트, 기업 분석 보고서 사이트, 사업 요약, dart 분석, 다트 분석, 재무 분석, 사업 분석, 주사업, 사업 현황, 사업내용, 기업 분석 및 사업 요약, 다트 재무 분석, 사업 분석 및 요약, 기업 분석 사이트, 사업 요약 사이트, 기업 재무 제표 분석 사이트, 기업 타당성 분석, 회사소개, 회사 사업 소개, DART 분석, 지원동기 작성, aim 기업 요약 사이트, 에임 기업 요약 사이트, 에임, 애임, AIM, AIM Sniper, AIM 기업 분석, AIM 기업 요약',
    },
  ],
});
</script>

<style scoped>
.background-image {
  margin-top: 10vh;
}

@font-face {
  font-family: "Pretendard";
  src: url("@/assets/fonts/Pretendard.ttf") format("truetype");
  font-weight: 400;
}

.custom-padding {
  padding-left: 2%;
  padding-right: 2%;
}

.register-btn {
  font-size: 16px;
  background-color: #f5f5f5;
  color: blue !important;
  border: 1px solid #ccc !important;
  box-shadow: none;
  border: 1px solid (109, 109, 109, 0.5);
  text-transform: none;
}

.section-title {
  color: #0a28b0;
  font-family: "Pretendard", sans-serif !important;
  font-weight: bold;
  font-size: 24px;
  margin-left: 10px;
  margin-top: 10px;
}

::v-deep .v-field {
  height: 50px;
  background-color: #83838300 !important;
  color: rgb(37, 47, 133) !important;
  border-radius: 15px 15px 0px 0px !important;
}

.companyReport-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* text-align: center; */
  padding: 12px;
}

.companyReport-card {
  transition: transform 0.2s ease-in-out;
  border-radius: 32px;
  box-shadow: 0 1px 3px rgb(206, 205, 205);
}

.companyReport-card:hover {
  transform: scale(1.05);
}

.companyReport-img-container {
  position: relative;
  width: 100%;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.companyReport-scaled-img {
  width: 20%;
  height: auto;
  transition: transform 0.3s ease; /* 애니메이션 효과 추가 */
  /* border-bottom: 1px */
  padding: 50px;
}

.companyReport-title {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
  padding-top: 0px;
}

.companyReport-price {
  color: #9452ff;
  font-weight: 600;
  margin-left: 10px;
}

.companyReport-image {
  border-bottom: 1px solid #f5f5f5;
}

.section-title {
  margin: 0; /* 기본적인 여백 제거 */
}

.filter-text {
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.filter-text:hover {
  color: #8094f4; /* 필터를 누를 때 색상이 변함 */
}

/* 필터 태그 컨테이너: 불필요한 배경색 제거 */
.filter-tags-container {
  margin-top: 10px;
  padding: 0;
}

/* 필터 칩 스타일링 */
.filter-chip {
  margin: 5px;
  font-size: 14px;
}

.chip-selected {
  background-color: #8094f4; /* 선택된 칩의 배경색을 초록색으로 변경 */
  color: white; /* 텍스트 색상을 하얀색으로 변경 */
}

.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}

.search-input {
  font-family: inherit;
  font-size: inherit;
  background-color: #f4f2f2;
  border: none;
  color: #646464;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  width: 100%;
  transition: all ease-in-out 0.5s;
  margin-right: -2rem;
}

.search-input:hover,
.search-input:focus {
  box-shadow: 0 0 1em #00000013;
}

.search-input:focus {
  outline: none;
  background-color: #f0eeee;
}

.search-input::-webkit-input-placeholder {
  font-weight: 100;
  color: #ccc;
}

.search-input:focus + .search-button {
  background-color: #f0eeee;
}

.search-button {
  border: none;
  background-color: #f4f2f2;
  margin-top: 0.1em;
}

.search-button:hover {
  cursor: pointer;
}

/* From Uiverse.io by Nawsome */ 
.report-loader {
  margin-top: 130px;
  color: #646464;
}

.typewriter {
  --blue: #5C86FF;
  --blue-dark: #275EFE;
  --key: #fff;
  --paper: #EEF0FD;
  --text: #D3D4EC;
  --tool: #FBC56C;
  --duration: 3s;
  position: relative;
  -webkit-animation: bounce05 var(--duration) linear infinite;
  animation: bounce05 var(--duration) linear infinite;
}

.typewriter .slide {
  width: 92px;
  height: 20px;
  border-radius: 3px;
  margin-left: 14px;
  transform: translateX(14px);
  background: linear-gradient(var(--blue), var(--blue-dark));
  -webkit-animation: slide05 var(--duration) ease infinite;
  animation: slide05 var(--duration) ease infinite;
}

.typewriter .slide:before, .typewriter .slide:after,
.typewriter .slide i:before {
  content: "";
  position: absolute;
  background: var(--tool);
}

.typewriter .slide:before {
  width: 2px;
  height: 8px;
  top: 6px;
  left: 100%;
}

.typewriter .slide:after {
  left: 94px;
  top: 3px;
  height: 14px;
  width: 6px;
  border-radius: 3px;
}

.typewriter .slide i {
  display: block;
  position: absolute;
  right: 100%;
  width: 6px;
  height: 4px;
  top: 4px;
  background: var(--tool);
}

.typewriter .slide i:before {
  right: 100%;
  top: -2px;
  width: 4px;
  border-radius: 2px;
  height: 14px;
}

.typewriter .paper {
  position: absolute;
  left: 24px;
  top: -26px;
  width: 40px;
  height: 46px;
  border-radius: 5px;
  background: var(--paper);
  transform: translateY(46px);
  -webkit-animation: paper05 var(--duration) linear infinite;
  animation: paper05 var(--duration) linear infinite;
}

.typewriter .paper:before {
  content: "";
  position: absolute;
  left: 6px;
  right: 6px;
  top: 7px;
  border-radius: 2px;
  height: 4px;
  transform: scaleY(0.8);
  background: var(--text);
  box-shadow: 0 12px 0 var(--text), 0 24px 0 var(--text), 0 36px 0 var(--text);
}

.typewriter .keyboard {
  width: 120px;
  height: 56px;
  margin-top: -10px;
  z-index: 1;
  position: relative;
}

.typewriter .keyboard:before, .typewriter .keyboard:after {
  content: "";
  position: absolute;
}

.typewriter .keyboard:before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 7px;
  background: linear-gradient(135deg, var(--blue), var(--blue-dark));
  transform: perspective(10px) rotateX(2deg);
  transform-origin: 50% 100%;
}

.typewriter .keyboard:after {
  left: 2px;
  top: 25px;
  width: 11px;
  height: 4px;
  border-radius: 2px;
  box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  -webkit-animation: keyboard05 var(--duration) linear infinite;
  animation: keyboard05 var(--duration) linear infinite;
}
/* 카테고리 및 키워드 chip 스타일 */
.category-select-group {
  margin-bottom: 16px;
}

.category-chip {
  margin-right: 8px;
  margin-bottom: 8px;
}

.chip-selected {
  background-color: #1976d2;
  color: white;
}

.filter-chip {
  margin-right: 8px;
  margin-bottom: 8px;
}

@keyframes bounce05 {
  85%, 92%, 100% {
    transform: translateY(0);
  }

  89% {
    transform: translateY(-4px);
  }

  95% {
    transform: translateY(2px);
  }
}

@keyframes slide05 {
  5% {
    transform: translateX(14px);
  }

  15%, 30% {
    transform: translateX(6px);
  }

  40%, 55% {
    transform: translateX(0);
  }

  65%, 70% {
    transform: translateX(-4px);
  }

  80%, 89% {
    transform: translateX(-12px);
  }

  100% {
    transform: translateX(14px);
  }
}

@keyframes paper05 {
  5% {
    transform: translateY(46px);
  }

  20%, 30% {
    transform: translateY(34px);
  }

  40%, 55% {
    transform: translateY(22px);
  }

  65%, 70% {
    transform: translateY(10px);
  }

  80%, 85% {
    transform: translateY(0);
  }

  92%, 100% {
    transform: translateY(46px);
  }
}

@keyframes keyboard05 {
  5%, 12%, 21%, 30%, 39%, 48%, 57%, 66%, 75%, 84% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  9% {
    box-shadow: 15px 2px 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  18% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 2px 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  27% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 12px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  36% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 12px 0 var(--key), 60px 12px 0 var(--key), 68px 12px 0 var(--key), 83px 10px 0 var(--key);
  }

  45% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 2px 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  54% {
    box-shadow: 15px 0 0 var(--key), 30px 2px 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  63% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 12px 0 var(--key);
  }

  72% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 2px 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }

  81% {
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 12px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
  }
}
</style>
