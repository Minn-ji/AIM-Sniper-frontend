<template lang="">
    <v-container max-width="800">
        <br>
        <h2>작성된 설문 조사 확인</h2><br><br>
        <v-data-table
            v-model:items-per-page="perPage"
            :headers="headerTitle"
            :items="pagedItems"
            v-model:pagination="pagination"
            class="elevation-1"
            @click:row="readRow"
            item-value="surveyId"/>
        <v-pagination
            v-model="pagination.page"
            :length="Math.ceil(surveyTitleList.length / perPage)"
            color="primary"
            @input="updateItems"/>
        <v-container align="end">
            <v-btn
                class="ml-2"
                color="primary"
                @click="goToSurveyRegisterPage">설문조사 만들기
            </v-btn>
        </v-container>
    </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import router from "@/router";
const surveyModule = 'surveyModule'

export default {
    data () {
        return {
            headerTitle: [
                {
                    title: 'No',
                    align: 'start',
                    sortable: true,
                    key: 'surveyId',
                    width: '50px'
                },
                { surveyTitle: '제목', align: 'start', key: 'surveyTitle' },
            ],
            perPage: 5,
            pagination: {
                page: 1,
            },
        }
    },
    computed: {
        ...mapState(surveyModule, ['surveyTitleList']),
        pagedItems () {
            const startIdx = (this.pagination.page - 1) * this.perPage
            const endIdx = startIdx + this.perPage
            return this.surveyTitleList.slice(startIdx, endIdx)
        }
    },
    mounted () {
        this.requestSurveyListToDjango()
    },
    methods: {
        ...mapActions(surveyModule, ['requestSurveyListToDjango']),
        readRow (event, { item }) {
            this.$router.push({
                name: 'SurveyReadPage',
                params: { randomString: item['randomString'].toString() }
            })
        },
        goToSurveyRegisterPage() {
           router.push("/survey/register");
        },

        
    
    },
}
</script>