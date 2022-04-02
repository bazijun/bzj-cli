const figlet = require('figlet')
const chalk = require('chalk')
const lolcats = require('lolcats');
const warning = chalk.hex('#F4F5D5');

const logs_cli_name = `\n🚀⚡  ${warning('把子脚手架')} ⚡🚀`

// 使用 figlet 绘制 Logo, lolcats上色
const logs_cli_logo = '\r\n' + lolcats.rainbow(figlet.textSync('BZJ', {
    font: '3D-ASCII', // 'ANSI Shadow' , '3D-ASCII', 'ANSI Regular' ‘Bloody’, 'Elite', 'Delta Corps Priest 1'
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
}))

module.exports = {
    logs_cli_name,
    logs_cli_logo
}
