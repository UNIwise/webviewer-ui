import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { isMobileSize } from 'helpers/getDeviceSize';
import { isIE11 } from 'helpers/device';
import { getCircleRadius } from 'constants/slider';

import './Slider.scss';

class Slider extends React.PureComponent {
  static propTypes = {
    property: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    displayProperty: PropTypes.string.isRequired,
    getDisplayValue: PropTypes.func.isRequired,
    onSliderChange: PropTypes.func.isRequired,
    dataElement: PropTypes.string,
    getCirclePosition: PropTypes.func.isRequired,
    customCircleRadius: PropTypes.number,
    customLineStrokeWidth: PropTypes.number,
    convertRelativeCirclePositionToValue: PropTypes.func.isRequired,
    onStyleChange: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    withInputField: PropTypes.bool,
    inputFieldType: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    getLocalValue: PropTypes.func,
    shouldHideSliderTitle: PropTypes.bool,
    shouldHideSliderValue: PropTypes.bool,
    isMobile: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.isMouseDown = false;
    this.sliderSvg = React.createRef();
    this.inputRef = React.createRef();
    this.lineLength = 0;
    this.state = {
      localValue: props.value,
      isEditingInputField: false,
    };
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('orientationchange', this.updateSvg);
    window.addEventListener('resize', this.updateSvg);
    this.sliderSvg.current.addEventListener('touchmove', this.onMove, { passive: false });
    this.updateSvg();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ localValue: this.props.value });
    }
  }

  // Fix for slider having the wrong size
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate() {
    this.setLineLength();
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('orientationchange', this.updateSvg);
    window.removeEventListener('resize', this.updateSvg);
    this.sliderSvg.current.removeEventListener('touchmove', this.onMove, { passive: false });
  }

  updateSvg = () => {
    this.setLineLength();
    this.forceUpdate();
  };

  setLineLength = () => {
    this.lineLength =
      0.94 * this.sliderSvg.current.getBoundingClientRect().width - 2 * getCircleRadius(this.props.isMobile);
  };

  onMouseDown = (e) => {
    e.preventDefault();
    this.isMouseDown = true;
    this.onMove(e.nativeEvent);
  };

  onMouseUp = (e) => {
    const isUsingMouse = !e.touches;
    if (isUsingMouse && !this.isMouseDown) {
      return;
    }

    const { property, onStyleChange, convertRelativeCirclePositionToValue } = this.props;
    const relativeCirclePosition = this.getRelativeCirclePosition(e);
    const value = convertRelativeCirclePositionToValue(relativeCirclePosition);

    onStyleChange(property, value);
    if (this.props.withInputField) {
      this.setState({
        isEditingInputField: false,
      });
    }
    this.isMouseDown = false;
  };

  onTouchStart = (e) => {
    this.onMove(e);
  };

  onTouchEnd = (e) => {
    this.onMouseUp(e);
  };

  onMove = (e) => {
    const isUsingMouse = !e.touches;
    if (isUsingMouse && !this.isMouseDown) {
      return;
    }

    e.preventDefault();

    const { property, onSliderChange, convertRelativeCirclePositionToValue } = this.props;
    const relativeCirclePosition = this.getRelativeCirclePosition(e);
    const value = convertRelativeCirclePositionToValue(relativeCirclePosition);

    onSliderChange(property, value);

    this.setState({
      localValue: value,
    });
  };

  getRelativeCirclePosition = (e) => {
    const isUsingMouse = !e.touches;
    const lineStart = getCircleRadius(this.props.isMobile);
    const lineEnd = lineStart + this.lineLength;
    const svgLeft = this.sliderSvg.current.getBoundingClientRect().left;
    let circlePosition;

    try {
      if (isUsingMouse) {
        circlePosition = e.pageX - svgLeft;
      } else {
        circlePosition = e.touches[0].pageX - svgLeft;
      }
    } catch {
      // In the event we cannot get a pageX value, stay still instead
      const { convertRelativeCirclePositionToValue } = this.props;
      const factor = convertRelativeCirclePositionToValue(this.state.localValue) / this.state.localValue;
      return this.state.localValue / factor;
    }

    if (circlePosition < lineStart) {
      circlePosition = lineStart;
    } else if (circlePosition > lineEnd) {
      circlePosition = lineEnd;
    }

    return (circlePosition - lineStart) / this.lineLength;
  };

  onInputChange = (e) => {
    const { getLocalValue, property, onStyleChange, onSliderChange, max, inputFieldType, min } = this.props;
    if (inputFieldType === 'number' && (e.target.value || e.target.value === 0)) {
      if (e.target.value > max) {
        e.target.value = max;
      }
      let value = e.target.value;
      if (e.target.value < min) {
        value = min;
      }
      const localValue = getLocalValue ? getLocalValue(value) : value;
      onSliderChange(property, localValue);
      onStyleChange(property, localValue);
      this.setState({
        localValue,
      });
    }
  };

  onInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.inputRef.current.blur();
    }
  };

  onInputBlur = (isEditingInputField) => {
    const { min, getLocalValue } = this.props;
    if ((this.inputRef.current.value !== 0 && !this.inputRef.current.value) || this.inputRef.current.value < min) {
      this.inputRef.current.value = min;
      const localValue = getLocalValue ? getLocalValue(min) : min;
      this.setState({ localValue });
    }
    this.setState({ isEditingInputField });
  };

  onInputFocus = (isEditingInputField) => {
    this.setState({ isEditingInputField });
  };

  getInputElement = (label) => {
    const { inputFieldType, min, max, step, getDisplayValue } = this.props;
    const displayValue = getDisplayValue(this.state.localValue);
    if (this.state.isEditingInputField && inputFieldType === 'number') {
      return (
        <div className="slider-input-wrapper">
          <input
            ref={this.inputRef}
            autoFocus
            defaultValue={parseFloat(displayValue)}
            type={inputFieldType}
            onChange={this.onInputChange}
            onKeyDown={this.onInputKeyDown}
            className="slider-input-field is-editing"
            onBlur={() => this.onInputBlur(false)}
            // The prop min={} can not be used here, otherwise its impossible to delete everything completely inside input box, which was complained by PM.
            max={max}
            min={min}
            step={step}
          />
        </div>
      );
    }

    return (
      <input
        readOnly
        type="text"
        className="slider-input-field"
        value={getDisplayValue(this.state.localValue)}
        aria-label={`${label} ${getDisplayValue(this.state.localValue)}`}
        onFocus={this.onInputFocus}
      />
    );
  };

  renderSlider = () => {
    const { dataElement, displayProperty, getCirclePosition, t, withInputField, getDisplayValue } = this.props;
    const circleCenter = getCirclePosition(this.lineLength, this.state.localValue);

    return (
      /* eslint-disable custom/no-hex-colors */
      <div className="slider" data-element={dataElement}>
        {!this.props.shouldHideSliderTitle && <div className="slider-property" onMouseDown={(e) => e.preventDefault()}>
          {t(`option.slider.${displayProperty}`)}
        </div>}
        <div className="slider-element-container">
          <svg
            data-element={dataElement}
            onMouseDown={this.onMouseDown}
            onTouchStart={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            ref={this.sliderSvg}
          >
            <line
              x1={getCircleRadius(this.props.isMobile, this.props.customCircleRadius)}
              y1="50%"
              x2={circleCenter}
              y2="50%"
              strokeWidth={`${this.props.customLineStrokeWidth || 2}`}
              stroke="#00a5e4"
              strokeLinecap="round"
            />
            <line
              x1={circleCenter}
              y1="50%"
              x2={this.lineLength + getCircleRadius(this.props.isMobile, this.props.customCircleRadius)}
              y2="50%"
              strokeWidth={`${this.props.customLineStrokeWidth || 2}`}
              stroke="#e0e0e0"
              strokeLinecap="round"
            />
            <circle cx={circleCenter} cy="50%" r={getCircleRadius(this.props.isMobile, this.props.customCircleRadius)} fill="#00a5e4" />
          </svg>
          {!this.props.shouldHideSliderValue &&
            (withInputField ? (
              this.getInputElement(t(`option.slider.${displayProperty}`))
            ) : (
              <div className="slider-value">{getDisplayValue(this.state.localValue)}</div>
            ))}
        </div>
      </div>
      /* eslint-enable custom/no-hex-colors */
    );
  };

  render() {
    if (isIE11) {
      // We use css Grid to place sliders responsively,
      // since IE11 only supports the old Grid, we use css Flexbox
      return <div className="slider">{this.renderSlider()}</div>;
    }

    return this.renderSlider();
  }
}

const ConnectedSlider = withTranslation(null, { wait: false })(Slider);

const connectedComponent = (props) => {
  const isMobile = isMobileSize();

  return <ConnectedSlider {...props} isMobile={isMobile} />;
};

export default connectedComponent;
