import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import hotkeysManager, { setCloseToolTipFunc } from 'helpers/hotkeysManager';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import { getWebComponentScale } from 'helpers/getWebComponentScale';
import fireEvent from 'helpers/fireEvent';
import { isMac, isWindows, isIOS, isAndroid } from 'helpers/device';
import getRootNode from 'helpers/getRootNode';
import Events from 'constants/events';
import './Tooltip.scss';

const propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.string,
  hideShortcut: PropTypes.bool,
  forcePosition: PropTypes.string,
  hideOnClick: PropTypes.bool,
};

const isMouseOverElement = (elementBoundingRect, e) => {
  return (
    e.clientX >= elementBoundingRect.left &&
    e.clientX <= elementBoundingRect.right &&
    e.clientY >= elementBoundingRect.top &&
    e.clientY <= elementBoundingRect.bottom
  );
};

const Tooltip = forwardRef(({ content = '', children, hideShortcut, forcePosition, hideOnClick = true }, ref) => {
  const timeoutRef = useRef(null);
  const hiddenByClickRef = useRef(false);
  const childRef = useRef(null);
  useImperativeHandle(ref, () => childRef.current);
  const isDisabled = useSelector(state => selectors.isElementDisabled(state, 'tooltip'));

  const tooltipRef = useRef(null);
  const [show, setShow] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });
  const [location, setLocation] = useState('bottom');
  const [t] = useTranslation();
  const delayShow = 300;
  const opacityTimeout = 50;

  useEffect(() => {
    const showToolTip = () => {
      clearTimeout(timeoutRef.current);
      if (hiddenByClickRef.current) {
        return;
      }
      timeoutRef.current = setTimeout(() => {
        setCloseToolTipFunc(hideByClick);
        setShow(true);
        fireEvent(Events.TOOLTIP_OPENED);
      }, delayShow - opacityTimeout);
    };

    const hideTooltip = () => {
      clearTimeout(timeoutRef.current);
      setShow(false);
    };

    const hideByBlur = () => {
      hiddenByClickRef.current = false;
      hideTooltip();
    };

    const hideByClick = () => {
      hiddenByClickRef.current = true;
      hideTooltip();
    };

    const changeToolTipState = e => {
      if (childRef.current?.contains(e.target) || tooltipRef.current?.contains(e.target)) {
        showToolTip();
      } else {
        const childBoundingRect = childRef.current?.getBoundingClientRect();
        const tooltipBoundingRect = tooltipRef.current?.getBoundingClientRect();
        const isMouseOverChild = childBoundingRect && isMouseOverElement(childBoundingRect, e);
        const isMouseOverTooltip = tooltipBoundingRect && isMouseOverElement(tooltipBoundingRect, e);
        const rectBetweenChildAndTooltip = tooltipBoundingRect &&
          childBoundingRect && {
            top: Math.min(childBoundingRect.top, tooltipBoundingRect.top),
            bottom: Math.max(childBoundingRect.bottom, tooltipBoundingRect.bottom),
            left: Math[childBoundingRect.bottom < tooltipBoundingRect.top ? 'max' : 'min'](
              childBoundingRect.left,
              tooltipBoundingRect.left,
            ),
            right: Math[childBoundingRect.bottom < tooltipBoundingRect.top ? 'min' : 'max'](
              childBoundingRect.right,
              tooltipBoundingRect.right,
            ),
          };
        const isMouseBetweenChildAndTooltip =
          rectBetweenChildAndTooltip && isMouseOverElement(rectBetweenChildAndTooltip, e);
        if (!isMouseOverChild && !isMouseOverTooltip && !isMouseBetweenChildAndTooltip) {
          hiddenByClickRef.current = false;
          hideTooltip();
        }
      }
    };

    getRootNode().addEventListener('pointermove', changeToolTipState);
    if (hideOnClick) {
      childRef.current?.addEventListener('click', hideByClick);
    }
    // only enable focus event for non popup buttons
    if (
      childRef.current?.['ariaLabel'] !== 'action.close' &&
      content !== 'action.close' &&
      childRef.current?.['ariaLabel'] !== 'action.cancel' &&
      content !== 'action.cancel' &&
      !childRef.current?.parentElement.parentElement.className.includes('TextPopup')
    ) {
      childRef.current?.addEventListener('focus', showToolTip);
      childRef.current?.addEventListener('blur', hideByBlur);
    }

    const observer = new MutationObserver(mutations => {
      // hide tooltip when button get disabled, disable buttons don't have "mouseleave" events
      const lastMutation = mutations[mutations.length - 1];
      if (lastMutation && lastMutation.attributeName === 'disabled' && lastMutation.target.disabled) {
        // accounts for the delay on showToolTip
        setTimeout(() => {
          hideTooltip();
        }, delayShow);
      }
    });

    observer.observe(childRef.current, { attributes: true, childList: false, characterData: false });

    return () => {
      hideTooltip();
      observer.disconnect();

      getRootNode().removeEventListener('pointermove', changeToolTipState);
      if (hideOnClick) {
        childRef.current?.removeEventListener('click', hideByClick);
      }
      childRef.current?.removeEventListener('focus', showToolTip);
      childRef.current?.removeEventListener('blur', hideByBlur);
    };
  }, [childRef, hideOnClick]);

  const translatedContent = t(content);

  useLayoutEffect(() => {
    const childEle = childRef.current;
    const tooltipEle = tooltipRef.current;

    const setTopAndLeft = () => {
      const childRect = childEle.getBoundingClientRect();
      const tooltipRect = tooltipEle.getBoundingClientRect();

      let hostX = 0;
      let hostY = 0;
      if (window.isApryseWebViewerWebComponent) {
        const shadowRoot = getRootNode();
        const hostRect = shadowRoot.host.getBoundingClientRect();
        hostX = hostRect.x;
        hostY = hostRect.y;
      }

      const locationTopLeftMap = {
        // TODO be able to support other directions too
        bottom: {
          top: childRect.bottom - hostY,
          left: childRect.left + childRect.width / 2 - tooltipRect.width / 2 - hostX,
        },
        bottomLeft: {
          top: childRect.bottom - hostY,
          left: childRect.left - hostX,
        },
        top: {
          top: childRect.top - tooltipRect.height - hostY,
          left: childRect.left + childRect.width / 2 - tooltipRect.width / 2 - hostX,
        },
        topLeft: {
          top: childRect.top - tooltipRect.height - hostY,
          left: childRect.left - hostX,
        },
        left: {
          top: childRect.top + childRect.height / 2 - tooltipRect.height / 2 - hostY,
          left: childRect.left - tooltipRect.width - hostX,
        },
        right: {
          top: childRect.top + childRect.height / 2 - tooltipRect.height / 2 - hostY,
          left: childRect.right - hostX,
        },
      };

      // starting from placing the tooltip at the bottom location
      // if the tooltip can't fit into the window, try placing it counterclockwise until we can find a location to fit it
      const bestLocation =
        Object.keys(locationTopLeftMap).find(location => {
          if (forcePosition) {
            return location === forcePosition;
          }
          const { top: newTop, left: newLeft } = locationTopLeftMap[location];

          return (
            newTop > 0 &&
            newTop + tooltipRect.height < window.innerHeight &&
            newLeft > 0 &&
            newLeft + tooltipRect.width < window.innerWidth
          );
        }) || 'bottom';
      const { top: tooltipTop, left: tooltipLeft } = locationTopLeftMap[bestLocation];

      const { scaleX, scaleY } = getWebComponentScale();

      setPosition({
        top: tooltipTop / scaleY,
        left: tooltipLeft / scaleX,
      });
      setLocation(bestLocation);
    };

    if (show && childEle && tooltipEle) {
      setTopAndLeft();
      setTimeout(() => {
        setOpacity(1);
      }, opacityTimeout);
    } else {
      setOpacity(0);
    }
  }, [childRef, show, translatedContent]);

  const isUsingMobileDevices = isIOS || isAndroid;
  const child = React.cloneElement(children, {
    ref: childRef,
  });

  // If shortcut.xxx exists in translation-en.json file
  // method t will return the shortcut, otherwise it will return shortcut.xxx
  let shortcutKey = content.slice(content.indexOf('.') + 1);
  if (isWindows && shortcutKey === 'redo') {
    shortcutKey = 'redo_windows';
  }
  const isActive = hotkeysManager.isActive(shortcutKey);

  let hasShortcut = t(`shortcut.${shortcutKey}`).indexOf('.') === -1;
  let shortcut = t(`shortcut.${shortcutKey}`);
  if (isMac) {
    shortcut = shortcut.replace('Ctrl', 'Cmd');
  }

  if (!isActive) {
    hasShortcut = false;
  }

  return (
    <React.Fragment>
      {child}
      {show &&
        translatedContent &&
        !isUsingMobileDevices &&
        !isDisabled &&
        ReactDOM.createPortal(
          <div
            className={`tooltip--${location}`}
            style={{ opacity, ...position }}
            ref={tooltipRef}
            data-element="tooltip"
          >
            <div className={'tooltip__content'}>
              {translatedContent}
              {hasShortcut && !hideShortcut && <span className="tooltip__shortcut">{shortcut}</span>}
            </div>
          </div>,
          getRootNode().querySelector('#app'),
        )}
    </React.Fragment>
  );
});

Tooltip.displayName = 'Tooltip';
Tooltip.propTypes = propTypes;

export default Tooltip;
