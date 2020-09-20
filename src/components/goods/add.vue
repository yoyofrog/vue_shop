<template>
    <div>
   <!--    面包导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片区域-->
      <el-card>
<!--        信息条-->
        <el-alert
          title="添加商品信息"
          type="info"
          center :closable="false"
          show-icon>
        </el-alert>
<!--        步骤条-->
        <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品照片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
<!--        tab栏-->
        <el-form label-position="top" :model="addForm" :rules="affFromRules" ref="addFormRef" label-width="100px">
          <el-tabs v-model="activeIndex" :tab-position="'left'"
                   :before-leave="beforeTableLeave" @tab-click="tabClicked">
            <el-tab-pane :name="'0'" label="基本信息">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
               <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
               <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
               <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
               <el-form-item label="商品分类" prop="goods_cat">
                 <el-cascader
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="catelistProps" @change="handleChange"
                  ></el-cascader>
              </el-form-item>
              </el-tab-pane>
            <el-tab-pane :name="'1'" label="商品参数">
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id" prop="">
     <!--              复选框组-->
                <el-checkbox-group v-model="item.attr_vals" >
                   <el-checkbox border v-for="(subitem, i) in item.attr_vals" :label="subitem" :key="i">{{subitem}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane :name="'2'" label="商品属性">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                     <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane :name="'3'" label="商品照片">
<!--                action时图片要上传的后台api地址-->
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane :name="'4'" label="商品内容">
              <quill-editor
                v-model="addForm.goods_introduce"/>
              <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
<!--      图片预览对话框-->
      <el-dialog
        title="图片预览"
        :visible.sync="picDialogVisible"
        width="50%">
        <img :src="previewPath" alt="" width="100%">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      affFromRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品参数', trigger: 'blur' }
        ]
      },
      cateList: [],
      catelistProps: {
        expandTrigger: 'hover',
        children: 'children',
        label: 'cat_name',
        value: 'cat_id'
      },
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      picDialogVisible: false
    }
  },
  created () {
    this.getCatelist()
  },
  methods: {
    async getCatelist () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 级联选择器change事件
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab页面跳转事件
    beforeTableLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab页面点击事件
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取参数失败')
        this.manyTableData = res.data
        this.manyTableData.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取参数失败')
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.picDialogVisible = true
    },
    handleRemove (file) {
      // console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功事件
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品事件
    // lodash cloneDeep(obj)
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 发起请求添加商品
        // 商品名字必须时唯一的
        const { data: res } = await this.$http.post('goods', form)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    catId: function () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0
}
  .addBtn {
    margin-top: 15px;
  }
</style>
