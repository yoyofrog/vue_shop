<template>
  <div>
   <!--    面包导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
    <el-card>
      <!--        添加分类按钮-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>
<!--      表格-->
      <tree-table class="treeTable" :data="catelist" :columns="columns"
        :selection-type="false" :expand-type="false" :show-index="true"
        border index-text="#" :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i style="color: lightgreen" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini"  v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" >删除</el-button>
        </template>
      </tree-table>
<!--      分页区域-->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
<!--    添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
<!--      添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
<!--          用props来指定配置对象-->
          <el-cascader expand-trigger="hover"
            v-model="selectedKeys" size="small" :props="cascaderProps"
            :options="parentCateList"
            @change="parentCateChanged" clearable change-on-select="change-on-select"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      catelist: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'isok',
          prop: 'cate_deleted'
        }, {
          label: '排序',
          type: 'template',
          template: 'order'
        }, {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.catelist = res.data.result
      // 为总数据条赋值
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getCateList()
    },
    // 点击按钮显示添加分类对话框
    showAddCateDialog () {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 获取父级分类数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据列表失败')
      this.parentCateList = res.data
    },
    parentCateChanged () {
      // 如果seletedKeys大的长度大于0，说明选中父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateDialogClosed () {
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
    },
    async addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
}
  .el-cascader {
    width: 100%;
  }

</style>
