"use strict";

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _defaults(subClass, superClass); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var flexSpec = require('./flex-spec');

var Declaration = require('../declaration');

var FlexFlow = /*#__PURE__*/function (_Declaration) {
  _inheritsLoose(FlexFlow, _Declaration);

  var _super = _createSuper(FlexFlow);

  function FlexFlow() {
    return _Declaration.apply(this, arguments) || this;
  }

  var _proto = FlexFlow.prototype;

  /**
   * Use two properties for 2009 spec
   */
  _proto.insert = function insert(decl, prefix, prefixes) {
    var spec;

    var _flexSpec = flexSpec(prefix);

    spec = _flexSpec[0];
    prefix = _flexSpec[1];

    if (spec !== 2009) {
      return _Declaration.prototype.insert.call(this, decl, prefix, prefixes);
    }

    var values = decl.value.split(/\s+/).filter(function (i) {
      return i !== 'wrap' && i !== 'nowrap' && 'wrap-reverse';
    });

    if (values.length === 0) {
      return undefined;
    }

    var already = decl.parent.some(function (i) {
      return i.prop === prefix + 'box-orient' || i.prop === prefix + 'box-direction';
    });

    if (already) {
      return undefined;
    }

    var value = values[0];
    var orient = value.includes('row') ? 'horizontal' : 'vertical';
    var dir = value.includes('reverse') ? 'reverse' : 'normal';
    var cloned = this.clone(decl);
    cloned.prop = prefix + 'box-orient';
    cloned.value = orient;

    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix);
    }

    decl.parent.insertBefore(decl, cloned);
    cloned = this.clone(decl);
    cloned.prop = prefix + 'box-direction';
    cloned.value = dir;

    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix);
    }

    return decl.parent.insertBefore(decl, cloned);
  };

  return FlexFlow;
}(Declaration);

_defineProperty(FlexFlow, "names", ['flex-flow', 'box-direction', 'box-orient']);

module.exports = FlexFlow;