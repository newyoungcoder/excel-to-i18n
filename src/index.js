'use strict'

import * as fs from 'fs'
import * as xlsx from 'xlsx/xlsx.mjs'
import { program } from 'commander'
import { promisify } from 'util'

// 使用promisify将fs.writeFile方法转化为Promise形式
const writeFileAsync = promisify(fs.writeFile)

// 设置命令行参数
program
	.option('-i, --input <input>', 'excel路径')
	.option('-o, --output <output>', '输出路径', './')
	.option('-ifc, --ignore-first-col', '忽略第一列', true)
	.option('-k, --key <key>', '第几列作为key', 0)

// 解析命令行参数
program.parse()
const {
	input: inputPath,
	output: outputPath,
	ignoreFirstCol,
	key: keyCol,
} = program.opts()
console.log('keyCol: ', typeof keyCol, keyCol)

// 使用xlsx的set_fs方法设置fs
xlsx.set_fs(fs)

// 读取Excel文件
const workbook = xlsx.readFileSync(inputPath)

// 定义i18n对象和keys数组
const i18n = {}

for (const sheetName in workbook.Sheets) {
	if (Object.hasOwnProperty.call(workbook.Sheets, sheetName)) {
		const worksheet = workbook.Sheets[sheetName]

		// 将Excel数据转换成JSON格式
		let jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

		// 如果忽略第一列，移除每个子数组的第一个元素
		if (ignoreFirstCol) {
			jsonData = jsonData.map((item) => {
				item.shift()
				return item
			})
		}

		const keys = jsonData[0].map((col) => {
			if (!i18n[col]) {
				i18n[col] = {}
			}
			return col
		})

		// 移除jsonData中的第一个子数组
		jsonData = jsonData.slice(1)

		// 遍历jsonData，生成i18n对象
		jsonData.forEach((row) => {
			let key = row[+keyCol]
			row.forEach((col, colIndex) => {
				i18n[keys[colIndex]][key] = col
			})
		})
	}
}
// 生成TypeScript语言文件内容的异步函数
const generateLanguageFile = async (language, data) => {
	const tsContent = `export default ${JSON.stringify(data, null, 2)};\n`
	// 使用异步写入文件
	await writeFileAsync(`${outputPath + language}.ts`, tsContent)
	console.log(`${language}.ts 已生成！`)
}

// 遍历i18n对象，调用生成语言文件的异步函数
for (const language in i18n) {
	if (Object.hasOwnProperty.call(i18n, language)) {
		await generateLanguageFile(language, i18n[language])
	}
}
