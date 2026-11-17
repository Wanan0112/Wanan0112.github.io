# 图片投放说明

作品图都放在 `assets/images/works/`，命名与下面一致，页面会自动显示（不需要改任何代码）。
图片缺失时不会显示破图，而是显示虚线占位框 + 文件名提示，方便对照补齐。

```
assets/images/
├─ cover.jpg                封面主视觉（横版 16:9）✅ 已放入 · 1080×608 / 119KB
├─ portrait.jpg             个人照片（竖幅）✅ 已放入 · 900×1259 / 127KB
└─ works/
   ├─ featured-01.jpg       精选 1 · 风格化石头刀（主视觉）
   ├─ featured-02.jpg       精选 2 · 硬表面工业箱体
   ├─ featured-03.jpg       精选 3 · 自然森林场景（Unreal Engine）
   ├─ featured-04.jpg       精选 4 · 恋语花坊（Unreal Engine）
   ├─ work-3d-01.jpg        三维模型设计 · 风格化石头刀（竖构图）
   ├─ work-3d-02.jpg        三维模型设计 · 石头刀多视图与材质
   ├─ work-3d-03.jpg        三维模型设计 · 硬表面工业箱体
   ├─ work-3d-04.jpg        三维模型设计 · 机器人厨师
   ├─ work-ue-01.jpg        虚幻引擎设计 · 森林场景 视角二
   ├─ work-ue-02.jpg        虚幻引擎设计 · 森林场景 视角三
   ├─ work-ue-03.jpg        虚幻引擎设计 · 恋语花坊 室内空间
   ├─ work-ue-04.jpg        虚幻引擎设计 · 恋语花坊 光照与陈设
   ├─ work-id-01.jpg        交互装置设计 · 电子绦虫 装置全景
   ├─ work-id-02.jpg        交互装置设计 · 电子绦虫 硬件交互
   ├─ work-id-03.jpg        交互装置设计 · 电子绦虫 动态呈现
   ├─ work-viz-01.jpg       信息可视化设计 · 本色共生
   ├─ work-viz-02.jpg       信息可视化设计 · 记忆余烬 动态海报
   ├─ work-viz-03.jpg       信息可视化设计 · 记忆余烬 动态海报 II
   ├─ work-book-01.jpg      绘本 IP 设计 · 五彩缤纷的世界 扉页
   ├─ work-book-02.jpg      绘本 IP 设计 · 黄色世界
   ├─ work-book-03.jpg      绘本 IP 设计 · 蓝色世界
   ├─ work-book-04.jpg      绘本 IP 设计 · 元素交锋
   ├─ work-book-05.jpg      绘本 IP 设计 · 彩虹终章
   ├─ poster-01.jpg         主题海报设计 · 记忆余烬
   ├─ poster-02.jpg         主题海报设计 · 辉煌心景农场
   ├─ poster-03.jpg         主题海报设计 · 本色共生
   ├─ poster-04.jpg         主题海报设计 · 电子绦虫
   ├─ poster-05.jpg         主题海报设计 · 本色共生 · AR 新交互
   ├─ poster-06.jpg         主题海报设计 · 钱塘江潮汐可视化
   ├─ poster-07.jpg         主题海报设计 · 桃花源山人景
   ├─ poster-08.jpg         主题海报设计 · 潮涌钱塘
   ├─ poster-09.jpg         主题海报设计 · Frida Kahlo
   ├─ poster-10.jpg         主题海报设计 · 诗意长河
   ├─ poster-11.jpg         主题海报设计 · 群生 · 共振之浪
   ├─ poster-12.jpg         主题海报设计 · 致 · 能量回响
   ├─ detail-01.jpg         项目详情主视觉 · 石头刀
   ├─ detail-01-a.jpg       项目详情图集 1
   ├─ detail-01-b.jpg       项目详情图集 2
   └─ detail-01-c.jpg       项目详情图集 3
```

简历文件放在 `assets/resume.pdf`，导航栏「简历下载」按钮已直接指向它。

## 小提示

- 推荐格式：jpg（质量 80 左右）或 webp；单张控制在 500KB 以内
- 每张图在 `assets/js/data.js` 里都有一个 `ratio`（宽 ÷ 高）字段，填对后网格按真实比例排版，图片不会被裁切或变形
- 换文件名：改 `data.js` 里对应对象的 `image:` 字段
- 想加作品：往 `data.js` 的 `works` / `posters` / `featured` 数组里加对象，网格自动排布
  （分类作品会归入「三维模型 / 虚幻引擎 / 交互装置 / 信息可视化 / 绘本 IP」分组，展板作品请放进 `posters`）
- 封面图（cover.jpg）当前为 1080×608、119KB；图位是 16:9 横版，换图请保持同比例
- 个人照片（portrait.jpg）建议竖幅 3:4～4:5，换图请保持比例
