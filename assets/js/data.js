/* ============================================================
   站点内容配置
   ------------------------------------------------------------
   唯一需要你维护内容的文件，页面结构由 main.js 自动渲染。
   ratio = 图片宽高比（宽 ÷ 高），排版时保持图片不变形、不裁切。
   图片目录：assets/images/ （cover / portrait / works）
   ============================================================ */

window.SITE_DATA = {
  /* ---------- 个人信息 ---------- */
  profile: {
    name: '朱宸熠',
    role: '3D 建模师',
    email: '3543157951@qq.com',
    phone: '17866228072',
    city: '武汉',
  },

  /* ---------- 封面文案 ---------- */
  cover: {
    sub: '朱宸熠 · 3D 建模师 / 场景设计',
    desc: '湖北美术学院艺术与科技专业在读，主攻三维模型与场景设计，兼顾视觉与交互表达。',
    cap: '主视觉插画 · 个人创作',
  },

  /* ---------- 关键词跑马灯 ---------- */
  marquee: ['三维模型', '场景地编', 'PBR 材质', '视觉设计', '信息可视化', '交互装置', '绘本 IP'],

  /* ---------- 分类筛选 ---------- */
  filters: ['全部', '三维模型', '虚幻引擎', '交互装置', '信息可视化', '绘本 IP'],

  /* ---------- 全部作品的分组顺序 ---------- */
  groups: [
    { cat: '三维模型', label: '三维模型设计' },
    { cat: '虚幻引擎', label: '虚幻引擎设计' },
    { cat: '交互装置', label: '交互装置设计' },
    { cat: '信息可视化', label: '信息可视化设计' },
    { cat: '绘本 IP', label: '绘本 IP 设计' },
  ],

  /* ---------- 精选作品（沉浸场景里的悬浮卡片） ---------- */
  featured: [
    {
      id: 'f1',
      title: '风格化石头刀',
      client: '个人练习 · 雕刻造型',
      category: '三维模型',
      year: '2025',
      image: 'assets/images/works/featured-01.jpg',
      ratio: 2.321,
      shape: 'wide',
      rot: '-3deg',
      detail: {
        subtitle: '以火山岩为母题的风格化武器雕刻练习，从高模形体到 PBR 材质全流程自建',
        desc: '从岩石原画出发，先用 ZBrush 雕刻出高低模形体，再在 3ds Max 中整理拓扑与 UV，最后用 Substance Painter 绘制熔岩裂纹与岩石层理的自定义材质，并输出三视图与多角度渲染。',
        facts: [
          { k: '角色', v: '独立完成' },
          { k: '时间', v: '2025' },
          { k: '工具', v: '3ds Max / ZBrush / Substance Painter' },
          { k: '类型', v: '风格化雕刻 · PBR 材质' },
        ],
        hero: 'assets/images/works/detail-01.jpg',
        strip: [
          'assets/images/works/detail-01-a.jpg',
          'assets/images/works/detail-01-b.jpg',
          'assets/images/works/detail-01-c.jpg',
        ],
      },
    },
    {
      id: 'f2',
      title: '硬表面工业箱体',
      client: '个人练习 · 硬表面建模',
      category: '三维模型',
      year: '2025',
      image: 'assets/images/works/featured-02.jpg',
      ratio: 2.321,
      shape: 'wide',
      rot: '2.5deg',
      detail: {
        subtitle: '带磨损与锈迹的工业箱体，硬表面结构与旧化材质的练习',
        desc: '以工业废料箱为原型做硬表面练习，重点解决结构分件、铰链与提手细节，以及旧化材质中锈迹、掉漆与污渍的叠加，最终输出多视角展示图。',
        facts: [
          { k: '角色', v: '独立完成' },
          { k: '时间', v: '2025' },
          { k: '工具', v: '3ds Max / Substance Painter' },
          { k: '类型', v: '硬表面 · 旧化材质' },
        ],
        hero: 'assets/images/works/featured-02.jpg',
        strip: [
          'assets/images/works/work-3d-03.jpg',
          'assets/images/works/work-3d-04.jpg',
          'assets/images/works/work-3d-01.jpg',
        ],
      },
    },
    {
      id: 'f3',
      title: '自然森林场景',
      client: '个人练习 · Unreal Engine',
      category: '虚幻引擎',
      year: '2025',
      image: 'assets/images/works/featured-03.jpg',
      ratio: 2.055,
      shape: 'wide',
      rot: '2deg',
      detail: {
        subtitle: '以自然林地为主题的场景搭建，重点处理植被层次、体积光与湿地反射',
        desc: '在 Unreal Engine 中搭建自然林地场景，用程序化植被与地形工具控制分布密度，再通过体积雾与定向光塑造林间层次，让视线自然收束到画面中心。',
        facts: [
          { k: '角色', v: '独立完成' },
          { k: '时间', v: '2025' },
          { k: '工具', v: 'Unreal Engine 5 / World Creator' },
          { k: '类型', v: '游戏场景 · 植被与光照' },
        ],
        hero: 'assets/images/works/featured-03.jpg',
        strip: [
          'assets/images/works/work-ue-01.jpg',
          'assets/images/works/work-ue-02.jpg',
          'assets/images/works/work-ue-04.jpg',
        ],
      },
    },
    {
      id: 'f4',
      title: '恋语花坊',
      client: '心绘万象 · 场景设计比赛',
      category: '虚幻引擎',
      year: '2025.07',
      image: 'assets/images/works/featured-04.jpg',
      ratio: 2.252,
      shape: 'wide',
      rot: '-2deg',
      detail: {
        subtitle: '叠纸「心绘万象」场景设计创意大赛参赛作品，以花店空间为载体的室内场景',
        desc: '为叠纸「心绘万象」场景设计创意大赛创作的花店空间，主题是「会说话的植物」；从概念设定到资产摆放、灯光与材质调试均在引擎内完成，作品上线后累计热度近 8000。',
        facts: [
          { k: '角色', v: '场景设计与制作' },
          { k: '时间', v: '2025.07 - 2025.08' },
          { k: '工具', v: 'Unreal Engine 5 / Photoshop' },
          { k: '成绩', v: '作品热度近 8000' },
        ],
        hero: 'assets/images/works/featured-04.jpg',
        strip: [
          'assets/images/works/work-ue-03.jpg',
          'assets/images/works/work-ue-04.jpg',
          'assets/images/works/work-ue-02.jpg',
        ],
      },
    },
  ],

  /* ---------- 全部作品（按专业方向分类排版） ---------- */
  works: [
    { id: 'w3d2', title: '石头刀 · 多视图与材质', category: '三维模型', meta: 'PBR 材质', image: 'assets/images/works/work-3d-02.jpg', ratio: 3.19 },
    { id: 'w3d3', title: '硬表面工业箱体', category: '三维模型', meta: '硬表面建模', image: 'assets/images/works/work-3d-03.jpg', ratio: 1 },
    { id: 'w3d4', title: '机器人厨师', category: '三维模型', meta: '大厂测试题', image: 'assets/images/works/work-3d-04.jpg', ratio: 2.321 },
    { id: 'w3d1', title: '风格化石头刀', category: '三维模型', meta: '雕刻造型', image: 'assets/images/works/work-3d-01.jpg', ratio: 0.6 },
    { id: 'wue1', title: '森林场景 · 视角二', category: '虚幻引擎', meta: 'Unreal Engine', image: 'assets/images/works/work-ue-01.jpg', ratio: 2.055 },
    { id: 'wue2', title: '森林场景 · 视角三', category: '虚幻引擎', meta: 'Unreal Engine', image: 'assets/images/works/work-ue-02.jpg', ratio: 2.055 },
    { id: 'wue3', title: '恋语花坊 · 室内空间', category: '虚幻引擎', meta: '心绘万象参赛作品', image: 'assets/images/works/work-ue-03.jpg', ratio: 2.252 },
    { id: 'wue4', title: '恋语花坊 · 光照与陈设', category: '虚幻引擎', meta: 'Unreal Engine', image: 'assets/images/works/work-ue-04.jpg', ratio: 1.778 },
    { id: 'wid2', title: '电子绦虫 · 硬件交互', category: '交互装置', meta: '传感器交互', image: 'assets/images/works/work-id-02.jpg', ratio: 1.334 },
    { id: 'wid3', title: '电子绦虫 · 动态呈现', category: '交互装置', meta: '实时渲染', image: 'assets/images/works/work-id-03.jpg', ratio: 1.334 },
    { id: 'wid1', title: '电子绦虫 · 装置全景', category: '交互装置', meta: '装置艺术', image: 'assets/images/works/work-id-01.jpg', ratio: 0.75 },
    { id: 'wvz1', title: '本色共生', category: '信息可视化', meta: '苏州本色美术馆', image: 'assets/images/works/work-viz-01.jpg', ratio: 1.366 },
    { id: 'wvz2', title: '记忆余烬 · 动态海报', category: '信息可视化', meta: '动态海报', image: 'assets/images/works/work-viz-02.jpg', ratio: 1 },
    { id: 'wvz3', title: '记忆余烬 · 动态海报 II', category: '信息可视化', meta: '音画交互', image: 'assets/images/works/work-viz-03.jpg', ratio: 1 },
    { id: 'wbk1', title: '五彩缤纷的世界 · 扉页', category: '绘本 IP', meta: '绘本创作', image: 'assets/images/works/work-book-01.jpg', ratio: 1.4 },
    { id: 'wbk2', title: '五彩缤纷的世界 · 黄色世界', category: '绘本 IP', meta: '绘本创作', image: 'assets/images/works/work-book-02.jpg', ratio: 1.401 },
    { id: 'wbk3', title: '五彩缤纷的世界 · 蓝色世界', category: '绘本 IP', meta: '绘本创作', image: 'assets/images/works/work-book-03.jpg', ratio: 1.401 },
    { id: 'wbk4', title: '五彩缤纷的世界 · 元素交锋', category: '绘本 IP', meta: '绘本创作', image: 'assets/images/works/work-book-04.jpg', ratio: 1.4 },
    { id: 'wbk5', title: '五彩缤纷的世界 · 彩虹终章', category: '绘本 IP', meta: '绘本创作', image: 'assets/images/works/work-book-05.jpg', ratio: 1.4 },
  ],

  /* ---------- 主题海报设计（展板作品，单独成区） ---------- */
  posters: [
    { id: 'p01', title: '记忆余烬', meta: '信息可视化展板', image: 'assets/images/works/poster-01.jpg', ratio: 0.667 },
    { id: 'p02', title: '辉煌心景农场', meta: '园区规划展板', image: 'assets/images/works/poster-02.jpg', ratio: 0.667 },
    { id: 'p03', title: '本色共生', meta: '数字媒介转译', image: 'assets/images/works/poster-03.jpg', ratio: 0.666 },
    { id: 'p04', title: '电子绦虫', meta: '装置艺术展板', image: 'assets/images/works/poster-04.jpg', ratio: 0.671 },
    { id: 'p05', title: '本色共生 · AR 新交互', meta: '交互展示', image: 'assets/images/works/poster-05.jpg', ratio: 0.664 },
    { id: 'p06', title: '钱塘江潮汐可视化', meta: '数据叙事', image: 'assets/images/works/poster-06.jpg', ratio: 0.56 },
    { id: 'p07', title: '桃花源山人景', meta: '空间设计展板', image: 'assets/images/works/poster-07.jpg', ratio: 0.692 },
    { id: 'p08', title: '潮涌钱塘', meta: '水文数据展板', image: 'assets/images/works/poster-08.jpg', ratio: 0.562 },
    { id: 'p09', title: 'Frida Kahlo', meta: '视觉设计海报', image: 'assets/images/works/poster-09.jpg', ratio: 0.707 },
    { id: 'p10', title: '诗意长河', meta: '景观手绘展板', image: 'assets/images/works/poster-10.jpg', ratio: 0.667 },
    { id: 'p11', title: '群生 · 共振之浪', meta: '交互装置展板', image: 'assets/images/works/poster-11.jpg', ratio: 0.706 },
    { id: 'p12', title: '致 · 能量回响', meta: '科幻视觉展板', image: 'assets/images/works/poster-12.jpg', ratio: 0.667 },
  ],

  /* ---------- 技能标签 ---------- */
  skills: [
    '3ds Max', 'ZBrush', 'Substance Painter', 'TopoGun', 'Unreal Engine',
    'Photoshop', 'KeyShot', 'RizomUV', 'SketchUp', 'CAD',
  ],

  /* ---------- 履历时间线 ---------- */
  timeline: [
    { year: '2024.09 - 2028.06', text: '湖北美术学院 · 艺术与科技专业（GPA 3.7/4.0）' },
    { year: '2025.07 - 2025.08', text: '心绘万象场景设计比赛 · 《恋语花坊》' },
    { year: '2025.09 - 2025.10', text: '空间与建构课程 · 婚礼设计《红光殿堂》' },
  ],

  /* ---------- 获奖 / 荣誉 ---------- */
  honors: [
    { year: '2025', text: '湖北美术学院主题创作作品留存证书' },
    { year: '2025', text: '湖北美术学院展览与综合作品留存证书' },
    { year: '2025', text: '环境艺术学院优秀志愿者称号' },
  ],

  /* ---------- 我能做什么 ---------- */
  services: [
    {
      title: '三维模型',
      desc: '从概念到成品的完整模型能力',
      icon: 'model',
      list: ['风格化雕刻与角色', '硬表面与道具建模', 'PBR 材质与贴图'],
    },
    {
      title: '游戏地编',
      desc: '在引擎里把场景搭起来、点亮它',
      icon: 'scene',
      list: ['Unreal Engine 场景搭建', '灯光与氛围塑造', '植被与资产摆放'],
    },
    {
      title: '视觉设计',
      desc: '信息可视化、展板与动态海报',
      icon: 'brand',
      list: ['信息可视化设计', '展览展板排版', '动态海报'],
    },
    {
      title: '交互设计',
      desc: '装置艺术与软硬件互动呈现',
      icon: 'exhibit',
      list: ['装置结构与搭建', '传感器交互逻辑', '程序化动画'],
    },
  ],

  /* ---------- 联系方式 ---------- */
  contactLinks: [
    { label: '3543157951@qq.com', href: 'mailto:3543157951@qq.com' },
    { label: '17866228072', href: 'tel:17866228072' },
    { label: '武汉 · 可线下沟通', href: '#' },
    { label: '求职意向：3D 建模师', href: '#' },
  ],

  /* ---------- 社交图标（页脚） ---------- */
  socials: [
    { label: 'WB', href: '#', title: '微博（链接待补充）' },
    { label: 'XHS', href: '#', title: '小红书（链接待补充）' },
    { label: 'ZCOOL', href: '#', title: '站酷（链接待补充）' },
    { label: 'GH', href: '#', title: 'GitHub（链接待补充）' },
  ],
};
