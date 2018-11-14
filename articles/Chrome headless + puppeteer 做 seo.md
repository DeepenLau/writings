---
title: Chrome headless + puppeteer 做 seo
date: 2017-12-07 16:02:45
tag: seo spa headless
desc: 针对爬虫用 Chrome headless + puppeteer 做 spa 的 seo
---

# Chrome headless + puppeteer 做 seo

众所周知，spa 的 seo 需求是一个非常大的痛点，本文尝试使用 Chrome headless 模式来代替 phantomjs 来给 spa 做 seo

## 什么是 Chrome headless

> 一个没有界面的 Chrome 浏览器，并且有亲爹 Google 在维护

## 开始干活

最终要实现的一个简单思路：

1. 访问 spa 的地址
2. nginx 通过判断 ua 或者 header 来判断是否爬虫
3. 如果是爬虫，代理转发到调用 Chrome 的 web 服务
4. 返回 htmlString
5. 爬虫获取到该页面的完整 dom 节点

> 命令行的方式可以先看 [官方文档](https://developers.google.com/web/updates/2017/04/headless-chrome)，这里直接跳过

接下来要做的事情其实不多
1. 搭建 spa 的 web 服务，这里选用 nginx
2. 搭建一个爬虫专用的 web 服务
3. 在 nginx 判断转发

## 搭建 spa 的 web 服务

简单示例：

```nginx
server {
    listen       8200;
    server_name  localhost;

    autoindex on;

    location / {
        # 项目 index.html 的目录
        root  /project/www;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html =404;
    }

}
```

## 搭建一个爬虫专用的 web 服务

这里用 nodejs 搭建

```bash
yarn add koa
```

```js
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});
app.listen(3000);
```
一个简单 web 服务就搭建完成

接下来要在这里面做几件事情：
1. 获取或者拼接爬虫要访问的地址
2. 启动 Chrome 的 headless 模式去访问这个地址
3. 关闭 Chrome 浏览器
4. 把返回来的内容原封不动返回给爬虫

那么问题来了，我用什么去启动这个 Chrome 呢？

在上面的文档中提供了一个 nodejs 的库：***Puppeteer***

> Puppeteer is a Node library developed by the Chrome team. It provides a high-level API to control headless (or full) Chrome. It's similar to other automated testing libraries like Phantom and NightmareJS, but it only works with the latest versions of Chrome.

> Puppeteer 是由 Chrome 团队开发的一个 Node 库。它提供了一个高级 API 来控制无头 (或完整) 的 Chrome。它类似于其他自动测试库, 如 Phantom 和 NightmareJS, 但它只适用于最新版本的 Chrome。

由于在安装的这个库的时候，它自动根据系统帮你去下载最新版，或者说符合当前这个 Puppeteer 版本的 Chrome 浏览器

我选择自己开代理下载这个浏览器

先跳过下载浏览器
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn add puppeteer
```
目前我使用的 puppeteer 版本是 0.13.0
我的服务器环境是 linux, 所以目前这个版本的地址是
https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/515411/chrome-linux.zip

其他系统的地址可进入 `node_modules/puppeteer/utils/ChromiumDownloader.js` 查看

还有一点，下载完浏览器并解压后，服务器系统还需要装一些依赖，[点我查看](https://github.com/GoogleChrome/puppeteer/blob/v0.13.0/docs/troubleshooting.md)

我的系统是 ubuntu 16.04，贴一下要装的包

```bash
sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

接下来开始写这个服务

```js
app.use(async ctx => {
  // 爬虫请求的地址
  const path = `${ctx.protocol}://${ctx.headers.host}${ctx.path}`
  // 打开浏览器
  const browser = await puppeteer.launch({
    // 这里填刚下载的浏览器地址
    executablePath: './local-chrome/chrome-linux/chrome'
  })

  const page = await browser.newPage()
  await page.goto(path, { waitUntil: 'networkidle2' })
  // 这里就获取到了完整 html 了
  const htmlString = await page.content()
  browser.close()

  ctx.body = htmlString;
});

app.listen(3000);
```

然后 nginx 那个要修改一下

```nginx

server {
    listen       8200;
    server_name  localhost;

    autoindex on;

    location / {
        # 设置一些 header 让后面的服务可以拿到一些需要的信息
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        # creeper 是我自己测试爬虫加的 header
        if ($http_creeper) {
            # 转发到刚才用 koa 搭建的服务
            proxy_pass http://localhost:3000;
        }
        # 项目 index.html 的目录
        root  /project/www;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html =404;
    }

}

```

测试爬虫代码

```js

const axios = require('axios')
const fs = require('fs')
const path = require('path')
axios.defaults.headers.creeper = 'axios'

;(async () => {
  const result = await axios.get('http://192.168.33.10:8200/xxxx')
  const data = result.data
  console.log(data)
  fs.writeFile(path.resolve(__dirname, './test.html'), data, (err) => {
    if (err) {
      console.error(err)
    } else {
      console.log('写入成功')
    }
  })
})()

```

搞定

## 总结

1. 由于 Chrome headless 模式的出现， PhantomJS 的作者也宣布不维护了，[点我查看，这里面的第一封邮件](https://groups.google.com/forum/#!topic/phantomjs/9aI5d-LDuNE)，所以现在开始要接受下新事物了
2. puppeteer 目前其实还是在开发阶段，api 还不稳定，到目前位置，我用的版本是 0.13.0
3. 还有一个库叫 `chrome-remote-interface`，chrome-remote-interface is a lower-level library than Puppeteer's API，有机会试试这个库
4. 还有其他玩法，比如做 e2e 测试