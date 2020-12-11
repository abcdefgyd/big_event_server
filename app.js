//导入express模块
const express = require('express')
//创建express实例
const app = express()


//导入
const cors = require('cors')
app.use(cors())

app.use(express.urlencoded({
    extended: false
}))


//在之前设置响应数据的中间件
app.use(function (req, res, next) {
    //status=0为成功，为1为失败
    res.cc = function (err, status = 1) {
        res.send({
            //状态
            status,
            //状态描述，判断err是错误对象还是字符串
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

//解析token的中间件
// 导入配置文件
const config = require('./config')

// 解析 token 的中间件
const expressJWT = require('express-jwt')

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({
    secret: config.jwtSecretKey
}).unless({
    path: [/^\/api\//]
}))

// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

//导入并注册用户信息模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
// 为文章分类的路由挂载统一的访问前缀 /my/article
app.use('/my/article', artCateRouter)

const joi = require('@hapi/joi')

// 错误中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)

    // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')

    // 未知错误
    res.cc(err)
})
//调用app.listen方法，指定端口号并启动服务器
app.listen(3007, () => {
    console.log('开启服务 http://127.0.0.1:3007');
})