#!/usr/bin/env node
// validate_yaml_loose.js
// 先在此目录运行：npm install yaml

const { parseDocument } = require('yaml');

(async function(){
  let input = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', c=> input+=c);
  process.stdin.on('end', ()=>{
    const list = JSON.parse(input);
    const results = list.map(({participantId, code})=>{
      // —— 1) 预处理：把所有制表符改成两个空格 —— 
      const fixedCode = code.replace(/\t/g,'  ');
      // —— 2) 告诉 parser: uniqueKeys:false （允许重复键，不报 fatal） ——
      const doc = parseDocument(fixedCode, {
        prettyErrors: false,
        strict: false,
        uniqueKeys: false
      });

      // duplicates now go into doc.warnings, not doc.errors
      const fatal    = doc.errors.map(e=>e.message);
      const warnings = (doc.warnings||[]).map(w=>w.message);
      let parsed = null;
      if(fatal.length===0){
        try{ parsed = doc.toJS() }catch(_){ parsed = null }
      }

      return {
        participantId,
        parsed_valid:  fatal.length===0,
        fatal_errors:  fatal,
        warnings,
        parsed
      };
    });

    process.stdout.write(JSON.stringify(results, null, 2));
  });
})();


// #!/usr/bin/env node
// // validate_yaml_loose.js
// // 先在此目录下执行一次： npm install yaml

// const { parseDocument } = require('yaml');

// let input = '';
// process.stdin.setEncoding('utf-8');
// process.stdin.on('data', chunk => input += chunk);
// process.stdin.on('end', () => {
//   let list;
//   try {
//     list = JSON.parse(input);
//   } catch (e) {
//     console.error('Failed to parse JSON input:', e.message);
//     process.exit(1);
//   }

//   const results = list.map(({ participantId, code }) => {
//     const doc = parseDocument(code, { prettyErrors: false });
//     const fatal    = doc.errors    .map(e => e.message);
//     const warnings = (doc.warnings||[]).map(w => w.message);
//     let parsed = null;
//     if (fatal.length === 0) {
//       try { parsed = doc.toJS(); } catch(_) { parsed = null; }
//     }
//     return { participantId, parsed_valid: fatal.length===0,
//              fatal_errors: fatal, warnings, parsed };
//   });

//   process.stdout.write(JSON.stringify(results, null, 2));
// });
