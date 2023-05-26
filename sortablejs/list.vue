<template>
    <div class="modal-list">
        <el-form class="container-search" :inline="true" :model="form">
            <el-form-item label="注塑机">
                <el-input placeholder="选择注塑机" v-model="deviceName" readonly="readonly" v-on:click.native="selectModel()">
                    <template slot="append">
                        <el-button>选择</el-button>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button plain type="primary" @click="search()">搜索</el-button>
                <el-button plain type="success" @click="save()">保存</el-button>
            </el-form-item>
        </el-form>
        <el-table ref="dragTable" v-loading="isLoading" :data="dataList" border row-key="id">
            <el-table-column prop="sequence" header-align="center" align="center" label="排序号"
                min-width="120"></el-table-column>
            <el-table-column prop="code" header-align="center" align="center" label="工单号" min-width="200"></el-table-column>
            <el-table-column prop="productName" header-align="center" align="center" label="产品名称" min-width="200">
            </el-table-column>
            <el-table-column prop="materialName" header-align="center" align="center" label="原料" min-width="150">
            </el-table-column>
            <el-table-column prop="planProduction" header-align="center" align="center" label="计划产量"
                min-width="150"></el-table-column>
            <el-table-column prop="actualProduction" header-align="center" align="center" label="实际产量"
                min-width="150"></el-table-column>
            <el-table-column prop="planStartTime" header-align="center" align="center" label="计划开始时间"
                min-width="250"></el-table-column>
            <el-table-column prop="planEndTime" header-align="center" align="center" label="计划结束时间"
                min-width="250"></el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="状态" min-width="150">
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status.code)">{{ scope.row.status.desc }}</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
    data() {
        return {
            deviceName: null,
            sortable: null,
            form: {
                deviceId: ''
            },
            isLoading: false,
            dataList: [],
        };
    },
    mounted() {
        //设置标题
        this.setPageTitle("工单排序");
    },
    methods: {
        getStatusType(code) {
            let type = '';
            if (code == 1) {
                type = 'success';
            } else if (code == 3 || code == 4) {
                type = 'danger';
            } else if (code == 0 || code == 2) {
                type = 'info';
            }
            return type;
        },
        search() {
            if (!this.form.deviceId) {
                this.$message.warning('请先选择注塑机');
                return;
            }
            this.isLoading = true;
            this.$http.get(`/mom/ppmOrder/sequence/${this.form.deviceId}`).then((data) => {
                if (data && data.success) {
                    this.isLoading = false;
                    this.dataList = data.model;
                    this.$nextTick(() => {
                        this.setSort();
                    })
                }
            })
        },
        save() {
            this.$http.post(`/mom/ppmOrder/sequence`, this.dataList).then((data) => {
                if (data && data.success) {
                    this.$message({
                        message: data.data,
                        type: "success",
                        duration: 1500,
                    });
                } else {
                    this.$message.error(data.message);
                }
            })
        },
        setSort() {
            const el = this.$refs.dragTable.$el.querySelectorAll(
                '.el-table__body-wrapper > table > tbody'
            )[0]
            this.sortable = Sortable.create(el, {
                ghostClass: 'sortable-ghost',
                setData: function (dataTransfer) {
                    dataTransfer.setData('Text', '')
                },
                onEnd: evt => {
                    const targetRow = this.dataList.splice(evt.oldIndex, 1)[0]
                    this.dataList.splice(evt.newIndex, 0, targetRow)
                    this.dataList.forEach((item, index) => {
                        const seq = index + 1;
                        item.sequence = seq;
                    })
                }
            })
        },
        selectModel() {
            let self = this;
            this.open("/mom/tpmdevice/selectModel", { radio: true }, function (
                res
            ) {
                if (res && res.data) {
                    self.form.deviceId = res.value;
                    self.deviceName = res.data.name;
                }
            });
        },
    }
};
</script>

<style>
.sortable-ghost {
    opacity: 0.8;
    color: #fff !important;
    background: #b0c4de !important;
}
</style>
