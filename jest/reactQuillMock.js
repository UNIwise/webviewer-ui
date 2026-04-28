const React = require('react');

class QuillModule {
  static DEFAULTS = {};
  constructor() {}
}

const Quill = {
  import: () => QuillModule,
  register: () => null,
};

const ReactQuill = React.forwardRef(function ReactQuill(props, ref) {
  return React.createElement('div', { 'data-testid': 'react-quill', ref });
});
ReactQuill.displayName = 'ReactQuill';

module.exports = ReactQuill;
module.exports.default = ReactQuill;
module.exports.Quill = Quill;
