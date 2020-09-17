<template>
    <div>
   <!--    面包导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
      <el-card>
        <el-alert title="注意：只允许第三级分类设置相关参数！" show-icon type="warning" :closable="false">
        </el-alert>
<!--        选择商品分类区-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"></el-cascader>
          </el-col>
        </el-row>
<!--        tab 页签区域-->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--            添加动态参数面板-->
            <el-tab-pane label="动态参数" name="many">
              <el-button @click="addDialogVisible = true" size="mini" :disabled="isBtnDisabled" type="primary">添加参数</el-button>
              <el-table border stripe
                :data="manyTableData"
                style="width: 100%">
<!--                扩展行区域-->
                <el-table-column type="expand">
                  <template slot-scope="scope">
<!--                    选好渲染tag标签-->
                    <el-tag :key="index" v-for="(item, index) in scope.row.attr_vals" closable
                      :disable-transitions="false" @close="deleteTag(index,scope.row)">
                      {{item}}
                    </el-tag>
<!--                    输入的文本框-->
                    <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputTagValue"
                      ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
<!--                    添加按钮-->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
<!--                  操作区域-->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
<!--            添加静态属性面板-->
            <el-tab-pane label="静态属性" name="only">
              <el-button  @click="addDialogVisible = true" size="mini" :disabled="isBtnDisabled" type="primary">添加参数</el-button>
              <el-table border stripe
                :data="onlyTableData"
                style="width: 100%">
<!--                扩展栏-->
                <el-table-column type="expand">
                  <template slot-scope="scope">
<!--                    选好渲染tag标签-->
                    <el-tag :key="index" v-for="(item, index) in scope.row.attr_vals" closable
                      :disable-transitions="false" @close="deleteTag(index,scope.row)">
                      {{item}}
                    </el-tag>
<!--                    输入的文本框-->
                    <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputTagValue"
                      ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
<!--                    添加按钮-->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name" label="属性名称">
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
        </el-tabs>
      </el-card>
<!--      添加对话框-->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFromRules" ref="addFormRef" label-width="130px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
<!--      修改对话框-->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFromRules" ref="editFormRef" label-width="130px" class="demo-ruleForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams()">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择框绑定选择的
      selectedCateKeys: [],
      // 被激活的页签
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {},
      addFromRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      // 控制膝盖对话框
      editDialogVisible: false,
      editForm: {},
      editFromRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    handleChange () {
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的id,和当前所处的面板，获取对应参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.inputVisible = false
        item.inputTagValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 编辑对话框
    async showEditDialog (attrId) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.getParamsData()
        this.editForm = {}
      })
    },
    // 删除参数按钮
    async removeParams (attrId) {
      this.$messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) return this.$message.error('删除参数失败')
        this.$message.success('删除参数成功')
        this.getParamsData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    showInput (item) {
      item.inputVisible = true
      // 让文本框自动获得焦点,要先可视再获的焦点，不然会报错
      // $nextTick方法的作用是当页面上的元素被重新渲染后，才会执行回调函数调中的代码
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 失去焦点和按下enter按钮触发添加事件
    handleInputConfirm (item) {
      if (item.inputTagValue.trim().length === 0) {
        item.inputVisible = false
        item.inputTagValue = ''
        return
      }
      // 发起请求把新tag保存到数据库
      item.attr_vals.push(item.inputTagValue.trim())
      this.saveAttrVals(item)
      this.$message.success('修改成功')
      item.inputVisible = false
      item.inputTagValue = ''
    },
    // 更新参数到数据库
    async saveAttrVals (item) {
      const newItem = {}
      Object.assign(newItem, item)
      newItem.attr_vals = item.attr_vals.join(' ')
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${item.attr_id}`, newItem)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
    },
    // 删除对应的参数tag标签并更新到数据库
    deleteTag (index, item) {
      item.attr_vals.splice(index, 1)
      this.saveAttrVals(item)
    }
  },
  computed: {
    // 如果按钮需要被禁用返回true
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
 .cat_opt {
   margin-top: 15px;
 }
  .el-tag {
    margin: 7px;
  }
  .input-new-tag {
  width: 90px;
  margin: 7px;
  vertical-align: center;
}
  .button-new-tag {
    margin: 7px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}
</style>
