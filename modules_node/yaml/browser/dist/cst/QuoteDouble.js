import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _inherits from "@babel/runtime/helpers/inherits";
import { YAMLSemanticError, YAMLSyntaxError } from '../errors';
import Node from './Node';
import Range from './Range';

var QuoteDouble = /*#__PURE__*/function (_Node) {
  _inherits(QuoteDouble, _Node);

  function QuoteDouble() {
    _classCallCheck(this, QuoteDouble);

    return _possibleConstructorReturn(this, _getPrototypeOf(QuoteDouble).apply(this, arguments));
  }

  _createClass(QuoteDouble, [{
    key: "parseCharCode",
    value: function parseCharCode(offset, length, errors) {
      var src = this.context.src;
      var cc = src.substr(offset, length);
      var ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      var code = ok ? parseInt(cc, 16) : NaN;

      if (isNaN(code)) {
        errors.push(new YAMLSyntaxError(this, "Invalid escape sequence ".concat(src.substr(offset - 2, length + 2))));
        return src.substr(offset - 2, length + 2);
      }

      return String.fromCodePoint(code);
    }
    /**
     * Parses a "double quoted" value from the source
     *
     * @param {ParseContext} context
     * @param {number} start - Index of first character
     * @returns {number} - Index of the character after this scalar
     */

  }, {
    key: "parse",
    value: function parse(context, start) {
      this.context = context;
      var src = context.src;
      var offset = QuoteDouble.endOfQuote(src, start + 1);
      this.valueRange = new Range(start, offset);
      offset = Node.endOfWhiteSpace(src, offset);
      offset = this.parseComment(offset);
      return offset;
    }
  }, {
    key: "strValue",

    /**
     * @returns {string | { str: string, errors: YAMLSyntaxError[] }}
     */
    get: function get() {
      if (!this.valueRange || !this.context) return null;
      var errors = [];
      var _this$valueRange = this.valueRange,
          start = _this$valueRange.start,
          end = _this$valueRange.end;
      var _this$context = this.context,
          indent = _this$context.indent,
          src = _this$context.src;
      if (src[end - 1] !== '"') errors.push(new YAMLSyntaxError(this, 'Missing closing "quote')); // Using String#replace is too painful with escaped newlines preceded by
      // escaped backslashes; also, this should be faster.

      var str = '';

      for (var i = start + 1; i < end - 1; ++i) {
        var ch = src[i];

        if (ch === '\n') {
          if (Node.atDocumentBoundary(src, i + 1)) errors.push(new YAMLSemanticError(this, 'Document boundary indicators are not allowed within string values'));

          var _Node$foldNewline = Node.foldNewline(src, i, indent),
              fold = _Node$foldNewline.fold,
              offset = _Node$foldNewline.offset,
              error = _Node$foldNewline.error;

          str += fold;
          i = offset;
          if (error) errors.push(new YAMLSemanticError(this, 'Multi-line double-quoted string needs to be sufficiently indented'));
        } else if (ch === '\\') {
          i += 1;

          switch (src[i]) {
            case '0':
              str += '\0';
              break;
            // null character

            case 'a':
              str += '\x07';
              break;
            // bell character

            case 'b':
              str += '\b';
              break;
            // backspace

            case 'e':
              str += '\x1b';
              break;
            // escape character

            case 'f':
              str += '\f';
              break;
            // form feed

            case 'n':
              str += '\n';
              break;
            // line feed

            case 'r':
              str += '\r';
              break;
            // carriage return

            case 't':
              str += '\t';
              break;
            // horizontal tab

            case 'v':
              str += '\v';
              break;
            // vertical tab

            case 'N':
              str += "\x85";
              break;
            // Unicode next line

            case '_':
              str += "\xA0";
              break;
            // Unicode non-breaking space

            case 'L':
              str += "\u2028";
              break;
            // Unicode line separator

            case 'P':
              str += "\u2029";
              break;
            // Unicode paragraph separator

            case ' ':
              str += ' ';
              break;

            case '"':
              str += '"';
              break;

            case '/':
              str += '/';
              break;

            case '\\':
              str += '\\';
              break;

            case '\t':
              str += '\t';
              break;

            case 'x':
              str += this.parseCharCode(i + 1, 2, errors);
              i += 2;
              break;

            case 'u':
              str += this.parseCharCode(i + 1, 4, errors);
              i += 4;
              break;

            case 'U':
              str += this.parseCharCode(i + 1, 8, errors);
              i += 8;
              break;

            case '\n':
              // skip escaped newlines, but still trim the following line
              while (src[i + 1] === ' ' || src[i + 1] === '\t') {
                i += 1;
              }

              break;

            default:
              errors.push(new YAMLSyntaxError(this, "Invalid escape sequence ".concat(src.substr(i - 1, 2))));
              str += '\\' + src[i];
          }
        } else if (ch === ' ' || ch === '\t') {
          // trim trailing whitespace
          var wsStart = i;
          var next = src[i + 1];

          while (next === ' ' || next === '\t') {
            i += 1;
            next = src[i + 1];
          }

          if (next !== '\n') str += i > wsStart ? src.slice(wsStart, i + 1) : ch;
        } else {
          str += ch;
        }
      }

      return errors.length > 0 ? {
        errors: errors,
        str: str
      } : str;
    }
  }], [{
    key: "endOfQuote",
    value: function endOfQuote(src, offset) {
      var ch = src[offset];

      while (ch && ch !== '"') {
        offset += ch === '\\' ? 2 : 1;
        ch = src[offset];
      }

      return offset + 1;
    }
  }]);

  return QuoteDouble;
}(Node);

export { QuoteDouble as default };