/**
 * Take a version from the window query string and load a specific
 * version of React.
 *
 * @example
 * http://localhost:3000?version=15.4.1
 * (Loads React 15.4.1)
 */

var REACT_PATH = 'react.development.js';
var DOM_PATH = 'react-dom.development.js';
var DOM_SERVER_PATH = 'react-dom-server.development.js';

function parseQuery(qstr) {
  var query = {};

  var a = qstr.substr(1).split('&');

  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');

    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }

  return query;
}

var query = parseQuery(window.location.search);
var version = query.version || 'local';

if (version !== 'local') {
  REACT_PATH = 'https://unpkg.com/react@' + version + '/dist/react.js';
  DOM_PATH = 'https://unpkg.com/react-dom@' + version + '/dist/react-dom.js';
  DOM_SERVER_PATH =
    'https://unpkg.com/react-dom@' + version + '/dist/react-dom-server.min.js';
}

document.write('<script src="' + REACT_PATH + '"></script>');

// Versions earlier than 14 do not use ReactDOM
if (version === 'local' || parseFloat(version, 10) > 0.13) {
  document.write('<script src="' + DOM_PATH + '"></script>');
  document.write('<script src="' + DOM_SERVER_PATH + '"></script>');
} else {
  // Aliasing React to ReactDOM for compatibility.
  document.write('<script>ReactDOM = React; ReactDOMServer = React</script>');
}
