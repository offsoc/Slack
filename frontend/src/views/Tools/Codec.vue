<script lang="ts" setup>
import { QuestionFilled } from '@element-plus/icons-vue'
import Timestamp from './transcode/Timestamp.vue';
import OA from './transcode/OA.vue';
import Transcode from './transcode/Transcode.vue';
import { BrowserOpenURL } from 'wailsjs/runtime/runtime';
import CustomTabs from '@/components/CustomTabs.vue';
</script>

<template>
    <CustomTabs>
        <el-tabs>
            <el-tab-pane label="编码转换" style="height: 100vh;">
                <Transcode></Transcode>
            </el-tab-pane>
            <el-tab-pane label="时间戳">
                <Timestamp></Timestamp>
            </el-tab-pane>
            <el-tab-pane label="OA密码解密">
                <OA></OA>
            </el-tab-pane>
        </el-tabs>
        <template #ctrl>
            <el-button text bg type="primary" @click="BrowserOpenURL('http://127.0.0.1:8731/')">
                <template #icon>
                    <el-tooltip placement="left">
                        <template #content>由于工具内容为iframe嵌入本地页面<br />
                            在切换其他路由时，iframe内容不会被keep-alive缓存<br />
                            所以每次路由换回来，页面都会重新加载导致内容都会丢失<br />
                            当你需要频繁切换页面时，推荐直接使用浏览器端的页面<br />
                        </template>
                        <QuestionFilled />
                    </el-tooltip>
                </template>
                打开本地环境
            </el-button>
        </template>
    </CustomTabs>
</template>