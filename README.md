# tiny-yuan

> 简易的 Spm 源

-----

## Getting Started

代码 clone 下来后，进入目录下执行

    $ npm install
    $ node .

这样一个 Spm 源服务就启动了，地址为 http://localhost:3000

要让 Spm 使用这个源需要修改 ~/.spm/spmrc 文件，增加以下配置

    [source:default]
    url = http://localhost:3000

## 说明

这只是一个简易的源服务，只提供对 spm info/install/publish/login 这几个命令的支持

用户信息配置在 config/account.json 文件中

    $ spm install gallery/moment
    $ spm info gallery/moment@1.7.2
    $ spm info gallery
