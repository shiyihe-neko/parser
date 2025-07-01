#!/usr/bin/env node
// validate_toml.js
//
// 安装依赖：在此目录下执行一次
//   npm install @iarna/toml json5

const fs    = require("fs");
const toml  = require("@iarna/toml");
const JSON5 = require("json5");

// —— 宽松预处理 ——
//   1) 删尾逗号（数组、内联表末尾）
//   2) 给不合法键名自动加双引号
//   3) 统一 = 两侧空格
function preprocessLoose(txt) {
  // 1) 尾逗号
  txt = txt.replace(/,\s*([\]\}])/g, "$1");
  // 2) 键名如果含空白或特殊字符，自动加引号
  txt = txt.replace(
    /^([A-Za-z0-9_-]+?)\s*=/gm,
    (_, key) => {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key + " =";
      return `"${key}" =`;
    }
  );
  // 3) 等号两侧
  txt = txt.replace(/\s*=\s*/g, " = ");
  return txt;
}

async function main() {
  // 1) 从 stdin 读入 JSON 数组
  const input = fs.readFileSync(0, "utf-8");
  let list;
  try {
    list = JSON.parse(input);
  } catch (e) {
    console.error("❌ 无法解析输入 JSON:", e.message);
    process.exit(1);
  }

  // 2) 依次处理每一条
  const results = list.map(({ participantId, code }) => {
    // 严格解析
    let strictValid = true;
    let strictError = null;
    let strictObj   = null;
    try {
      strictObj = toml.parse(code);
    } catch (e) {
      strictValid = false;
      strictError = e.message.split("\n")[0];
    }

    // 宽松解析
    const fixed = preprocessLoose(code);
    let looseValid = true;
    let looseError = null;
    let looseObj   = null;
    try {
      looseObj = toml.parse(fixed);
    } catch (e1) {
      // 第一阶段 TOML 仍失败，尝试 JSON5 兜底
      const tomlErr = e1.message.split("\n")[0];
      try {
        looseObj   = JSON5.parse(fixed);
        looseValid = true;
        looseError = `TOML error: ${tomlErr}`;
      } catch (e2) {
        looseValid = false;
        looseError = `TOML error: ${tomlErr}; JSON5 fallback error: ${e2.message.split("\n")[0]}`;
      }
    }

    return {
      participantId,
      // 严格输出
      strict_valid: strictValid,
      strict_error: strictError,
      strict_parsed: strictValid ? strictObj : null,
      // 宽松输出
      loose_valid: looseValid,
      loose_error: looseError,
      loose_parsed: looseValid ? looseObj : null,
    };
  });

  // 3) 输出 JSON
  process.stdout.write(JSON.stringify(results, null, 2));
}

main();
