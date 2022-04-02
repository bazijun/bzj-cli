#! /usr/bin//env node

const program = require('commander')
const chalk = require('chalk')
const {logs_cli_name,logs_cli_logo} = require('../lib/logs.js')

console.log(logs_cli_name)
console.log(logs_cli_logo)

program
    // 定义命令和参数
    .name('bzj')
    // 配置版本号信息
    .version(`v${require('../package.json').version}`)
    .command('create [name]')
    .description('创建新项目')
    // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
    .option('-f, --force', '如果目标目录存在会强制覆盖')
    .action((name, options) => {
        // 打印执行结果
        require('../lib/create.js')(name, options)
    })

program
    // 监听 --help 执行
    .on('--help', () => {
        // 新增说明信息
        console.log(`\r\n启动 ${chalk.cyan(`bzj <command> --help`)} 获取该command的详细用法 \r\n`)
    })

// 解析用户执行命令传入参数
program.parse(process.argv);
