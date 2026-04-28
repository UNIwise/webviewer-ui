const React = require('react');

class EditableInput extends React.Component {
  render() { return null; }
}

const colorComponent = React.forwardRef((props, ref) =>
  React.createElement('div', { ref, 'data-testid': 'color-picker' })
);

module.exports = colorComponent;
module.exports.default = colorComponent;
module.exports.SketchPicker = colorComponent;
module.exports.ChromePicker = colorComponent;
module.exports.BlockPicker = colorComponent;
module.exports.CompactPicker = colorComponent;
module.exports.GithubPicker = colorComponent;
module.exports.CirclePicker = colorComponent;
module.exports.HuePicker = colorComponent;
module.exports.MaterialPicker = colorComponent;
module.exports.PhotoshopPicker = colorComponent;
module.exports.SliderPicker = colorComponent;
module.exports.SwatchesPicker = colorComponent;
module.exports.TwitterPicker = colorComponent;
module.exports.CustomPicker = (Component) => Component;
module.exports.EditableInput = EditableInput;
