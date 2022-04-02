const util = require('util')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const downloadGitRepo = require('download-git-repo') // 不不支持promise
const inquirer = require('inquirer')
const ora = require('ora')
const spawn = require('cross-spawn');
const { getRepoList, getTagList } = require('./http')
const {logs_cli_logo} = require('./logs.js')


// 添加加载动画
async function wrapLoading(fn, message, ...args) {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora(message);
    // 开始加载动画
    spinner.start();

    try {
        // 执行传入方法 fn
        const result = await fn(...args);
        // 状态为修改为成功
        spinner.succeed();
        return result;
    } catch (error) {
        // 状态为修改为失败
        spinner.fail('拉取远程模板失败...')
    }
}
class Generator {
    constructor(name, targetDir) {
        // 目录名称
        this.name = name;
        // 创建位置
        this.targetDir = targetDir;
        this.downloadGitRepo = util.promisify(downloadGitRepo)
    }

    // 获取用户选择的模板
    // 1）从远程拉取模板数据
    // 2）用户选择自己新下载的模板名称
    // 3）return 用户选择的名称
    async getRepo() {
        // 1）从远程拉取模板数据
        const repoList = await wrapLoading(getRepoList, '模板请求中...');
        if (!repoList) return;

        // 过滤我们需要的模板名称
        const repos = repoList.map(item => item.name);

        // 2）用户选择自己新下载的模板名称
        const { repo } = await inquirer.prompt({
            name: 'repo',
            type: 'list',
            choices: repos,
            message: '⚡ 请选择你的模板:'
        })
        // 3）return 用户选择的名称
        return repo;
    }

    // 获取用户选择的版本
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    // 2）用户选择自己需要下载的 tag
    // 3）return 用户选择的 tag
    async getTag(repo) {
        // 1）基于 repo 结果，远程拉取对应的 tag 列表
        const tags = await wrapLoading(getTagList, '版本请求中...', repo);
        // 如果没有版本 就使用主仓库
        if (!tags || !tags.length) return repo;

        // 过滤我们需要的 tag 名称
        const tagsList = tags.map(item => item.name);

        // 2）用户选择自己需要下载的 tag
        const { tag } = await inquirer.prompt({
            name: 'tag',
            type: 'list',
            choices: tagsList,
            message: '⚡ 请选择模板的版本(Tag):'
        })

        // 3）return 用户选择的 tag
        return tag
    }

    // 下载远程模板
    // 1）拼接下载地址
    // 2）调用下载方法
    async download(repo, tag) {
        // 1）拼接下载地址
        const requestUrl = repo === tag ? `bzj-cli/${repo}` : `bzj-cli/${repo}${tag ? '#' + tag : ''}`;

        // 2）调用下载方法
        await wrapLoading(
            this.downloadGitRepo, // 远程下载方法
            '⚡ 模板战术下载中 ⚡', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
    }

    // 依赖解决
    appInstall() {
        // 1) 判断 script 名称
        const packageUrl = path.join(this.targetDir, 'package.json')
        const packageJson = require(packageUrl)
        const scriptName = Object.keys(packageJson.scripts)[0]

        // 2) 判断 包管理用的 npm 还是 yarn, 不是yarn 默认都 npm
        const dirList = fs.readdirSync(path.join(this.targetDir))
        const npm = dirList.includes('yarn.lock') ? 'yarn' : 'npm'

        // 3) 依赖解决
        console.log(`\r\n🚀 项目 ${chalk.cyan(this.name)} 开始构建 🚀`)
        console.log(logs_cli_logo)
        const child = spawn(npm, ['install'], { cwd: `./${this.name}`, stdio: 'inherit' })
        child.on('close',  (code) => {
            // install 失败
            if (code !== 0) {
                console.log(chalk.red('😪 安装依赖时出错 orz '))
                process.exit(1)
            }
            // install 成功
            else {
                console.log(`\r\n🎉 项目 ${chalk.cyan(this.name)} 构建完成!`)
                console.log(`\r\n$  ${chalk.cyan('cd ' + this.name)}`)
                console.log(`$  ${chalk.cyan(npm + ' run ' + scriptName)} \r\n`)
            }
        })
    }

    // 核心创建逻辑
    // 1）获取模板名称
    // 2）获取 tag 名称
    // 3）下载模板到模板目录
    // 4）模板使用提示
    async create() {
        // 1）获取模板名称
        const repo = await this.getRepo()

        // 2) 获取 tag 名称
        const tag = await this.getTag(repo)

        // 3）下载模板到模板目录
        await this.download(repo, tag)

        // 4) 依赖解决
        this.appInstall()
    }
}

module.exports = Generator;
