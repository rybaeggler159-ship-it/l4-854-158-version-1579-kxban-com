纯静态电影网站文件说明

入口文件：index.html
影片总数：2000
详情页目录：movies/
样式与交互：assets/style.css、assets/site.js、assets/player.js、assets/movies.js

图片约定：页面已按要求引用网站顶级目录下的 1.jpg 到 150.jpg，影片封面会按序循环引用。
如果当前 ZIP 中未包含这些图片，请将 1.jpg、2.jpg ... 150.jpg 放到 index.html 同级目录。

播放源说明：原始影片数据未提供逐条播放源，详情页已统一绑定可初始化的 HLS m3u8 播放线路。
如需替换为真实影片源，可批量修改 movies/*.html 中的 data-m3u8 属性。
