import React, { forwardRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { shortcutAria } from 'helpers/hotkeysManager';
import selectors from 'selectors';
import { getClickMiddleWare, ClickedItemTypes } from 'helpers/clickTracker';
import { createAnnouncement } from 'helpers/accessibility';

import './Button.scss';

const NOOP = e => {
  e?.stopPropagation();
  e?.preventDefault();
};

const propTypes = {
  isActive: PropTypes.bool,
  mediaQueryClassName: PropTypes.string,
  img: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  color: PropTypes.string,
  dataElement: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onMouseUp: PropTypes.func,
  isSubmitType: PropTypes.bool,
  /** Will override translated title if both given. */
  ariaLabel: PropTypes.string,
  ariaControls: PropTypes.string,
  role: PropTypes.string,
  hideTooltipShortcut: PropTypes.bool,
  useI18String: PropTypes.bool,
  shouldPassActiveDocumentViewerKeyToOnClickHandler: PropTypes.bool,
};

// eslint-disable-next-line react/display-name
const Button = forwardRef((props, ref) => {
  const [removeElement, isCustomUI, customOverrides = {}, activeDocumentViewerKey = 1] = useSelector(
    state => [
      selectors.isElementDisabled(state, props.dataElement),
      selectors.getFeatureFlags(state)?.customizableUI,
      selectors.getCustomElementOverrides(state, props.dataElement),
      selectors.getActiveDocumentViewerKey(state),
    ],
    shallowEqual,
  );

  const {
    // old name for disabled. We are keeping it for backwards compatibility
    // should remove in the future .
    disable,
    disabled,
    isActive,
    mediaQueryClassName,
    img,
    tabIndex,
    label,
    useI18String = true,
    color,
    dataElement,
    onClick,
    onDoubleClick,
    onMouseUp,
    className,
    title,
    style,
    ariaLabel,
    ariaControls,
    role,
    strokeColor,
    fillColor,
    hideTooltipShortcut,
    iconClassName,
    forceTooltipPosition,
    isSubmitType,
    hideOnClick,
    shouldPassActiveDocumentViewerKeyToOnClickHandler,
    onClickAnnouncement,
  } = { ...props, ...customOverrides };
  const [t] = useTranslation();

  const customOverrideClasses = {};
  if (customOverrides && customOverrides.hidden && customOverrides.hidden.length) {
    for (const screenSize of customOverrides.hidden) {
      customOverrideClasses[`hide-in-${screenSize}`] = true;
    }
  }

  const aLabel = ariaLabel || (title ? t(title) : undefined);
  const aControls = ariaControls || '';

  const shortcutKey = title ? title.slice(title.indexOf('.') + 1) : undefined;
  const ariaKeyshortcuts = shortcutKey ? shortcutAria(shortcutKey) : undefined;

  const isBase64 = img?.trim().startsWith('data:');

  const imgToShow = img;

  // for backwards compatibility
  const actuallyDisabled = disable || disabled;
  let onClickHandler;
  if (shouldPassActiveDocumentViewerKeyToOnClickHandler) {
    onClickHandler = () => {
      createAnnouncement(onClickAnnouncement);
      getClickMiddleWare()?.(dataElement, { type: ClickedItemTypes.BUTTON });
      if (onClick) {
        return onClick(activeDocumentViewerKey);
      }
    };
  } else {
    onClickHandler = e => {
      createAnnouncement(onClickAnnouncement);
      getClickMiddleWare()?.(dataElement, { type: ClickedItemTypes.BUTTON });
      if (onClick) {
        return onClick(e);
      }
    };
  }

  // if there is no file extension then assume that this is a glyph
  const isGlyph = img && !isBase64 && (!img.includes('.') || img.startsWith('<svg'));
  const shouldRenderTooltip = !!title;
  const children = (
    <button
      ref={ref}
      className={classNames({
        Button: true,
        active: isActive && !actuallyDisabled,
        disabled: actuallyDisabled,
        [mediaQueryClassName]: mediaQueryClassName,
        [className]: className,
        ...customOverrideClasses,
        'modular-ui': isCustomUI,
        'icon-only': isGlyph && !label,
      })}
      style={style}
      data-element={dataElement}
      // Can't use button disabled property here.
      // Because mouse events won't fire and we want them to
      // so that we can show the button tooltip
      onClick={actuallyDisabled ? NOOP : onClickHandler}
      onDoubleClick={actuallyDisabled ? NOOP : onDoubleClick}
      onMouseUp={actuallyDisabled ? NOOP : onMouseUp}
      aria-label={aLabel}
      aria-controls={aControls}
      role={role}
      tabIndex={tabIndex}
      aria-keyshortcuts={ariaKeyshortcuts}
      aria-expanded={isActive}
      type={isSubmitType ? 'submit' : 'button'}
      disabled={actuallyDisabled}
    >
      {isGlyph && (
        <Icon
          disabled={actuallyDisabled}
          glyph={imgToShow}
          color={color}
          fillColor={fillColor}
          strokeColor={strokeColor}
          className={iconClassName}
        />
      )}
      {imgToShow && !isGlyph && <img src={imgToShow} />}
      {label && (useI18String ? <span>{t(label)}</span> : <span>{label}</span>)}
    </button>
  );

  return removeElement ? null : shouldRenderTooltip ? (
    <Tooltip
      content={title}
      hideShortcut={hideTooltipShortcut || actuallyDisabled}
      forcePosition={forceTooltipPosition}
      hideOnClick={hideOnClick}
    >
      {children}
    </Tooltip>
  ) : (
    children
  );
});

Button.propTypes = propTypes;

export default React.memo(Button);
