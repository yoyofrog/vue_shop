<template>
    <div>
         <!--    面包导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
      <el-card>
        <el-row>
          <el-col :span="7">
              <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
                <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
              </el-input>
          </el-col>
        </el-row>
<!--        订单表格区域-->
        <el-table :data="orderlist" style="width: 100%" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="order_number" label="订单编号" ></el-table-column>
          <el-table-column prop="order_price" label="订单价格" width="90"></el-table-column>
          <el-table-column prop="pay_status" label="是否付款" width="90">
            <template slot-scope="scope">
              <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
              <el-tag type="success" v-else>已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
          <el-table-column prop="create_time" label="下单时间" width="150">
            <template slot-scope="scope">
              {{scope.row.create_time|dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template>
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showAddress"></el-button>
              <el-button size="mini" type="success" icon="el-icon-location" @click="showProcess" ></el-button>
            </template>
          </el-table-column>
    </el-table>
<!--        分页符-->
        <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
      </el-card>
<!--      修改地址对话框-->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%" @close="addressDialogClose">
       <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="addressForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
       </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
<!--      进度对话框-->
      <el-dialog
        title="物流信息"
        :visible.sync="processDialogVisible"
        width="50%">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in processInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderlist: [],
      total: 0,
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      processDialogVisible: false,
      processInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getOrderList()
    },
    search () {
      console.log(this.queryInfo.query)
      this.getOrderList()
    },
    showAddress () {
      this.addressDialogVisible = true
    },
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProcess () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息错误')
      this.processInfo = res.data
      this.processDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
