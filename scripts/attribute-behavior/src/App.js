import {createElement} from 'glamor/react'; // eslint-disable-line
/* @jsx createElement */
import './App.css';

import {MultiGrid, AutoSizer} from 'react-virtualized';
import 'react-virtualized/styles.css';

const React = global.React;
const {Component} = React;

const ReactDOM15 = global.ReactDOM15;
const ReactDOM16 = global.ReactDOM;

const types = [
  {
    name: 'string',
    testValue: 'a string',
    testDisplayValue: "'a string'",
  },
  {
    name: 'null',
    testValue: null,
  },
  {
    name: 'undefined',
    testValue: undefined,
  },
  {
    name: 'empty string',
    testValue: '',
    testDisplayValue: "''",
  },
  {
    name: 'array with string',
    testValue: ['string'],
    testDisplayValue: "['string']",
  },
  {
    name: 'empty array',
    testValue: [],
    testDisplayValue: '[]',
  },
  {
    name: 'object',
    testValue: {
      toString() {
        return 'result of toString()';
      },
    },
    testDisplayValue: "{ toString() { return 'result of toString()'; } }",
  },
  {
    name: 'numeric string',
    testValue: '42',
    displayValue: "'42'",
  },
  {
    name: '-1',
    testValue: -1,
  },
  {
    name: '0',
    testValue: 0,
  },
  {
    name: 'integer',
    testValue: 1,
  },
  {
    name: 'NaN',
    testValue: NaN,
  },
  {
    name: 'float',
    testValue: 99.99,
  },
  {
    name: 'true',
    testValue: true,
  },
  {
    name: 'false',
    testValue: 'false',
  },
  {
    name: "string 'true'",
    testValue: 'true',
    displayValue: "'true'",
  },
  {
    name: "string 'false'",
    testValue: 'false',
    displayValue: "'false'",
  },
  {
    name: "string 'on'",
    testValue: 'on',
    displayValue: "'on'",
  },
  {
    name: "string 'off'",
    testValue: 'off',
    displayValue: "'off'",
  },
  {
    name: 'symbol',
    testValue: Symbol('foo'),
    testDisplayValue: "Symbol('foo')",
  },
  {
    name: 'function',
    testValue: function f() {},
  },
];

function getProperty(propertyName) {
  return el => el[propertyName];
}

function getAttribute(attributeName) {
  return el => el.getAttribute(attributeName);
}

const attributes = [
  {name: 'about', read: getAttribute('about')},
  {name: 'aBoUt', read: getAttribute('about')},
  {
    name: 'accent-Height',
    containerTagName: 'svg',
    tagName: 'font-face',
    read: getAttribute('accent-height'),
  },
  {
    name: 'accent-height',
    containerTagName: 'svg',
    tagName: 'font-face',
    read: getAttribute('accent-height'),
  },
  {
    name: 'accentHeight',
    containerTagName: 'svg',
    tagName: 'font-face',
    read: getAttribute('accent-height'),
  },
  {name: 'accept', tagName: 'form'},
  {name: 'accept-charset', tagName: 'form'},
  {name: 'accept-Charset', tagName: 'form'},
  {name: 'acceptCharset', tagName: 'form'},
  {name: 'accessKey'},
  {
    name: 'accumulate',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('accumulate'),
  },
  {name: 'action', tagName: 'form'},
  {name: 'additive', tagName: 'animate'},
  {name: 'alignment-baseline', containerTagName: 'svg', tagName: 'textPath'},
  {
    name: 'alignmentBaseline',
    containerTagName: 'svg',
    tagName: 'textPath',
    read: getAttribute('alignment-baseline'),
  },
  {
    name: 'allowFullScreen',
    tagName: 'iframe',
    read: getProperty('allowFullscreen'),
  },
  {
    name: 'allowfullscreen',
    tagName: 'iframe',
    read: getProperty('allowFullscreen'),
  },
  {
    name: 'allowFullscreen',
    tagName: 'iframe',
  },
  {name: 'allowReorder', containerTagName: 'svg', tagName: 'switch'},
  {name: 'allowTransparency', containerTagName: 'svg', tagName: 'path'},
  {name: 'alphabetic', containerTagName: 'svg', tagName: 'path'},
  {name: 'alt', tagName: 'img'},
  {name: 'amplitude', containerTagName: 'svg', tagName: 'path'},
  {name: 'arabic-form', containerTagName: 'svg', tagName: 'path'},
  {
    name: 'arabicForm',
    containerTagName: 'svg',
    tagName: 'path',
    read: getAttribute('arabic-form'),
  },
  {name: 'aria'},
  {name: 'aria-'},
  {name: 'aria-invalidattribute'},
  {name: 'as'},
  {
    name: 'ascent',
    containerTagName: 'svg',
    tagName: 'font-face',
    read: getAttribute('ascent'),
  },
  {name: 'async', tagName: 'script'},
  {
    name: 'attributeName',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('attributeName'),
  },
  {
    name: 'attributeType',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('attributeType'),
  },
  {
    name: 'autoCapitalize',
    tagName: 'input',
    read: getProperty('autocapitalize'),
    overrideStringValue: 'words',
  },
  {
    name: 'autoComplete',
    tagName: 'input',
    overrideStringValue: 'email',
    read: getProperty('autocomplete'),
  },
  {
    name: 'autoCorrect',
    tagName: 'input',
    overrideStringValue: 'off',
    read: getProperty('autocorrect'),
  },
  {name: 'autoPlay', tagName: 'video', read: getProperty('autoplay')},
  {
    name: 'autoReverse',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('autoreverse'),
  },
  {name: 'autoSave', tagName: 'input', read: getAttribute('autosave')},
  {
    name: 'azimuth',
    containerTagName: 'svg',
    tagName: 'fedistantlight',
    read: getAttribute('azimuth'),
  },
  {
    name: 'baseFrequency',
    containerTagName: 'svg',
    tagName: 'feturbulance',
    read: getAttribute('baseFrequency'),
  },
  {
    name: 'baseline-shift',
    containerTagName: 'svg',
    tagName: 'textPath',
    read: getAttribute('baseline-shift'),
  },
  {
    name: 'baselineShift',
    containerTagName: 'svg',
    tagName: 'textPath',
    read: getAttribute('baseline-shift'),
  },
  {
    name: 'baseProfile',
    tagName: 'svg',
    read: getAttribute('baseProfile'),
  },
  {
    name: 'bbox',
    containerTagName: 'svg',
    tagName: 'font-face',
    read: getAttribute('bbox'),
  },
  {
    name: 'begin',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('begin'),
  },
  {
    name: 'bias',
    containerTagName: 'svg',
    tagName: 'feconvolvematrix',
    read: getAttribute('bias'),
  },
  {
    name: 'by',
    containerTagName: 'svg',
    tagName: 'animate',
    read: getAttribute('by'),
  },
  {
    name: 'calcMode',
    containerTagName: 'svg',
    tagName: 'animate',
    overrideStringValue: 'discrete',
    read: getAttribute('calcMode'),
  },
  {name: 'cap-height'},
  {name: 'capHeight', read: getAttribute('cap-height')},
  {name: 'capture'},
  {name: 'cellPadding'},
  {name: 'cellSpacing'},
  {name: 'challenge'},
  {name: 'charSet'},
  {name: 'checked', read: getProperty('checked')},
  {name: 'Checked'},
  {name: 'Children'},
  {name: 'children'},
  {name: 'cite'},
  {name: 'class'},
  {name: 'classID'},
  {name: 'className', read: getProperty('className')},
  {name: 'clip'},
  {name: 'clip-path'},
  {name: 'clip-rule'},
  {name: 'clipPath', read: getAttribute('clip-path')},
  {name: 'clipPathUnits'},
  {name: 'clipRule', read: getAttribute('clip-rule')},
  {name: 'color'},
  {name: 'color-interpolation'},
  {name: 'color-interpolation-filters'},
  {name: 'color-profile'},
  {name: 'color-rendering'},
  {name: 'colorInterpolation', read: getAttribute('color-interpolation')},
  {
    name: 'colorInterpolationFilters',
    read: getAttribute('color-interpolation-filters'),
  },
  {name: 'colorProfile', read: getAttribute('color-profile')},
  {name: 'colorRendering', read: getAttribute('color-rendering')},
  {name: 'cols'},
  {name: 'colSpan'},
  {name: 'content'},
  {name: 'contentEditable'},
  {name: 'contentScriptType'},
  {name: 'contentStyleType'},
  {name: 'contextMenu'},
  {name: 'controls'},
  {name: 'coords'},
  {name: 'crossOrigin'},
  {name: 'cursor'},
  {name: 'cx'},
  {name: 'cy'},
  {name: 'd'},
  {name: 'dangerouslySetInnerHTML'},
  {name: 'DangerouslySetInnerHTML'},
  {name: 'data'},
  {name: 'data-'},
  {name: 'data-unknownattribute'},
  {name: 'datatype'},
  {name: 'dateTime'},
  {name: 'decelerate'},
  {name: 'default'},
  {name: 'defaultchecked'},
  {name: 'defaultChecked'},
  {name: 'defaultValue'},
  {name: 'defaultValuE'},
  {name: 'defer'},
  {name: 'descent'},
  {name: 'diffuseConstant'},
  {name: 'dir'},
  {name: 'direction'},
  {name: 'disabled'},
  {name: 'display'},
  {name: 'divisor'},
  {name: 'dominant-baseline'},
  {name: 'dominantBaseline'},
  {name: 'download'},
  {name: 'dOwNlOaD'},
  {name: 'draggable'},
  {name: 'dur'},
  {name: 'dx'},
  {name: 'dX'},
  {name: 'dy'},
  {name: 'dY'},
  {name: 'edgeMode'},
  {name: 'elevation'},
  {name: 'enable-background'},
  {name: 'enableBackground'},
  {name: 'encType'},
  {name: 'end'},
  {name: 'exponent'},
  {name: 'externalResourcesRequired'},
  {name: 'fill'},
  {name: 'fill-opacity'},
  {name: 'fill-rule'},
  {name: 'fillOpacity'},
  {name: 'fillRule'},
  {name: 'filter'},
  {name: 'filterRes'},
  {name: 'filterUnits'},
  {name: 'flood-color'},
  {name: 'flood-opacity'},
  {name: 'floodColor'},
  {name: 'floodOpacity'},
  {name: 'focusable'},
  {name: 'font-family'},
  {name: 'font-size'},
  {name: 'font-size-adjust'},
  {name: 'font-stretch'},
  {name: 'font-style'},
  {name: 'font-variant'},
  {name: 'font-weight'},
  {name: 'fontFamily'},
  {name: 'fontSize'},
  {name: 'fontSizeAdjust'},
  {name: 'fontStretch'},
  // start here Sebastian
  {name: 'fontStyle'},
  {name: 'fontVariant'},
  {name: 'fontWeight'},
  {name: 'for'},
  {name: 'fOr'},
  {name: 'form'},
  {name: 'formAction'},
  {name: 'format'},
  {name: 'formEncType'},
  {name: 'formMethod'},
  {name: 'formNoValidate'},
  {name: 'formTarget'},
  {name: 'frameBorder'},
  {name: 'from'},
  {name: 'fx'},
  {name: 'fX'},
  {name: 'fY'},
  {name: 'fy'},
  {name: 'G1'},
  {name: 'g1'},
  {name: 'G2'},
  {name: 'g2'},
  {name: 'glyph-name'},
  {name: 'glyph-orientation-horizontal'},
  {name: 'glyph-orientation-vertical'},
  {name: 'glyphName'},
  {name: 'glyphOrientationHorizontal'},
  {name: 'glyphOrientationVertical'},
  {name: 'glyphRef'},
  {name: 'gradientTransform'},
  {name: 'gradientUnits'},
  {name: 'hanging'},
  {name: 'hasOwnProperty'},
  {name: 'headers'},
  {name: 'height'},
  {name: 'hidden'},
  {name: 'high'},
  {name: 'horiz-adv-x'},
  {name: 'horiz-origin-x'},
  {name: 'horizAdvX'},
  {name: 'horizOriginX'},
  {name: 'href'},
  {name: 'hrefLang'},
  {name: 'htmlFor'},
  {name: 'http-equiv'},
  {name: 'httpEquiv'},
  {name: 'icon'},
  {name: 'id'},
  {name: 'ID'},
  {name: 'ideographic'},
  {name: 'image-rendering'},
  {name: 'imageRendering'},
  {name: 'in'},
  {name: 'in2'},
  {name: 'initialChecked'},
  {name: 'initialValue'},
  {name: 'inlist'},
  {name: 'inputMode'},
  {name: 'integrity'},
  {name: 'intercept'},
  {name: 'is'},
  {name: 'itemID'},
  {name: 'itemProp'},
  {name: 'itemRef'},
  {name: 'itemScope'},
  {name: 'itemType'},
  {name: 'k'},
  {name: 'K'},
  {name: 'K1'},
  {name: 'k1'},
  {name: 'k2'},
  {name: 'k3'},
  {name: 'k4'},
  {name: 'kernelMatrix'},
  {name: 'kernelUnitLength'},
  {name: 'kerning'},
  {name: 'keyParams'},
  {name: 'keyPoints'},
  {name: 'keySplines'},
  {name: 'keyTimes'},
  {name: 'keyType'},
  {name: 'kind'},
  {name: 'label'},
  {name: 'LANG'},
  {name: 'lang'},
  {name: 'length'},
  {name: 'lengthAdjust'},
  {name: 'letter-spacing'},
  {name: 'letterSpacing'},
  {name: 'lighting-color'},
  {name: 'lightingColor'},
  {name: 'limitingConeAngle'},
  {name: 'list'},
  {name: 'local'},
  {name: 'loop'},
  {name: 'low'},
  {name: 'manifest'},
  {name: 'marginHeight'},
  {name: 'marginWidth'},
  {name: 'marker-end'},
  {name: 'marker-mid'},
  {name: 'marker-start'},
  {name: 'markerEnd'},
  {name: 'markerHeight'},
  {name: 'markerMid'},
  {name: 'markerStart'},
  {name: 'markerUnits'},
  {name: 'markerWidth'},
  {name: 'mask'},
  {name: 'maskContentUnits'},
  {name: 'maskUnits'},
  {name: 'mathematical'},
  {name: 'max'},
  {name: 'maxLength'},
  {name: 'media'},
  {name: 'mediaGroup'},
  {name: 'method'},
  {name: 'min'},
  {name: 'minLength'},
  {name: 'mode'},
  {name: 'multiple'},
  {name: 'muted'},
  {name: 'name'},
  {name: 'nonce'},
  {name: 'noValidate'},
  {name: 'numOctaves'},
  {name: 'offset'},
  {name: 'on-click'},
  {name: 'on-unknownevent'},
  {name: 'onclick'},
  {name: 'onClick'},
  {name: 'onunknownevent'},
  {name: 'onUnknownEvent'},
  {name: 'opacity'},
  {name: 'open'},
  {name: 'operator'},
  {name: 'optimum'},
  {name: 'order'},
  {name: 'orient'},
  {name: 'orientation'},
  {name: 'origin'},
  {name: 'overflow'},
  {name: 'overline-position'},
  {name: 'overline-thickness'},
  {name: 'overlinePosition'},
  {name: 'overlineThickness'},
  {name: 'paint-order'},
  {name: 'paintOrder'},
  {name: 'panose-1'},
  {name: 'panose1'},
  {name: 'pathLength'},
  {name: 'pattern'},
  {name: 'patternContentUnits'},
  {name: 'patternTransform'},
  {name: 'patternUnits'},
  {name: 'placeholder'},
  {name: 'playsInline'},
  {name: 'pointer-events'},
  {name: 'pointerEvents'},
  {name: 'points'},
  {name: 'pointsAtX'},
  {name: 'pointsAtY'},
  {name: 'pointsAtZ'},
  {name: 'poster'},
  {name: 'prefix'},
  {name: 'preload'},
  {name: 'preserveAlpha'},
  {name: 'preserveAspectRatio'},
  {name: 'primitiveUnits'},
  {name: 'profile'},
  {name: 'property'},
  {name: 'props'},
  {name: 'r'},
  {name: 'radioGroup'},
  {name: 'radius'},
  {name: 'readOnly'},
  {name: 'referrerPolicy'},
  {name: 'refX'},
  {name: 'refY'},
  {name: 'rel'},

  // Sebastian stop here
  // Flarnie start here

  {name: 'rendering-intent'},
  {name: 'renderingIntent'},
  {name: 'repeatCount'},
  {name: 'repeatDur'},
  {name: 'required'},
  {name: 'requiredExtensions'},
  {name: 'requiredFeatures'},
  {name: 'resource'},
  {name: 'restart'},
  {name: 'result'},
  {name: 'results'},
  {name: 'reversed'},
  {name: 'role'},
  {name: 'rotate'},
  {name: 'rows'},
  {name: 'rowSpan'},
  {name: 'rx'},
  {name: 'ry'},
  {name: 'sandbox'},
  {name: 'scale'},
  {name: 'scope'},
  {name: 'scoped'},
  {name: 'scrolling'},
  {name: 'seamless'},
  {name: 'security'},
  {name: 'seed'},
  {name: 'selected'},
  {name: 'selectedValue'},
  {name: 'shape'},
  {name: 'shape-rendering'},
  {name: 'shapeRendering', read: getAttribute('shape-rendering')},
  {name: 'size'},
  {name: 'sizes'},
  {name: 'slope'},
  {name: 'spacing'},
  {name: 'span'},
  {name: 'specularConstant'},
  {name: 'specularExponent'},
  {name: 'speed'},
  {name: 'spellCheck'},
  {name: 'spreadMethod'},
  {name: 'src'},
  {name: 'srcDoc'},
  {name: 'srcLang'},
  {name: 'srcSet'},
  {name: 'start'},
  {name: 'startOffset'},
  {name: 'state'},
  {name: 'stdDeviation'},
  {name: 'stemh'},
  {name: 'stemv'},
  {name: 'step'},
  {name: 'stitchTiles'},
  {name: 'stop-color'},
  {name: 'stop-opacity'},
  {name: 'stopColor', read: getAttribute('stop-color')},
  {name: 'stopOpacity', read: getAttribute('stop-opacity')},
  {name: 'strikethrough-position'},
  {name: 'strikethrough-thickness'},
  {name: 'strikethroughPosition', read: getAttribute('strikethrough-position')},
  {
    name: 'strikethroughThickness',
    read: getAttribute('strikethrough-thickness'),
  },
  {name: 'string'},
  {name: 'stroke'},
  {name: 'stroke-dasharray'},
  {name: 'stroke-Dasharray', read: getAttribute('stroke-dasharray')},
  {name: 'stroke-dashoffset'},
  {name: 'stroke-linecap'},
  {name: 'stroke-linejoin'},
  {name: 'stroke-miterlimit'},
  {name: 'stroke-opacity'},
  {name: 'stroke-width'},
  {name: 'strokeDasharray', read: getAttribute('stroke-dasharray')},
  {name: 'strokeDashoffset', read: getAttribute('stroke-dashoffset')},
  {name: 'strokeLinecap', read: getAttribute('stroke-linecap')},
  {name: 'strokeLinejoin', read: getAttribute('stroke-linejoin')},
  {name: 'strokeMiterlimit', read: getAttribute('stroke-miterlimit')},
  {name: 'strokeOpacity', read: getAttribute('stroke-opacity')},
  {name: 'strokeWidth', read: getAttribute('stroke-width')},
  {name: 'style'},
  {name: 'summary'},
  {name: 'suppressContentEditableWarning'},
  {name: 'surfaceScale'},
  {name: 'systemLanguage'},
  {name: 'tabIndex'},
  {name: 'tableValues'},
  {name: 'target'},
  {name: 'targetX'},
  {name: 'targetY'},
  {name: 'text-anchor'},
  {name: 'text-decoration'},
  {name: 'text-rendering'},
  {name: 'textAnchor', read: getAttribute('text-anchor')},
  {name: 'textDecoration', read: getAttribute('text-decoration')},
  {name: 'textLength', read: getAttribute('text-length')},
  {name: 'textRendering', read: getAttribute('text-rendering')},
  {name: 'title'},
  {name: 'to'},
  {name: 'transform', read: getAttribute('transform')},
  {name: 'type', tagName: 'button', overrideStringValue: 'submit'},
  {name: 'typeof'},
  {name: 'u1', read: getAttribute('u1')},
  {name: 'u2', read: getAttribute('u2')},
  {name: 'underline-position', read: getAttribute('underline-position')},
  {name: 'underline-thickness', read: getAttribute('underline-thickness')},
  {name: 'underlinePosition', read: getAttribute('underline-position')},
  {name: 'underlineThickness', read: getAttribute('underline-thickness')},
  {name: 'unicode', read: getAttribute('unicode')},
  {name: 'unicode-bidi', read: getAttribute('unicode-bidi')},
  {name: 'unicode-range', read: getAttribute('unicode-range')},
  {name: 'unicodeBidi', read: getAttribute('unicode-bidi')},
  {name: 'unicodeRange', read: getAttribute('unicode-range')},
  {name: 'units-per-em', read: getAttribute('units-per-em')},
  {name: 'unitsPerEm', read: getAttribute('unites-per-em')},
  {name: 'unknown', read: getAttribute('unknown')},
  {name: 'unselectable', tagName: 'a'},
  {name: 'useMap', tagName: 'img'},
  {name: 'v-alphabetic', read: getAttribute('v-alphabetic')},
  {name: 'v-hanging', read: getAttribute('v-hanging')},
  {name: 'v-ideographic', read: getAttribute('v-ideographic')},
  {name: 'v-mathematical', read: getAttribute('v-mathematical')},
  {name: 'vAlphabetic', read: getAttribute('v-alphabetic')},
  {name: 'value', containerTagName: 'select', tagName: 'option'},
  {name: 'Value', containerTagName: 'select', tagName: 'option'},
  {name: 'values', read: getAttribute('values')},
  {name: 'vector-effect', read: getAttribute('vector-effect')},
  {name: 'vectorEffect', read: getAttribute('vector-effect')},
  {name: 'version', tagName: 'html'},
  {name: 'vert-adv-y', read: getAttribute('vert-origin-y')},
  {name: 'vert-origin-x', read: getAttribute('vert-origin-y')},
  {name: 'vert-origin-y', read: getAttribute('vert-origin-y')},
  {name: 'vertAdvY', read: getAttribute('vert-adv-y')},
  {name: 'vertOriginX', read: getAttribute('vert-origin-x')},
  {name: 'vertOriginY', read: getAttribute('vert-origin-y')},
  {name: 'vHanging', read: getAttribute('v-hanging')},
  {name: 'vIdeographic', read: getAttribute('v-ideographic')},
  {name: 'viewBox', read: getAttribute('viewBox')},
  {name: 'viewTarget', read: getAttribute('viewTarget')},
  {name: 'visibility', read: getAttribute('visibility')},
  {name: 'vMathematical', read: getAttribute('v-mathematical')},
  {name: 'vocab', read: getAttribute('vocab')},
  {name: 'width', tagName: 'img'},
  {name: 'widths', read: getAttribute('widths')},
  {name: 'wmode', read: getAttribute('wmode'), tagName: 'embed'},
  {name: 'word-spacing', read: getAttribute('word-spacing')},
  {name: 'wordSpacing', read: getAttribute('word-spacing')},
  {name: 'wrap', tagName: 'textarea'},
  // SVG:
  {name: 'writing-mode', read: getAttribute('writing-mode')},
  {name: 'writingMode', read: getAttribute('writing-mode')},
  {name: 'x', read: getAttribute('x')},
  {name: 'x-height', read: getAttribute('x-height')},
  {name: 'x1', read: getAttribute('x1')},
  {name: 'x2', read: getAttribute('x2')},
  {name: 'xChannelSelector', read: getAttribute('xChannelSelector')},
  {name: 'xHeight', read: getAttribute('x-height')},
  {name: 'XLink:Actuate', read: getAttribute('XLink:Actuate')},
  {name: 'xlink:actuate', read: getAttribute('xlink:actuate')},
  {name: 'xlink:arcrole', read: getAttribute('xlink:arcrole')},
  {name: 'xlink:href', read: getAttribute('xlink:href')},
  {name: 'xlink:role', read: getAttribute('xlink:role')},
  {name: 'xlink:show', read: getAttribute('xlink:show')},
  {name: 'xlink:title', read: getAttribute('xlink:title')},
  {name: 'xlink:type', read: getAttribute('xlink:type')},
  {name: 'xlinkActuate', read: getAttribute('xlink:actuate')},
  {name: 'XlinkActuate', read: getAttribute('Xlink:actuate')},
  {name: 'xlinkArcrole', read: getAttribute('xlink:arcrole')},
  {name: 'xlinkHref', read: getAttribute('xlink:href')},
  {name: 'xlinkRole', read: getAttribute('xlink:role')},
  {name: 'xlinkShow', read: getAttribute('xlink:show')},
  {name: 'xlinkTitle', read: getAttribute('xlink:title')},
  {name: 'xlinkType', read: getAttribute('xlink:type')},
  {name: 'xml:base', read: getAttribute('xml:base')},
  {name: 'xml:lang', read: getAttribute('xml:lang')},
  {name: 'xml:space', read: getAttribute('xml:space')},
  {name: 'xmlBase', read: getAttribute('xml:base')},
  {name: 'xmlLang', read: getAttribute('xml:lang')},
  {
    name: 'xmlns',
    read: getProperty('namespaceURI'),
    tagName: 'svg',
  },
  {name: 'xmlns:xlink', read: getAttribute('xmlns:xlink')},
  {name: 'xmlnsXlink', read: getAttribute('xmlns:xlink')},
  {name: 'xmlSpace', read: getAttribute('xml:space')},
  {name: 'y', read: getAttribute('y')},
  {name: 'y1', read: getAttribute('y1')},
  {name: 'y2', read: getAttribute('y2')},
  {name: 'yChannelSelector', read: getAttribute('yChannelSelector')},
  {name: 'z', read: getAttribute('z')},
  {name: 'zoomAndPan', read: getAttribute('zoomAndPan')},
];

let _didWarn = false;
function warn(str) {
  _didWarn = true;
}

function getRenderedAttributeValue(renderer, attribute, type) {
  _didWarn = false;
  const originalConsoleError = console.error;
  console.error = warn;

  const containerTagName = attribute.containerTagName || 'div';
  const tagName = attribute.tagName || 'div';

  let container;
  if (containerTagName === 'svg') {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  } else {
    container = document.createElement(containerTagName);
  }

  let defaultValue;
  try {
    const read = attribute.read || getProperty(attribute.name);

    let testValue = type.testValue;
    if (attribute.overrideStringValue !== undefined) {
      switch (type.name) {
        case 'string':
          testValue = attribute.overrideStringValue;
          break;
        case 'array with string':
          testValue = [attribute.overrideStringValue];
          break;
      }
    }

    renderer.render(React.createElement(tagName), container);
    defaultValue = read(container.firstChild);

    const props = {
      [attribute.name]: testValue,
    };
    renderer.render(React.createElement(tagName, props), container);

    const result = read(container.firstChild);

    return {
      defaultValue,
      result,
      didWarn: _didWarn,
      didError: false,
    };
  } catch (error) {
    return {
      defaultValue,
      result: null,
      didWarn: _didWarn,
      didError: true,
    };
  } finally {
    console.error = originalConsoleError;
  }
}

function getRenderedAttributeValues(attribute, type) {
  const react15Value = getRenderedAttributeValue(ReactDOM15, attribute, type);
  const react16Value = getRenderedAttributeValue(ReactDOM16, attribute, type);

  let hasSameBehavior;
  if (react15Value.didError && react16Value.didError) {
    hasSameBehavior = true;
  } else if (!react15Value.didError && !react16Value.didError) {
    hasSameBehavior =
      react15Value.didWarn === react16Value.didWarn &&
      react15Value.result === react16Value.result;
  } else {
    hasSameBehavior = false;
  }

  return {
    react15: react15Value,
    react16: react16Value,
    hasSameBehavior,
  };
}

const table = new Map();

for (let attribute of attributes) {
  const row = new Map();
  for (let type of types) {
    const result = getRenderedAttributeValues(attribute, type);
    row.set(type.name, result);
  }
  table.set(attribute.name, row);
}

const successColor = 'white';
const warnColor = 'yellow';
const errorColor = 'red';

function RendererResult({version, result, defaultValue, didWarn, didError}) {
  let backgroundColor;
  if (didError) {
    backgroundColor = errorColor;
  } else if (didWarn) {
    backgroundColor = warnColor;
  } else if (result !== defaultValue) {
    backgroundColor = 'cyan';
  } else {
    backgroundColor = successColor;
  }

  let style = {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor,
  };

  let displayResult;
  switch (typeof result) {
    case 'undefined':
      displayResult = '<undefined>';
      break;
    case 'object':
      if (result === null) {
        displayResult = '<null>';
        break;
      }
      displayResult = '<object>';
      break;
    case 'function':
      displayResult = '<function>';
      break;
    case 'symbol':
      displayResult = '<symbol>';
      break;
    case 'number':
      displayResult = `<Number: ${result}>`;
      break;
    case 'string':
      if (result === '') {
        displayResult = '<empty string>';
        break;
      }
      displayResult = result;
      break;
    case 'boolean':
      displayResult = `<Boolean: ${result}>`;
      break;
    default:
      throw new Error('Switch statement should be exhaustive.');
  }

  return <div css={style}>{displayResult}</div>;
}

function Result(props) {
  const {react15, react16, hasSameBehavior} = props;
  const style = {position: 'absolute', width: '100%', height: '100%'};
  if (!hasSameBehavior) {
    style.border = '4px solid purple';
  }
  return (
    <div css={style}>
      <div css={{position: 'absolute', width: '50%', height: '100%'}}>
        <RendererResult version={15} {...react15} />
      </div>
      <div
        css={{position: 'absolute', width: '50%', left: '50%', height: '100%'}}>
        <RendererResult version={16} {...react16} />
      </div>
    </div>
  );
}

function ColumnHeader({children}) {
  return (
    <div
      css={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
      {children}
    </div>
  );
}

function RowHeader({children}) {
  return (
    <div
      css={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
      {children}
    </div>
  );
}

function CellContent(props) {
  const {columnIndex, rowIndex} = props;

  const attribute = attributes[rowIndex - 1];
  const type = types[columnIndex - 1];

  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return null;
    }
    return <RowHeader>{attribute.name}</RowHeader>;
  }

  if (rowIndex === 0) {
    return <ColumnHeader>{type.name}</ColumnHeader>;
  }

  const row = table.get(attribute.name);
  const result = row.get(type.name);

  return <Result {...result} />;
}

function cellRenderer(props) {
  return <div style={props.style}><CellContent {...props} /></div>;
}

class App extends Component {
  render() {
    return (
      <AutoSizer disableHeight={true}>
        {({width}) => (
          <MultiGrid
            cellRenderer={cellRenderer}
            columnWidth={200}
            columnCount={1 + types.length}
            fixedColumnCount={1}
            enableFixedColumnScroll={true}
            enableFixedRowScroll={true}
            height={1200}
            rowHeight={40}
            rowCount={attributes.length + 1}
            fixedRowCount={1}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }
}

export default App;
