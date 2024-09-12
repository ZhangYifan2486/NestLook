
将数据库生成数据模型[https://blog.csdn.net/kuangshp128/article/details/98062662]

```shell
npx typeorm-model-generator -h localhost -d chunyu-cms -p 3306 -u root -x 123456 -e mysql -o entities --noConfig true --cp camel
```

* rm -rf entities表示先删除文件夹entities
* npx typeorm-model-generator如果全局安装了就不需要加npx没有全局安装就加上去
* -h localhost -d 数据库名字 -p 端口 -u 用户名 -x 密码 -e 数据库类型
* -o entities表示输出到指定的文件夹
* --noConfig true表示不生成ormconfig.json和tsconfig.json文件
* --ce pascal表示将类名转换首字母是大写的驼峰命名
* --cp camel表示将数据库中的字段比如create_at转换为createAt
* -a表示会继承一个BaseEntity的类,根据自己需求加
