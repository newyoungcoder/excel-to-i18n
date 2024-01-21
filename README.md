# excel-to-i18n

基本使用：`convert --input ./src/i18n/i18n.xlsx --output ./src/i18n/`

默认忽略第一列，关闭：`convert --input ./src/i18n/i18n.xlsx --output ./src/i18n/ --ignore-first-col false`

默认第 1 列作为 i18n 的 key，可通过传递参数修改：`convert --input ./src/i18n/i18n.xlsx --output ./src/i18n/ --key 0`
