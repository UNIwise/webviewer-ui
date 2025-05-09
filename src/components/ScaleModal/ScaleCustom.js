import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import selectors from 'selectors';
import Tooltip from '../Tooltip';
import Dropdown from '../Dropdown';
import {
  ifFractionalPrecision,
  hintValues,
  convertUnit,
  fractionalUnits,
  floatRegex,
  inFractionalRegex,
  ftInFractionalRegex,
  ftInDecimalRegex,
  parseFtInDecimal,
  parseInFractional,
  parseFtInFractional
} from 'constants/measurementScale';
import classNames from 'classnames';
import Icon from 'components/Icon';

const Scale = window.Core.Scale;

const ScaleCustomProps = {
  scale: PropTypes.array,
  onScaleChange: PropTypes.func,
  precision: PropTypes.number
};

function ScaleCustom({ scale, onScaleChange, precision }) {
  const [measurementUnits] = useSelector((state) => [selectors.getMeasurementUnits(state)], shallowEqual);
  const [pageValueDisplay, setPageValueDisplay] = useState('');
  const [worldValueDisplay, setWorldValueDisplay] = useState('');
  const [isFractionalPrecision, setIsFractionalPrecision] = useState(false);
  const [pageWarningMessage, setPageWarningMessage] = useState('');
  const [worldWarningMessage, setWorldWarningMessage] = useState('');
  const [scaleValueBlurFlag, setScaleValueBlurFlag] = useState(false);

  const [leftDropdownWidth, setLeftDropdownWidth] = useState(0);
  const pageValueInput = useRef(null);
  const worldValueInput = useRef(null);
  const leftContainerRef = useRef(null);

  const [t] = useTranslation();

  const filterFractionalUnits = (units) => units.filter((unit) => fractionalUnits.includes(unit));
  const unitFromOptions = isFractionalPrecision ? filterFractionalUnits(measurementUnits.from) : measurementUnits.from;
  const unitToOptions = isFractionalPrecision ? filterFractionalUnits(measurementUnits.to) : measurementUnits.to;

  // If our scale has a unit that is not in the current 'from' measurement units, change it
  // to the first unit in the list.
  useEffect(() => {
    if (!unitFromOptions.includes(scale[0][1])) {
      onScaleUnitChange(unitFromOptions[0], true);
    }
  }, [scale[0][1]]);

  // If our scale has a unit that is not in the current 'to' measurement units, change it
  // to the first unit in the list. We want to wait until the 'from' unit is valid before
  // setting the 'to' unit. Otherwise, we will reset the 'from' unit.
  useEffect(() => {
    if (unitFromOptions.includes(scale[0][1]) && !unitToOptions.includes(scale[1][1])) {
      onScaleUnitChange(unitToOptions[0], false);
    }
  }, [scale[0][1], scale[1][1]]);

  useEffect(() => {
    const formatDecimal = (value) => {
      return value?.toFixed((1 / precision).toString().length - 1);
    };

    if (scale[0][0] && pageValueInput?.current !== document.activeElement) {
      if (!isFractionalPrecision) {
        setPageValueDisplay(formatDecimal(scale[0][0]) || '');
      } else {
        setPageValueDisplay(Scale.getFormattedValue(scale[0][0], scale[0][1], precision, false, true) || '');
      }
    }
    if (scale[1][0] && !(worldValueInput && worldValueInput.current === document.activeElement)) {
      if (!isFractionalPrecision && scale[1][1] !== 'ft-in') {
        setWorldValueDisplay(formatDecimal(scale[1][0]) || '');
      } else {
        setWorldValueDisplay(Scale.getFormattedValue(scale[1][0], scale[1][1], precision, false, true) || '');
      }
    }
  }, [scale, precision, worldValueInput, pageValueInput, isFractionalPrecision, scaleValueBlurFlag]);

  useEffect(() => {
    setIsFractionalPrecision(ifFractionalPrecision(precision));
  }, [precision]);

  useEffect(() => {
    if (isFractionalPrecision) {
      setPageWarningMessage(hintValues[scale[0][1]]);
      setWorldWarningMessage(hintValues[scale[1][1]]);
    } else if (scale[1][1] === 'ft-in') {
      setPageWarningMessage('');
      setWorldWarningMessage(hintValues['ft-in decimal']);
    } else {
      setPageWarningMessage('');
      setWorldWarningMessage('');
    }
  }, [scale, isFractionalPrecision]);

  // Re-validate invalid world value input when world unit changes
  useEffect(() => {
    !isWorldValueValid && onInputValueChange(worldValueInput.current.value, false);
  }, [scale[1][1]]);

  // Re-validate invalid scale value input when isFractionalPrecision value changes
  useEffect(() => {
    if (!isPageValueValid && !isWorldValueValid) {
      let pageScale = {
        value: scale[0][0],
        unit: scale[0][1]
      };
      onInputValueChange(pageValueInput.current.value, true, (newScale) => {
        pageScale = newScale.pageScale;
      });
      let worldScale = {
        value: scale[1][0],
        unit: scale[1][1]
      };
      onInputValueChange(worldValueInput.current.value, false, (newScale) => {
        worldScale = newScale.worldScale;
      });

      _onScaleChange(new Scale({ pageScale, worldScale }));
    } else {
      !isPageValueValid && onInputValueChange(pageValueInput.current.value, true);
      !isWorldValueValid && onInputValueChange(worldValueInput.current.value, false);
    }
  }, [isFractionalPrecision]);

  useEffect(() => {
    if (leftContainerRef.current) {
      setLeftDropdownWidth((leftContainerRef.current.clientWidth - 8) / 2);
    }
  }, [leftContainerRef]);

  const isPageValueValid = !!scale[0][0];
  const isWorldValueValid = !!scale[1][0];

  const pageValueClass = classNames('scale-input', {
    'invalid-value': !isPageValueValid
  });
  const worldValueClass = classNames('scale-input', {
    'invalid-value': !isWorldValueValid
  });

  // If scale value is smaller than the current precision, replace it with precision value to prevent 0 value.
  const _onScaleChange = (newScale) => {
    const getPrecision = (unit) => (unit === 'ft-in' ? precision / 12 : precision);

    if (newScale.pageScale.value && newScale.pageScale.value < precision) {
      newScale.pageScale.value = getPrecision(newScale.pageScale.unit);
    }
    if (newScale.worldScale.value && newScale.worldScale.value < precision) {
      newScale.worldScale.value = getPrecision(newScale.worldScale.unit);
    }
    onScaleChange(newScale);
  };

  const onInputValueChange = (value, isPageValue, getNewScale) => {
    const updateScaleValue = (scaleValue) => {
      if ((isPageValue && scaleValue !== scale[0][0]) || (!isPageValue && scaleValue !== scale[1][0])) {
        const newScale = new Scale({
          pageScale: { value: isPageValue ? scaleValue : scale[0][0], unit: scale[0][1] },
          worldScale: { value: !isPageValue ? scaleValue : scale[1][0], unit: scale[1][1] }
        });
        if (getNewScale) {
          getNewScale(newScale);
        } else {
          _onScaleChange(newScale);
        }
      }
    };

    if (isPageValue) {
      setPageValueDisplay(value);
    } else {
      setWorldValueDisplay(value);
    }
    const inputValue = value.trim();
    if (!isFractionalPrecision) {
      if (!isPageValue && scale[1][1] === 'ft-in') {
        if (ftInDecimalRegex.test(inputValue)) {
          const result = parseFtInDecimal(inputValue);
          if (result > 0) {
            updateScaleValue(result);
            return;
          }
        }
      } else if (floatRegex.test(inputValue)) {
        const scaleValue = parseFloat(inputValue) || 0;
        updateScaleValue(scaleValue);
        return;
      }
    } else {
      const scaleUnit = isPageValue ? scale[0][1] : scale[1][1];
      if (scaleUnit === 'in') {
        if (inFractionalRegex.test(inputValue)) {
          const result = parseInFractional(inputValue);
          if (result > 0) {
            updateScaleValue(result);
            return;
          }
        }
      } else if (scaleUnit === 'ft-in') {
        if (ftInFractionalRegex.test(inputValue)) {
          const result = parseFtInFractional(inputValue);
          if (result > 0) {
            updateScaleValue(result);
            return;
          }
        }
      }
    }
    updateScaleValue(undefined);
  };

  const onScaleUnitChange = (newUnit, isPageUnit) => {
    let newPageScale;
    if (isPageUnit && newUnit !== scale[0][1]) {
      newPageScale = {
        value: scale[0][0] ? convertUnit(scale[0][0], scale[0][1], newUnit) : scale[0][0],
        unit: newUnit
      };
    } else {
      newPageScale = { value: scale[0][0], unit: scale[0][1] };
    }
    let newWorldScale;
    if (!isPageUnit && newUnit !== scale[1][1]) {
      newWorldScale = {
        value: scale[1][0] ? convertUnit(scale[1][0], scale[1][1], newUnit) : scale[1][0],
        unit: newUnit
      };
    } else {
      newWorldScale = { value: scale[1][0], unit: scale[1][1] };
    }

    _onScaleChange(new Scale({ pageScale: newPageScale, worldScale: newWorldScale }));
  };

  const getInputPlaceholder = (isPageValue) => {
    const unit = isPageValue ? scale[0][1] : scale[1][1];
    return isFractionalPrecision ? hintValues[unit] : (unit === 'ft-in' ? hintValues['ft-in decimal'] : '');
  };

  const onInputBlur = () => {
    setScaleValueBlurFlag((flag) => !flag);
  };

  return (
    <div className="custom-scale-container">
      <div className="scale-ratio-input-container">
        <div className="scale-ratio-display">
          <div className="left-container" ref={leftContainerRef}>
            <div className="unit-label">{t('insertPageModal.pageDimensions.units')}</div>
            <div className="input-wrapper">
              <div className={classNames({ 'warning-alert' : !isPageValueValid })}>
                <input
                  type={isFractionalPrecision ? 'text' : 'number'}
                  min="0"
                  className={pageValueClass}
                  value={pageValueDisplay}
                  aria-label={t('insertPageModal.pageDimensions.units')}
                  data-element="customPageScaleValue"
                  onChange={(e) => onInputValueChange(e.target.value, true)}
                  placeholder={getInputPlaceholder(true)}
                  ref={pageValueInput}
                  onBlur={onInputBlur}
                />
                <Icon glyph="icon-alert" className="warning-alert-icon"/>
              </div>
              <Tooltip content={'option.measurement.scaleModal.paperUnits'}>
                <div className="unit-input">
                  <Dropdown
                    dataElement="customPageScaleUnit"
                    items={unitFromOptions}
                    onClickItem={(value) => onScaleUnitChange(value, true)}
                    currentSelectionKey={scale[0][1]}
                    width={leftDropdownWidth}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
          <div className="scale-ratio-equal">{' = '}</div>
          <div className="right-container">
            <div className="unit-label">{t('insertPageModal.pageDimensions.units')}</div>
            <div className="input-wrapper">
              <div className={classNames({ 'warning-alert' : !isWorldValueValid })}>
                <input
                  type={(isFractionalPrecision || scale[1][1] === 'ft-in') ? 'text' : 'number'}
                  min='0'
                  className={worldValueClass}
                  value={worldValueDisplay}
                  aria-label={t('insertPageModal.pageDimensions.units')}
                  data-element="customDisplayScaleValue"
                  onChange={(e) => onInputValueChange(e.target.value, false)}
                  placeholder={getInputPlaceholder(false)}
                  ref={worldValueInput}
                  onBlur={onInputBlur}
                />
                <Icon glyph="icon-alert" className="warning-alert-icon"/>
              </div>
              <Tooltip content={'option.measurement.scaleModal.displayUnits'}>
                <div className="unit-input">
                  <Dropdown
                    items={unitToOptions}
                    dataElement="customDisplayScaleUnit"
                    onClickItem={(value) => onScaleUnitChange(value, false)}
                    currentSelectionKey={scale[1][1]}
                    width={leftDropdownWidth}
                  />
                </div>
              </Tooltip>
            </div>
          </div>

        </div>
      </div>
      <div className="warning-messages" aria-live="assertive" >
        {!isPageValueValid && (
          <p className="no-margin">
            {`${t('option.measurement.scaleModal.incorrectSyntax')} ${pageWarningMessage}`}
          </p>
        )}
        {!isWorldValueValid && (
          <p className="world-value-warning no-margin">
            {`${t('option.measurement.scaleModal.incorrectSyntax')} ${worldWarningMessage}`}
          </p>
        )}
      </div>
    </div>
  );
}

ScaleCustom.propTypes = ScaleCustomProps;

export default ScaleCustom;
