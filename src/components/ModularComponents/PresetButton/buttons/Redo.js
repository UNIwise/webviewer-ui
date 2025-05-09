import React, { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import PropTypes from 'prop-types';
import ActionButton from 'components/ActionButton';
import { menuItems } from '../../Helpers/menuItems';
import core from 'core';
import FlyoutItemContainer from '../../FlyoutItemContainer';

/**
 * A button that performs the redo action.
 * @name redoButton
 * @memberof UI.Components.PresetButton
 */
const RedoButton = forwardRef((props, ref) => {
  const { isFlyoutItem, dataElement } = props;
  const { icon, title } = menuItems.redoButton;
  const activeDocumentViewerKey = useSelector((state) => selectors.getActiveDocumentViewerKey(state));
  const canRedo = useSelector((state) => selectors.canRedo(state, activeDocumentViewerKey));
  const disabled = !canRedo;

  const handleClick = () => {
    core.redo(activeDocumentViewerKey);
  };

  return (
    isFlyoutItem ?
      <FlyoutItemContainer {...props} ref={ref} onClick={handleClick} disabled={disabled} />
      : (
        <ActionButton
          className={'PresetButton redo-button'}
          dataElement={dataElement}
          title={title}
          img={icon}
          onClick={handleClick}
          shouldPassActiveDocumentViewerKeyToOnClickHandler={true}
          isNotClickableSelector={(state) => !state.viewer.canRedo[state.viewer.activeDocumentViewerKey]}
        />
      )
  );
});

RedoButton.propTypes = {
  isFlyoutItem: PropTypes.bool,
  dataElement: PropTypes.string,
};
RedoButton.displayName = 'RedoButton';

export default RedoButton;