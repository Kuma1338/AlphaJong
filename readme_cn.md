## 关于这个工程

这是一个关于[雀魂](https://game.maj-soul.com/)麻将的AI项目，该项目可以直接在任何浏览器中运行。所有的内容都是使用原生JavaScript从头开始写的，没有任何库依赖。

这个AI没有使用深度学习，而是使用传统的算法。简单地说，它可以计算模拟一些回合，根据弃牌来寻找最佳的行为。 

该AI目前支持3麻和4麻两种模式。  

[![Mahjong Soul](https://img.shields.io/badge/Mahjong%20Soul-Web%20Userscript-2f80ed)](https://game.maj-soul.com/)
![Mode](https://img.shields.io/badge/Mode-3P%20%2F%204P-success)
![Language](https://img.shields.io/badge/UI-%E4%B8%AD%E6%96%87%E5%8C%96-red)
![Tests](https://img.shields.io/badge/Tests-80%2F80%20passed-brightgreen)

## AlphaJong 增强版更新总览

本分支在原项目基础上做了一轮面向“雀魂 Web 实战可用性”的增强：修复会影响自动打牌的关键问题，补齐三麻/四麻策略细节，加入中文用户界面、可视化调参、兼容性检查、非阻塞策略记录窗口以及一键导出诊断数据。

### 这次主要做了什么

| 模块 | 原项目状态 | 增强后 |
|:---|:---|:---|
| 稳定性 | 个别边界会触发异常或无效分支 | 修复开副露弃牌崩溃、役牌危险度、立直多宝牌指示牌、空牌墙、空鸣牌组合等问题 |
| 雀魂 Web 适配 | 直接依赖雀魂内部对象，缺少可视化检查 | 新增“检查”按钮，显示对象兼容性、几人场、剩余牌数、可操作项和房间信息 |
| 三麻/四麻 | 已有基础规则分支 | 保留原三麻规则，并加入三麻策略微调开关，三麻下略微调整防守、鸣牌、立直权重 |
| 用户界面 | 主要是英文按钮和状态 | 用户层按钮、状态、策略名和操作提示中文化 |
| 策略调参 | 需要改源码常量 | 新增“设置”面板，可在网页内调节进攻、防守、鸣牌、杠牌、立直等参数并持久保存 |
| 决策复盘 | 需要看控制台日志 | 新增“记录”小窗口，展示最近 20 次策略决策，不阻塞游戏页面 |
| 数据导出 | 无 | 支持导出策略记录和 BUG 诊断数据，方便复盘或反馈问题 |
| 测试 | 原测试集 | 新增 Node 回归测试，覆盖已修复 BUG、三麻权重、决策记录和导出数据 |

### 已修复的关键问题

| 优先级 | 文件 | 问题 | 处理 |
|:---|:---|:---|:---|
| P1 | `src/ai_offense.js` | 开副露后特定弃牌路径引用不存在的 `tileLeft`，会导致自动出牌中断 | 改为正确的 `tilesLeft` 并加入回归测试 |
| P2 | `src/ai_defense.js` | 役牌危险度调用 `getNumberOfTilesAvailable` 时参数顺序反了，导致役牌危险加成失效 | 修正为 `(index, type)` |
| P2 | `src/utils.js` | 立直判断误用 `tilePrio.dora.length`，多宝牌指示牌分支永远不触发 | 改为全局 `dora.length` |
| P2 | 多处 | 空牌墙、无可能听牌、空鸣牌组合等边界可能产生异常或无效数值 | 增加保护分支，避免 `Infinity`、`NaN` 和异常 |

### 新增界面说明

| 按钮 | 作用 |
|:---|:---|
| 启动 / 暂停 | 控制 AI 是否运行 |
| 自动 / 辅助 | 自动模式会直接操作；辅助模式只给推荐，不自动操作 |
| 检查 | 检查雀魂 Web 端内部对象是否仍兼容，并显示当前运行态 |
| 设置 | 打开策略调参面板 |
| 记录 | 打开非阻塞策略记录窗口，可刷新、导出、清空 |
| 隐藏 | 隐藏脚本 UI |

### 推荐给新手的参数

| 参数 | 推荐值 | 说明 |
|:---|:---|:---|
| 计算精度 | `3` | 兼顾速度和质量 |
| 进攻效率 | `1.0` | 保持默认牌效 |
| 防守权重 | `1.1` | 对新手更稳，减少点炮 |
| 鸣牌倾向 | `0.9` | 避免过度吃碰导致无役或低价值 |
| 杠牌倾向 | `0.6` | 降低乱杠带来的风险 |
| 立直倾向 | `1.0` | 保持标准立直策略 |
| 保留安牌 | 开 | 给对手立直后的防守留余地 |
| 三麻策略微调 | 开 | 三麻场自动启用更合适的微调权重 |

### 当前验证结果

```text
Regression tests passed.

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

### 仍需注意

这个脚本依赖雀魂 Web 前端内部对象，例如 `view.DesktopMgr`、`app.NetAgent` 和 `mjcore.E_PlayOperation`。如果雀魂更新前端结构，脚本仍可能需要再次适配。遇到异常时可以点击“检查”和“记录 -> 导出BUG数据”，把导出的 JSON 用于定位问题。

[Click here for the English readme.](https://github.com/Jimboom7/AlphaJong/blob/master/readme.md)  
[日本語のリードミーはこちら.](https://github.com/Jimboom7/AlphaJong/blob/master/readme_jp.md)  

## 如何上手

* 安装一个可以让你运行用户脚本的浏览器扩展，如 [Tampermonkey](https://www.tampermonkey.net/?locale=zh)油猴插件。
* 直接点击构建好的网页文件 [release of this project](https://github.com/Jimboom7/AlphaJong/releases) ，并将其安装在你的浏览器扩展中。 (对于油猴插件，你可以在实用工具->从URL安装中输入下载地址)。
* 打开 [雀魂](https://game.maj-soul.com/1/) (打开之前确定你已经登录进雀魂)。
* 进入任一一个对局，当对局开始点击“Start Bot”。
* 你可以勾选 “Autostart new Game”，AI会自动启动新的游戏。
* 对局输出的日志将会显示在浏览器控制台 (Ctrl + Shift + J [Chrome] or Ctrl + Shift + K [Firefox])。

### 续命说明
请参考[雀魂mod_plus](https://github.com/Avenshy/majsoul_mod_plus)的续命说明。

### UI
![GUI](./doc/img/gui.png)
UI非常简单，你可以轻易地控制AI。
* Start bot: 启动或者关闭AI自动打牌。
* Auto: 当前 AI 模式，有两种
  * AUTO：自动帮玩家操作
  * HELP：只提示当前行为，不自动操作
* Autostart: 启用自动运行模式。AI将自动重新加载网站，并在前一个游戏结束后搜索一个新的游戏。需要打的段位可以在旁边的组合框中选择。(目前仅支持到金之间的所有模式)
* Output Field: 简单展示AI目前正在准备做什么。
* Hide GUI: 隐藏UI。你可以通过在键盘上按“+”来重新显示它。

### AI参数
默认的参数在通常情况下是合适的。如果你想修改机器人的行为（例如，更具有攻击性的风格等），你可以在脚本的顶部改变一些常量。

* Defense Constants: 修改AI对于防守弃胡的数值
* Calls: 修改AI在听牌阶段的修正量（了解日麻的应该都懂听牌的修正量）
* Hand Evaluation Constants: 修改手牌速胡计算方式。影响AI是否选择屁胡或者考虑做个宝牌战士或者役满大哥。
* Strategy Constants: 修改可以针对七对子，国士无双十三幺，立直后听牌数，听牌巡的修改。

## 统计

![1TB%80YVKEQ(IOL@DX1C72C](https://i.imgur.com/i8huL5J.png)

目前这个AI可以上分到雀豪段位，雀豪之后的路需要大家自己调整。

![Yakuman](https://i.imgur.com/j6j2f2V.png)

## 测试

目前项目包含AI对于日麻（何切）问题的测试样例。

## 已知问题

- 有时游戏会因为暂离而断开你的连接。这通常发生在窗口被最小化或你切换到另一个标签的时候（只要窗口是在桌面显示活动的，那就算开着网页看电影也没关系的）。如果发生这种情况，AI将尝试通过重新加载页面来重新连接。

## 中英文对照表

|英文|中文|
|:---|:---|
|tile|牌|
|wall|牌山|
|stack|一摞(上下两张)|
|pin(circles)|饼|
|pinzu|筒子|
|so(bamboo)|索|
|sozu|索子|
|wan(characters)|万|
|wanzu(manzu)|万子|
|jihai(honor)|字牌|
|wind tile|风牌(东南西北)|
|dragon tile|三元牌(白发中)|
|dora|宝牌|
|iipin|一饼|
|ryanpin|二饼|
|sanpin|三饼|
|supin|四饼|
|upin|五饼|
|ropin|六饼|
|chiipin|七饼|
|papin|八饼|
|chupin|九饼|
|iiso|一索|
|ryanso|二索|
|sanso|三索|
|suso|四索|
|uso|五索|
|roso|六索|
|chiiso|七索|
|paso|八索|
|chuso|九索|
|iiwan|一万|
|ryanwan|二万|
|sanwan|三万|
|suwan|四万|
|uwan|五万|
|rowan|六万|
|chiiwan|七万|
|pawan|八万|
|chuwan|九万|
|ton(east)|东风|
|nan(south)|南风|
|sha(west)|西|
|pei(north)|北|
|haku|白|
|hatsu|发|
|chun|中|
|groups(mentsu)|面子|
|meld|组(一个顺子、刻子或杠子)|
|call(meld, naki)|鸣|
|triplets(kotsu)|刻子|
|sequences(shuntsu)|顺子|
|chii|吃|
|pon|碰|
|kan|杠|
|ron|荣|
|yaku|役|
|han|翻|
|fold|副露|
|yakuman|役满|
|yakuhai|役牌|
|riichi|立直|
|tanyao|断幺九|
|pinfu|平和|
|iipeikou|一盃口|
|sanankou|三暗刻|
|sankantsu|三杠子|
|toitoi|对对和|
|chiitoitsu|七对子|
|sanshoku doukou|三色同刻|
|sanshoku Doujun|三色同顺|
|shousangen|小三元|
|chanta(honchantaiyaochuu)|混全带幺九|
|honrou|混老头|
|ikkitsuukan(pure straight)|一气通贯|
|ryanpeikou|一盃口|
|closed|门清|
|junchan(junchantaiyaochuu)|纯全带幺九|
|honiisou|混一色|
|chiniisou|清一色|
|tenpai|听牌|
|daisangen|大三元|
|suuankou|四暗刻|
|tsuuiisou|字一色|
|ryuuiisou|绿一色|
|chinroutou|清老头|
|shousuushii|小四喜|
|suukantsu|四杠子|
|chuuren poutou|九莲宝灯|
|kokushi musou(thirteen orphans)|国士无双|
|suuankou tanki|四暗刻单骑|
|kokushi musou juusan menmachi|国士无双十三面|
|junsei chuuren poutou|纯正九莲宝灯|
|daisuushii|大四喜|
|furiten|振听|

参考链接：https://riichi.wiki/List_of_terminology_translations

翻译By: [Nifilmjon](https://github.com/Nifilmjon), [yangruihan](https://github.com/yangruihan)
