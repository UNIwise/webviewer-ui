import { useState, useRef, useLayoutEffect } from 'react';

/**
 * Check if popup overflows top or bottom of container and return new location
 * @param {string} containerElementSelector
 * @param {'bottom' | 'top'} defaultLocation
 * @param {boolean} isOpen
 * @returns {{popupMenuRef: React.MutableRefObject<null>, location: 'bottom' | 'top'}}
 * 
 */
const useOverflowContainer = (containerElementSelector, defaultLocation, isOpen) => {
  const [location, setLocation] = useState(defaultLocation);
  const popupMenuRef = useRef();

  useLayoutEffect(() => {
    const popupMenuEle = popupMenuRef.current;
    const containerEle = document.querySelector(containerElementSelector);

    if (isOpen && popupMenuEle && containerEle) {
      const popupRect = popupMenuEle.getBoundingClientRect();
      const containerRect = containerEle.getBoundingClientRect();

      const shouldRelocateTop = location === 'bottom' && popupRect.bottom > containerRect.bottom;
      if (shouldRelocateTop) {
        setLocation('top');
      }

      const shouldRelocateBottom = location === 'top' && popupRect.top < containerRect.top;
      if (shouldRelocateBottom) {
        setLocation('bottom');
      }
    }
  }, [isOpen, popupMenuRef, location, containerElementSelector]);

  return { popupMenuRef, location };
};

export default useOverflowContainer;
