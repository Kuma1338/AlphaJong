# AlphaJong 中文增强版

[![Mahjong Soul](https://img.shields.io/badge/Mahjong%20Soul-Web%20Userscript-2f80ed)](https://game.maj-soul.com/)
![Mode](https://img.shields.io/badge/Mode-3P%20%2F%204P-success)
![UI](https://img.shields.io/badge/UI-%E4%B8%AD%E6%96%87%E5%8C%96-red)
![Release](https://img.shields.io/badge/Release-v1.3.2--beta--cn-brightgreen)

基于 [Jimboom7/AlphaJong](https://github.com/Jimboom7/AlphaJong) 的雀魂 Web 自动打牌脚本增强版。

这个仓库不是原项目的简单镜像，而是一个面向中文用户、雀魂 Web 实战测试、策略调参和问题复盘的增强版本。

## 直接下载

Release: [v1.3.2-beta-cn](https://github.com/Kuma1338/AlphaJong/releases/tag/v1.3.2-beta-cn)  
文件: `AlphaJong_1.3.2_beta.user.js`

源码包内也已经包含可直接安装的 userscript：

[build/AlphaJong_1.3.2_beta.user.js](./build/AlphaJong_1.3.2_beta.user.js)

## 这个版本做了什么

- 修复关键 BUG
- 中文化用户界面
- 小型 `AJ` 悬浮插件 UI
- 设置面板
- 策略记录窗口
- 导出策略记录 / BUG 数据
- 雀魂 Web 兼容性检查
- 三麻策略微调
- 回归测试
- 发布包内置可安装 `.user.js`

## 和原版相比

| 功能 | 原版 | 增强版 |
|:---|:---|:---|
| 安装包 | 主要依赖 Release / 构建产物 | 仓库和 Release 都包含可直接安装的 `.user.js` |
| 用户界面 | 顶部横向菜单栏 | 小型 `AJ` 方形悬浮插件，点击后展开 |
| 语言 | 主要英文 | 用户层中文化 |
| 策略调参 | 修改源码常量 | 网页内设置面板，自动保存 |
| 决策复盘 | 主要看控制台日志 | 内置策略记录窗口 |
| 数据导出 | 无 | 支持导出策略记录和 BUG 数据 |
| 兼容性检查 | 无可视化入口 | 一键检查雀魂 Web 内部对象和运行态 |
| 三麻支持 | 已有基础规则 | 保留基础规则，并加入三麻策略微调 |
| 回归测试 | 原测试集 | 新增 Node 回归测试覆盖关键修复 |

## 安装方式

1. 安装 [Tampermonkey](https://www.tampermonkey.net/?locale=zh)。
2. 下载 Release 中的 `AlphaJong_1.3.2_beta.user.js`。
3. 在 Tampermonkey 中导入或粘贴该脚本。
4. 打开雀魂 Web 端。
5. 进入对局后，点击页面中的 `AJ` 悬浮按钮展开面板。

## 功能说明

| 功能 | 说明 |
|:---|:---|
| 启动 / 暂停 | 控制脚本是否运行 |
| 自动 / 辅助 | 自动模式直接操作，辅助模式只给推荐 |
| 检查 | 检查雀魂 Web 端对象、几人场、剩余牌数、可操作项 |
| 设置 | 调整进攻、防守、鸣牌、杠牌、立直等参数 |
| 记录 | 查看最近 20 次策略决策 |
| 导出策略记录 | 导出最近决策和当前参数 |
| 导出 BUG 数据 | 导出兼容性、运行态、调试串和最近决策 |

## 推荐参数

### 新手稳健配置

| 参数 | 推荐值 |
|:---|:---|
| 计算精度 | `3` |
| 进攻效率 | `1.0` |
| 防守权重 | `1.1` |
| 先切权重 | `1.0` |
| 鸣牌倾向 | `0.9` |
| 杠牌倾向 | `0.6` |
| 立直倾向 | `1.0` |
| 保留安牌 | 开 |
| 三麻策略微调 | 开 |

### 少点炮配置

| 参数 | 推荐值 |
|:---|:---|
| 防守权重 | `1.2 - 1.4` |
| 鸣牌倾向 | `0.7 - 0.9` |
| 杠牌倾向 | `0.3 - 0.6` |
| 保留安牌 | 开 |

### 更进攻配置

| 参数 | 推荐值 |
|:---|:---|
| 进攻效率 | `1.1 - 1.3` |
| 鸣牌倾向 | `1.0 - 1.2` |
| 立直倾向 | `1.1` |
| 防守权重 | `0.8 - 1.0` |

## 测试结果

```text
python3 build.py
node --check build/AlphaJong_1.3.2_beta.user.js
node test/regression_tests.js
```

原项目完整测试集：

```text
Efficiency: 17/17 passed
Defense: 10/10 passed
Dora: 5/5 passed
Yaku: 19/19 passed
Strategy: 4/4 passed
Waits: 6/6 passed
Call: 7/7 passed
Issue: 5/5 passed
Example: 7/7 passed
```

## 详细更新

完整更新说明见：

[RELEASE_NOTES_CN.md](./RELEASE_NOTES_CN.md)

## 已知风险

本脚本依赖雀魂 Web 前端内部对象，例如：

- `view.DesktopMgr`
- `app.NetAgent`
- `mjcore.E_PlayOperation`
- `uiscript`

如果雀魂更新前端结构，脚本可能需要重新适配。遇到问题时建议先使用：

1. `检查`
2. `记录`
3. `导出BUG数据`

## 致谢与许可证

本项目基于 [Jimboom7/AlphaJong](https://github.com/Jimboom7/AlphaJong) 修改增强。感谢原作者的项目基础。

原项目许可证为 GPL，本仓库继续保留相同许可证。详见 [LICENSE](./LICENSE)。
