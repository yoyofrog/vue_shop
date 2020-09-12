import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import home from '../components/home'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: home }

]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // form 代表从那个路径跳转而来
  // next 是一个函数，表示放行
  if (to.path === '/login') {
    return next()
  }
  // 获取token的内容
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
