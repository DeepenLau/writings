---
title: mysql 批量插入的一个小问题
date: 2018-07-17 16:01:50
tag: sql mysql
desc: mysql 学习遇到的坑
---

# mysql 批量插入的一个小问题

> 在学习 mysql 遇到的一个小问题

## 场景

在前端需要导入一份 excel 表，后端拿到该表后需要处理成一个数组然后批量插入数据库，其中在的导入时候，**遇到已经存在的行则忽略不插入**

经过在和搜索引擎的一番较量，得出一下几种方式：

1. 多次查询，每次一条语句插入
2. 一次查询，多语句插入
3. 一次查询，单语句插入

## 多次查询，每次一条语句插入

这种方式没什么好说，顾名思义

## 一次查询，多语句插入

这种又可以分两种方式：
1. 使用 sql 本身的逻辑语句处理
```mysql
    DELIMITER //
    CREATE PROCEDURE loopInsert()
    BEGIN
    DECLARE num INT;
    SET num = 0;
    WHILE num < ${users.length} DO
       INSERT INTO users (name, department) VALUES ("${users[num]['姓名']}", "${users[num]['部门']}");
       SET num = num+1;
    END WHILE;
    END //

    CALL loopInsert()
```

这种方式本身有个比较致命的缺陷是（本测试用例为 node），**在 node 中拼接 sql 语句时，sql 中的变量和 node 变量中是有冲突的**，就上面的例子，在 node 的模板字符串中，`${users[num]['姓名']}`里面的 num 是无法获取到 sql 语句中的 num 变量，导致无法完成循环，所以这种也许比较适合在 sql 客户端使用
> 本例中没有处理 **遇到已经存在的行则忽略不插入** 的情况，所以后续讲到的问题不会加入这个例子作说明

<br>

2. 处理一条语句，循环拼接成多语句
```js
let query = ''
for (let i=0; i < users.length; i++) {
  query += `
    INSERT INTO users (name, department, phone)
    SELECT * FROM (SELECT "${users[i]['姓名']}", "${users[i]['部门']}", "${users[i]['手机号码']}") AS tmp
    WHERE NOT EXISTS (
        SELECT name FROM users WHERE phone = "${users[i]['手机号码']}"
    ) LIMIT 1;
  `
}
```

这种方式其实也就已经实现了，问题在于数据量大的话，会拼接非常长

<br>

## 一次查询，单语句插入

这种方式的也是我最希望用到的

也有两种方式:

1. 使用 `UNION` 语句联合
```js
let query = 'INSERT INTO users (name, department, phone)'

for (let i=0; i < users.length; i++) {
  query +=
  `
  SELECT * FROM (SELECT "${users[i]['姓名']}", "${users[i]['部门']}", "${users[i]['手机号码']}") AS tmp
  WHERE NOT EXISTS (
    SELECT phone FROM users WHERE phone = "${users[i]['手机号码']}"
  )
  ${i == users.length - 1 ? '' : 'UNION ALL'}
  `
}
```

2. 使用 `IGNORE` 语句
```js
let query = 'INSERT IGNORE INTO users (name, department, phone) VALUES '
for (let i=0; i < users.length; i++) {
  query += `("${users[i]['姓名']}", "${users[i]['部门']}", "${users[i]['手机号码']}")${i == users.length - 1 ? '' : ', '}`
}
```

<br>

> ***这时候也发现了一个新的问题，也就是这个要说的问题，就是自增 id 的问题***

## 发现问题

1. 使用 `IGNORE` 语句插入插入时，当同一份文件多次插入之后，手动删除某一条记录，再重新上传这份 excel 表，自增 id 有明显断层
![20180717154213.gif](http://blog-deepen-static.oss-cn-shenzhen.aliyuncs.com/img/20180717154213.gif)

<br>

2. 使用 `UNION` 语句联合则会出现自增 id 不稳定的连续

3. **使用多语句则可以保持自增 id 正常连续**

# 结论

- 如果对自增 id 要求不严格可以使用 IGNORE, 本人更加喜欢，比较简洁
- 如果对自增 id 要求严格的可以使用文中其他方法，或者另寻他法
- 本文只是在学习中遇到的问题做一下记录


# 参考

- [Mysql向表中循环插入数据 - CSDN博客](https://blog.csdn.net/ashic/article/details/46574865)
- [MySQL: Insert record if not exists in table - Stack Overflow](https://stackoverflow.com/questions/3164505/mysql-insert-record-if-not-exists-in-table)
- [mysql忽略主键冲突、避免重复插入的几种方式 - CSDN博客](https://blog.csdn.net/chivalrousli/article/details/51160731)