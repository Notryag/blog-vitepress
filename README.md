# 文档记录

通过`git`的`submodule`管理的 blog

目标:

- 如果子项目更新,此项目自动更新并且生成站点 ✔️

## 步骤一

1. 新建一个 vitepress 项目

```bash
npm install -D vitepress
npx vitepress init
```

2. 新建 blog 的目录如`myBlog`
   myBlog 是一个 markdown 构成的一个 git 文档项目

平常放的记录都放在这个 git 项目中, 当然也可以不是另外一个项目, 直接放markdown文件, 但是这样做可以把文档和`vitepress`项目分开管理

```bash
# 添加子项目
git submodule add <git-repo-url> <submodule-local-path>
# 拉取到本地
git submodule update --init --recursive
```

3. 根据文件目录生成`nav`和`sidebar`

```bash
npm install vitepress-auto-navigation
```

然后在 vitepress 中的 config 文件中添加配置

```typescript
const { nav, sidebar } = genNav({
  baseurl: "./myBlog",
})
...

themeConfig: {
    nav,
    sidebar,
},
```


## 步骤二 submodule项目更新, 父项目也更新

需要配置github actions, 基本原理是

1. 通过子项目的actions克隆父项目,并且更新
2. 父项目的actions通过push触发, 立即更新`vitepress`站点


