<template>
    <div>
      <!--    面包导航栏-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片区域-->
      <el-card>
      <!--        添加角色按钮-->
        <el-row>
          <el-col>
            <el-button type="primary">添加角色</el-button>
          </el-col>
        </el-row>
<!--        角色内容表格区域-->
        <el-table :data="rolesList" border stripe>
<!--          展开列-->
          <el-table-column type="expand" label="#">
            <template slot-scope="scope">
<!--              渲染一级权限-->
              <el-row :class="['vcenter','bdbottom', index1 == 0? 'bdtop':'']" :key="item1.id" v-for="(item1, index1) in scope.row.children">
                <el-col :span="5">
                  <el-tag @close="removeById(scope.row, item1.id)"  closable>{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
<!--                渲染二级权限-->
                <el-col :span="19">
                  <el-row :class="['vcenter', index2 == 0? '': 'bdtop']" :key="item2.id" v-for="(item2, index2) in item1.children">
                    <el-col :span="6">
                      <el-tag @close="removeById(scope.row, item2.id)"  type="success" closable>{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col >
<!--                      三级权限-->
                    <el-col :span="18">
                      <el-tag @close="removeById(scope.row, item3.id)" closable type="warning" :key="item3.id" v-for="item3 in item2.children">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="30%">
        <el-tree ref="treeRef" :default-checked-keys="defkeys" default-expand-all show-checkbox :data="rightsList" :props="rightProps" node-key="id"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="alotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      rightsList: [],
      // 树形控件的属性绑定对象
      rightProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点ID值数组
      defkeys: [],
      // 即将分配权限的id
      roleID: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    getRolesList: async function () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取用户角色失败')
      this.rolesList = res.data
    },
    async removeById (role, rightid) {
      const confirmRes = await this.$messageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightid)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      role.children = res.data
    },
    async showSetRightDialog (role) {
      this.roleID = role.id
      this.defkeys = []
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
      this.getLeafKeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归函数获取角色下所有三级权限的id,并保存到defkeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 点击为角色分配权限
    async alotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleID}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-top: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
