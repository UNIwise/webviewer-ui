import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import '../Flyout/Flyout.scss';

const FlyoutItemContainer = forwardRef((props, ref) => {
  const {
    label,
    dataElement,
    disabled,
    additionalClass,
    icon,
    ariaKeyshortcuts,
    children,
    index,
    isChild,
    elementDOM,
    onKeyDownHandler,
    onClickHandler,
  } = props;

  const { t } = useTranslation();

  const getFlyoutItemContent = () => {
    if (elementDOM) {
      return (
        <div className='custom-element-wrapper'>
          {icon}
          {elementDOM}
        </div>
      );
    }

    const finalLabel = typeof label === 'string' ? t(label) : label;
    return (
      <button
        className="flyout-item"
        disabled={disabled}
        onClick={onClickHandler(props, isChild, index)}
        aria-disabled={disabled}
        onKeyDown={onKeyDownHandler}
      >
        <div className="icon-label-wrapper">
          {icon}
          {finalLabel && <span className="flyout-item-label">{finalLabel}</span>}
        </div>
        {ariaKeyshortcuts && <span className="hotkey-wrapper">{`(${ariaKeyshortcuts})`}</span>}
        {children && <Icon className="icon-open-submenu" glyph="icon-chevron-right" />}
      </button>
    );
  };

  return (
    <li
      key={label}
      ref={ref}
      data-element={dataElement}
      className={classNames({
        'flyout-item-container': true,
        'disabled': disabled,
        [additionalClass]: true
      })}
    >
      { getFlyoutItemContent() }
    </li>
  );
});

FlyoutItemContainer.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    // e.g. Zoom Options
    PropTypes.object,
  ]),
  dataElement: PropTypes.string,
  disabled: PropTypes.bool,
  additionalClass: PropTypes.string,
  icon: PropTypes.node,
  ariaKeyshortcuts: PropTypes.string,
  children: PropTypes.array,
  index: PropTypes.number,
  isChild: PropTypes.bool,
  elementDOM: PropTypes.node,
  onKeyDownHandler: PropTypes.func,
  onClickHandler: PropTypes.func,
};
FlyoutItemContainer.displayName = 'FlyoutItemContainer';

export default FlyoutItemContainer;