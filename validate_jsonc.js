// validate_jsonc.js
const fs = require('fs');
const { parse, ParseErrorCode } = require('jsonc-parser');

// 将 ParseErrorCode 映射到可读信息
const ERROR_MESSAGES = {
  [ParseErrorCode.InvalidSymbol]:          'Invalid symbol',
  [ParseErrorCode.InvalidNumberFormat]:    'Invalid number format',
  [ParseErrorCode.PropertyNameExpected]:   'Property name expected',
  [ParseErrorCode.ValueExpected]:          'Value expected',
  [ParseErrorCode.ColonExpected]:          'Colon expected',
  [ParseErrorCode.CommaExpected]:          'Comma expected',
  [ParseErrorCode.CloseBraceExpected]:     'Closing brace `}` expected',
  [ParseErrorCode.CloseBracketExpected]:   'Closing bracket `]` expected',
  [ParseErrorCode.EndOfFileExpected]:      'End of file expected',
  [ParseErrorCode.InvalidCommentToken]:    'Invalid comment token',
  [ParseErrorCode.UnexpectedEndOfComment]: 'Unexpected end of comment',
  [ParseErrorCode.UnexpectedEndOfString]:  'Unexpected end of string',
  [ParseErrorCode.UnexpectedEndOfNumber]:  'Unexpected end of number',
  [ParseErrorCode.InvalidUnicode]:         'Invalid Unicode escape',
  [ParseErrorCode.InvalidEscapeCharacter]: 'Invalid escape character',
  [ParseErrorCode.InvalidCharacter]:       'Invalid character'
};

function validateJSONCStrings(dataList) {
  return dataList.map(({ participantId, format, code }) => {
    // 收集所有解析错误
    const errors = [];
    parse(code, errors, {
      allowTrailingComma: true,
      disallowComments: false
    });

    // 构造可读的错误信息
    const errorMessage = errors
      .map(e => {
        const msg = ERROR_MESSAGES[e.error] || `Unknown error ${e.error}`;
        return `${msg} at offset ${e.offset}`;
      })
      .join('; ');

    return {
      participantId,
      format,
      valid: errors.length === 0,
      errorMessage
    };
  });
}

function main() {
  const input = fs.readFileSync(0, 'utf-8');
  const data = JSON.parse(input);
  const results = validateJSONCStrings(data);
  process.stdout.write(JSON.stringify(results, null, 2));
}

main();
