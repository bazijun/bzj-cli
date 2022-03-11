const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不不支持promise

class Generator {
    constructor(name, targetDir) {
            // 目录名称
            this.name = name;
            // 创建位置
            this.targetDir = targetDir;
            this.downloadGitRepo = util.promisify(downloadGitRepo)
        }
        // 核心创建逻辑
        create() {
    
        }
    }
