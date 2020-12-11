//导入数据库
const db = require('../db/index')

const bcrypt = require('bcryptjs')

//用这个包生成token字符串
const jwt=require('jsonwebtoken')
const config=require('../config')


exports.regUser = (req, res) => {
    const userinfo = req.body
    //判断数据是否合法
    // if (!userinfo.username || !userinfo.password) {
    //     return res.send({
    //         status: 1,
    //         message: '用户名或密码不能为空'
    //     })
    // }
    //定义sql语句
    const sql = 'select * from ev_users where username=?'
    db.query(sql, [userinfo.username], function (err, results) {
        //执行语句失败
        if (err) {
            // return res.send({
            //     status: 1,
            //     message: err.message
            // })
            return res.cc(err)

        }
        //用户名被占用
        if (results.length > 0) {
            // return res.send({
            //     status: 1,
            //     message: '用户名被占用'
            // })
            return res.cc(err)
        }

        // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        console.log(userinfo.password);
        //用户名可以用，继续后续流程
        //查询sql里面，加密完毕只有，再进行添加
        const sql = 'insert into ev_users set ?'
        db.query(sql, {
            username: userinfo.username,
            password: userinfo.password
        }, (err, results) => {
            if (err) return res.send({
                status: 1,
                message: err.message
            })
            if (results.affectedRows != 1) {
                // return res.send({
                //     status: 1,
                //     message: '注册用户失败！'
                // })
                return res.cc(err)
            }

            // res.send({
            //     status: 0,
            //     message: '注册成功'
            // })
            return res.cc('注册成功', 0)
        })

    })

}

//登陆的处理函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sql = `select * from ev_users where username=?`
    db.query(sql, userinfo.username, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) return res.cc('用户名不存在，请去注册')

        // TODO：判断用户输入的登录密码是否和数据库中的密码一致
        //拿着用户输入的密码，和数据库中的密码进行对比
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)

        //如果对比的结果是false
        if (!compareResult) {
            return res.cc('登陆失败')
        }
        const user={...results[0],password:'',user_pic:''}

        //生成token字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, 
           // {expiresIn:'10h'} // token 有效期为 10 个小时
          { expiresIn: config.expiresIn}
           // { config.expiresIn }
       
          )
        // res.send('登录成功')
        res.send({
            status:0,
            message:'登陆成功',
            token:'Bearer '+tokenStr
        })
    })

}