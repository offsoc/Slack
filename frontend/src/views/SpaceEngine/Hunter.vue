<script setup lang="ts">
import { ExportToXlsx } from '@/export'
import { reactive, ref } from 'vue';
import { ElNotification, ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Search, ChatLineSquare, ChromeFilled, CopyDocument, PictureRounded, Delete, Star, Collection, CollectionTag } from '@element-plus/icons-vue';
import { splitInt, Copy, CsegmentIpv4 } from '@/util'
import { TableTabs, HunterEntryTips } from "@/interface"
import global from "@/global"
import { FaviconMd5, HunterSearch, HunterTips } from 'wailsjs/go/main/App'
import { InsertFavGrammarFiled, SelectAllSyntax, RemoveFavGrammarFiled } from 'wailsjs/go/main/Database'
import { BrowserOpenURL } from 'wailsjs/runtime'
import exportIcon from '@/assets/icon/doucment-export.svg'
import csegmentIcon from '@/assets/icon/csegment.svg'
import { main } from 'wailsjs/go/models';

const options = ({
    Server: [
        {
            value: '3',
            label: '全部资产',
        },
        {
            value: '1',
            label: 'WEB服务资产',
        },
        {
            value: '2',
            label: '非WEB服务资产',
        },
    ],
    Time: [
        {
            value: '0',
            label: '最近一个月',
        },
        {
            value: '1',
            label: '最近半年',
        },
        {
            value: '2',
            label: '最近一年',
        },
    ],
    Data: [
        {
            "syntax": 'domain.suffix="qianxin.com"',
            "description": '搜索主域为"qianxin.com"的网站'
        },
        {
            "syntax": 'app.name="小米 Router"',
            "description": '搜索标记为”小米 Router“的资产'
        },
        {
            "syntax": 'protocol="http"',
            "description": '搜索协议为”http“的资产'
        },
        {
            "syntax": 'icp.name="奇安信"',
            "description": '搜索ICP备案单位名中含有“奇安信”的资产'
        },
        {
            "syntax": 'icp.number="京ICP备16020626号-8"',
            "description": '搜索通过域名关联的ICP备案号为”京ICP备16020626号-8”的网站资产'
        },
        {
            "syntax": 'web.title="北京"',
            "description": '从网站标题中搜索“北京”'
        },
        {
            "syntax": 'web.body="网络空间测绘"',
            "description": '搜索网站正文包含”网络空间测绘“的资产'
        },
        {
            "syntax": 'header="elastic"',
            "description": '搜索HTTP请求头中含有”elastic“的资产'
        },
    ]
})

// ref得单独校验
const ruleFormRef = ref<FormInstance>()

const syntax = ({
    searchDialog: ref(false),
    starDialog: ref(false),
    rules: reactive<FormRules<main.Syntax>>({
        Name: [
            { required: true, message: '请输入语法名称', trigger: 'blur' },
        ],
        Content: [
            {
                required: true,
                message: '请输入语法内容',
                trigger: 'blur',
            },
        ],
    }),
    ruleForm: reactive<main.Syntax>({
        Name: '',
        Content: '',
    }),
    createStarDialog: () => {
        syntax.starDialog.value = true
        syntax.ruleForm.Name = ""
        syntax.ruleForm.Content = form.query
    },
    submitStar: async (formEl: FormInstance | undefined) => {
        if (!formEl) return
        let result = await formEl.validate()
        if (!result) return
        InsertFavGrammarFiled("hunter", syntax.ruleForm.Name!, syntax.ruleForm.Content!).then((r: Boolean) => {
            if (r) {
                ElMessage.success('添加语法成功')
            } else {
                ElMessage.error('添加语法失败')
            }
            syntax.starDialog.value = false
        })
    },
    deleteStar: (name: string, content: string) => {
        RemoveFavGrammarFiled("hunter", name, content).then((r: Boolean) => {
            if (r) {
                ElMessage.success('删除语法成功,重新打开刷新')
            } else {
                ElMessage.error('删除语法失败')
            }
        })
    },
    searchStarSyntax: async () => {
        form.syntaxData = await SelectAllSyntax("hunter")
    },
})

const form = reactive({
    query: '',
    defaultTime: '2',
    defaultSever: '3',
    deduplication: false,
    tips: '',
    batchdialog: false,
    batchURL: '',
    syntaxData: [] as main.Syntax[],
})

const entry = ({
    querySearchAsync: async (queryString: string, cb: Function) => {
        if (queryString.includes("=") || !queryString) {
            cb([]);
            return
        }
        let tips = await entry.getTips(queryString)
        cb(tips);
    },
    getTips: async function (queryString: string) {
        let result = await HunterTips(queryString)
        let tips = [] as HunterEntryTips[]
        if (result.code == 200) {
            for (const item of result.data.app) {
                tips.push({
                    value: item.name,
                    assetNum: item.asset_num,
                    tags: item.tags
                })
            }
        }
        return tips
    },
    handleSelect: (item: Record<string, any>) => {
        form.query = `app.name="${item.value}"`
    },
    rowClick: function (row: any, column: any, event: Event) {
        if (!form.query) {
            form.query = row.syntax
            return
        }
        form.query += " && " + row.syntax
    },
    rowClick2: function (row: any, column: any, event: Event) {
        if (!form.query) {
            form.query = row.Content
            return
        }
        form.query += " && " + row.Content
    },
})

const table = reactive({
    acvtiveNames: "1",
    tabIndex: 1,
    editableTabs: [] as TableTabs[],
    loading: false,
})

const tableCtrl = ({
    addTab: (query: string) => {
        if (!global.space.hunterkey) {
            ElNotification.warning("请在设置处填写Hunter Key")
            return
        }
        const newTabName = `${++table.tabIndex}`
        table.editableTabs.push({
            title: query,
            name: newTabName,
            content: [],
            total: 0,
            pageSize: 10,
            currentPage: 1,
        });
        table.loading = true
        table.acvtiveNames = newTabName
        HunterSearch(global.space.hunterkey, query, "10", "1", form.defaultTime, form.defaultSever, form.deduplication).then(result => {
            if (isError(result.code, result.message)) {
                table.loading = false
                return
            }
            form.tips = result.message + "," + result.data.rest_quota
            const tab = table.editableTabs.find(tab => tab.name === newTabName)!;
            tab.content!.pop()
            if (result.data.arr == null) {
                ElNotification.warning("暂未查询到相关数据");
                table.loading = false
                return
            }
            result.data.arr.forEach((item: any) => {
                tab.content?.push({
                    URL: item.url,
                    IP: item.ip,
                    Port: item.port,
                    Protocol: item.protocol,
                    Domain: item.domain,
                    Component: item.component,
                    Title: item.web_title,
                    Status: item.status_code,
                    ICP: item.company,
                    ISP: item.isp,
                    Position: item.country + "/" + item.province,
                    UpdateTime: item.updated_at,
                })
            });
            tab.total = result.data.total
            table.loading = false
        })
    },
    removeTab: (targetName: string) => {
        const tabs = table.editableTabs
        let activeName = table.acvtiveNames
        if (activeName === targetName) {
            tabs.forEach((tab, index) => {
                if (tab.name === targetName) {
                    tab.content = [] // 清理内存
                    const nextTab = tabs[index + 1] || tabs[index - 1]
                    if (nextTab) {
                        activeName = nextTab.name
                    }
                }
            })
        }
        table.acvtiveNames = activeName
        table.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    },
    handleSizeChange: (val: any) => {
        const tab = table.editableTabs.find(tab => tab.name === table.acvtiveNames)!;
        table.loading = true
        HunterSearch(global.space.hunterkey, tab.title, val.toString(), "1", form.defaultTime, form.defaultSever, form.deduplication).then(result => {
            if (isError(result.code, result.message)) {
                table.loading = false
                return
            }
            form.tips = result.message + "," + result.data.rest_quota
            tab.content = [{}]
            tab.content.pop()
            result.data.arr.forEach((item: any) => {
                tab.content?.push({
                    URL: item.url,
                    IP: item.ip,
                    Port: item.port,
                    Protocol: item.protocol,
                    Domain: item.domain,
                    Component: item.component,
                    Title: item.web_title,
                    Status: item.status_code,
                    ICP: item.company,
                    ISP: item.isp,
                    Position: item.country + "/" + item.province,
                    UpdateTime: item.updated_at,
                })
            });
            tab.total = result.data.total
            table.loading = false
        })
    },
    handleCurrentChange: (val: any) => {
        const tab = table.editableTabs.find(tab => tab.name === table.acvtiveNames)!;
        tab.currentPage = val
        table.loading = true
        HunterSearch(global.space.hunterkey, tab.title, tab.pageSize.toString(), val.toString(), form.defaultTime, form.defaultSever, form.deduplication).then(result => {
            if (isError(result.code, result.message)) {
                table.loading = false
                return
            }
            form.tips = result.message + "," + result.data.rest_quota
            tab.content = [{}]
            tab.content.pop()
            result.data.arr.forEach((item: any) => {
                tab.content?.push({
                    URL: item.url,
                    IP: item.ip,
                    Port: item.port,
                    Protocol: item.protocol,
                    Domain: item.domain,
                    Component: item.component,
                    Title: item.web_title,
                    Status: item.status_code,
                    ICP: item.company,
                    ISP: item.isp,
                    Position: item.country + "/" + item.province,
                    UpdateTime: item.updated_at,
                })
            });
            tab.total = result.data.total
            table.loading = false
        })
    },
    IconSearch: async function () {
        ElMessageBox.prompt('输入目标Favicon地址会自动计算并搜索相关资产', '图标搜索', {
            confirmButtonText: '查询',
            inputPattern: /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[^\s]*)?$/,
            inputErrorMessage: 'Invalid URL',
            showCancelButton: false,
        })
            .then(async ({ value }) => {
                let hash = await FaviconMd5(value.trim())
                if (!hash) {
                    ElNotification.warning("目标不可达或者URL格式错误");
                    return
                }
                tableCtrl.addTab(`web.icon=="${hash}"`)
            }).catch(() => {
            })
    }
})

async function SaveData(mode: number) {
    if (table.editableTabs.length != 0) {
        const tab = table.editableTabs.find(tab => tab.name === table.acvtiveNames)!;
        if (tab.content.length == 0) {
            return
        }
        if (mode == 0) {
            ExportToXlsx(["URL", "IP", "端口", "协议", "域名", "应用/组件", "标题", "状态码", "备案号", "运营商", "地理位置", "更新时间"], "asset", "hunter_asset", tab.content!)
        } else {
            ElNotification.info({
                title: "提示",
                message: "正在进行全数据导出，API每页最大查询限度100，请稍后。",
            });
            let temp = [{}]
            temp.pop()
            let index = 0
            for (const num of splitInt(tab.total, 100)) {
                index += 1
                ElMessage("正在导出第" + index.toString() + "页");
                let result = await HunterSearch(global.space.hunterkey, tab.title, "100", index.toString(), form.defaultTime, form.defaultSever, form.deduplication)
                if (isError(result.code, result.message)) {
                    return
                }
                result.data.arr.forEach((item: any) => {
                    temp.push({
                        URL: item.url,
                        IP: item.ip,
                        Port: item.port,
                        Protocol: item.protocol,
                        Domain: item.domain,
                        Component: item.component,
                        Title: item.web_title,
                        Status: item.status_code,
                        ICP: item.company,
                        ISP: item.isp,
                        Position: item.country + "/" + item.province,
                        UpdateTime: item.updated_at,
                    })
                });
            }
            ExportToXlsx(["URL", "IP", "端口", "协议", "域名", "应用/组件", "标题", "状态码", "备案号", "运营商", "地理位置", "更新时间"], "asset", "hunter_asset", temp)
            temp = []
        }
    }
}

function isError(code: number, message: string) {
    if (code == 0) {
        ElMessage.warning("请求失败，请检查网络")
        return true
    }
    if (code == 40205) {
        ElNotification.info({
            title: "提示",
            message: message,
        });
        return true
    }
    if (code != 200) {
        ElNotification.info({
            title: "提示",
            message: message,
        });
        return false
    }
    return false
}

// 0 当前页 1 100条
async function CopyURL(mode: number) {
    if (table.editableTabs.length != 0) {
        const tab = table.editableTabs.find(tab => tab.name === table.acvtiveNames)!;
        var temp = [];
        if (mode == 0) {
            for (const line of tab.content!) {
                temp.push((line as any)["URL"])
            }
        } else {
            await HunterSearch(global.space.hunterkey, tab.title, "100", "1", form.defaultTime, form.defaultSever, form.deduplication).then(result => {
                result.data.arr.forEach((item: any) => {
                    temp.push(item.url)
                })
            })
        }
        Copy(temp.join("\n"))
        temp = []
    }
}

function searchCsegmentIpv4(ip: string) {
    let ipv4 = CsegmentIpv4(ip)
    tableCtrl.addTab(`ip="${ipv4}"`)
}
</script>

<template>
    <el-form v-model="form" @keydown.enter.native.prevent="tableCtrl.addTab(form.query)">
        <el-form-item>
            <el-autocomplete v-model="form.query" placeholder="Search..." :fetch-suggestions="entry.querySearchAsync"
                @select="entry.handleSelect" :debounce="1000" style="width: 100%;">
                <template #prepend>
                    查询条件
                </template>
                <template #suffix>
                    <el-space :size="2">
                        <el-popover placement="bottom-end" :width="550" trigger="click">
                            <template #reference>
                                <div>
                                    <el-tooltip content="常用关键词搜索" placement="bottom">
                                        <el-button :icon="CollectionTag" link />
                                    </el-tooltip>
                                </div>
                            </template>
                            <el-table :data="options.Data" @row-click="entry.rowClick" class="keyword-search">
                                <el-table-column width="300" property="syntax" label="例句" />
                                <el-table-column property="description" label="用途说明" />
                            </el-table>
                        </el-popover>
                        <el-tooltip content="使用网页图标搜索" placement="bottom">
                            <el-button :icon="PictureRounded" link @click="tableCtrl.IconSearch" />
                        </el-tooltip>
                    </el-space>
                    <el-divider direction="vertical" />
                    <el-space :size="2">
                        <el-tooltip content="清空语法" placement="bottom">
                            <el-button :icon="Delete" link @click="form.query = ''" />
                        </el-tooltip>
                        <el-tooltip content="收藏语法" placement="bottom">
                            <el-button :icon="Star" link @click="syntax.createStarDialog" />
                        </el-tooltip>
                        <el-tooltip content="复制语法" placement="bottom">
                            <el-button :icon="CopyDocument" link @click="Copy(form.query)" />
                        </el-tooltip>
                        <el-divider direction="vertical" />
                    </el-space>
                    <el-button link :icon="Search" @click="tableCtrl.addTab(form.query)"
                        style="height: 40px;">查询</el-button>
                </template>
                <template #append>
                    <el-space :size="25">
                        <el-popover placement="bottom-end" :width="550" trigger="click">
                            <template #reference>
                                <div>
                                    <el-tooltip content="我收藏的语法" placement="left">
                                        <el-button :icon="Collection" @click="syntax.searchStarSyntax" />
                                    </el-tooltip>
                                </div>
                            </template>
                            <el-table :data="form.syntaxData" @row-click="entry.rowClick2" class="keyword-search">
                                <el-table-column width="150" prop="Name" label="语法名称" />
                                <el-table-column prop="Content" label="语法内容" />
                                <el-table-column label="操作" width="100">
                                    <template #default="scope">
                                        <el-button link type="primary"
                                            @click="syntax.deleteStar(scope.row.Name, scope.row.Content)">删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-popover>

                        <el-tooltip content="查询语法" placement="left">
                            <el-button :icon="ChatLineSquare" @click="syntax.searchDialog.value = true" />
                        </el-tooltip>
                    </el-space>
                </template>
                <template #default="{ item }">
                    <el-space>
                        <span>{{ item.value }}</span>
                        <el-divider direction="vertical" />
                        <span>数量: {{ item.assetNum }}</span>
                        <el-divider direction="vertical" />
                        <el-tag v-for="label in item.tags">{{ label }}</el-tag>
                    </el-space>
                </template>
            </el-autocomplete>
        </el-form-item>
        <el-form-item>
            <el-space>
                <el-select v-model="form.defaultTime" style="width: 120px;">
                    <el-option v-for="item in options.Time" :key="item.value" :label="item.label" :value="item.value"
                        style="text-align: center;" />
                </el-select>
                <el-select v-model="form.defaultSever" style="width: 160px;">
                    <el-option v-for="item in options.Server" :key="item.value" :label="item.label" :value="item.value"
                        style="text-align: center;" />
                </el-select>
                <el-tooltip content="需要权益积分">
                    <el-checkbox v-model="form.deduplication">数据去重</el-checkbox>
                </el-tooltip>
            </el-space>
            <div style="flex-grow: 1;"></div>
            <el-dropdown>
                <el-button type="primary" text bg>
                    更多功能<el-icon class="el-icon--right">
                        <ArrowDown />
                    </el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :icon="exportIcon" @click="SaveData(0)">导出当前查询页数据</el-dropdown-item>
                        <el-dropdown-item :icon="exportIcon" @click="SaveData(1)">导出全部数据</el-dropdown-item>
                        <el-dropdown-item :icon="CopyDocument" @click="CopyURL(0)" divided>复制当前页URL</el-dropdown-item>
                        <el-dropdown-item :icon="CopyDocument" @click="CopyURL(1)">复制前100条URL</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-form-item>
    </el-form>
    <el-tabs class="editor-tabs" v-model="table.acvtiveNames" v-loading="table.loading" type="card"
        style="margin-top: 10px;" closable @tab-remove="tableCtrl.removeTab">
        <el-tab-pane v-for="item in table.editableTabs" :key="item.name" :label="item.title" :name="item.name"
            v-if="table.editableTabs.length != 0">
            <el-table :data="item.content" border style="width: 100%;height: calc(100vh - 275px);">
                <el-table-column type="index" fixed label="#" width="60px" />
                <el-table-column prop="URL" fixed label="URL" width="200" :show-overflow-tooltip="true" />
                <el-table-column prop="IP" fixed label="IP" width="150" :show-overflow-tooltip="true" />
                <el-table-column prop="Port" fixed label="端口/服务" width="120">
                    <template #default="scope">
                        {{ scope.row.Port }}
                        <el-tag type="info">{{ scope.row.Protocol }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="Domain" label="域名" width="150" :show-overflow-tooltip="true" />
                <el-table-column prop="Component" label="应用/组件" width="210xp">
                    <template #default="scope">
                        <el-space>
                            <el-tag v-if="Array.isArray(scope.row.Component) && scope.row.Component.length > 0">{{
                                scope.row.Component[0].name + scope.row.Component[0].version }}</el-tag>
                            <el-popover placement="bottom" :width="350" trigger="hover">
                                <template #reference>
                                    <el-button round size="small"
                                        v-if="Array.isArray(scope.row.Component) && scope.row.Component.length > 0">共{{
                                            scope.row.Component.length }}条</el-button>
                                </template>
                                <template #default>
                                    <el-space direction="vertical">
                                        <el-tag round v-for="component in scope.row.Component" style="width: 320px;">{{
                                            component.name +
                                            component.version }}</el-tag>
                                    </el-space>
                                </template>
                            </el-popover>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="Title" label="标题" width="150" :show-overflow-tooltip="true" />
                <el-table-column prop="Status" label="状态码" :show-overflow-tooltip="true" />
                <el-table-column prop="ICP" label="备案号" width="150" :show-overflow-tooltip="true" />
                <el-table-column prop="ISP" label="运营商" width="150" :show-overflow-tooltip="true" />
                <el-table-column prop="Position" label="地理位置" width="120" :show-overflow-tooltip="true" />
                <el-table-column prop="UpdateTime" label="更新时间" width="150" :show-overflow-tooltip="true" />
                <el-table-column fixed="right" label="操作" width="100" align="center">
                    <template #default="scope">
                        <el-tooltip content="打开链接" placement="top">
                            <el-button link :icon="ChromeFilled" @click.prevent="BrowserOpenURL(scope.row.URL)" />
                        </el-tooltip>
                        <el-divider direction="vertical" />
                        <el-tooltip content="C段查询" placement="top">
                            <el-button link :icon="csegmentIcon" @click.prevent="searchCsegmentIpv4(scope.row.IP)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div class="my-header" style="margin-top: 10px;">
                <span style="color: cornflowerblue;">{{ form.tips }}</span>
                <el-pagination size="small" background v-model:page-size="item.pageSize" :page-sizes="[10, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="tableCtrl.handleSizeChange"
                    @current-change="tableCtrl.handleCurrentChange" :total="item.total" />
            </div>
        </el-tab-pane>
        <el-empty v-else></el-empty>
    </el-tabs>
    <el-dialog v-model="syntax.searchDialog.value" title="查询语法" width="80%" center>
        <el-scrollbar height="400px">
            <el-image src="/hunter_syntax.png"></el-image>
        </el-scrollbar>
    </el-dialog>
    <el-dialog v-model="syntax.starDialog.value" title="收藏语法" width="40%" center>
        <!-- 一定要用:model v-model校验会失效 -->
        <el-form ref="ruleFormRef" :model="syntax.ruleForm" :rules="syntax.rules" status-icon>
            <el-form-item label="语法名称" prop="Name">
                <el-input v-model="syntax.ruleForm.Name" maxlength="30" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="语法内容" prop="Content">
                <el-input v-model="syntax.ruleForm.Content" type="textarea" :rows="10" maxlength="1024"
                    show-word-limit></el-input>
            </el-form-item>
            <el-form-item class="align-right">
                <el-button type="primary" @click="syntax.submitStar(ruleFormRef)">
                    确定
                </el-button>
                <el-button @click="syntax.starDialog.value = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style scoped></style>