
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useOnClickOutside from 'hooks/useOnClickOutside';
import useOnFocusOutside from 'hooks/useOnFocusOutside';
import useOverflowContainer from 'hooks/useOverflowContainer';
import DataElementWrapper from 'components/DataElementWrapper';
import PopupPortal from 'components/PopupPortal';
import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import PropTypes from 'prop-types';
import ShareTypeIcon from './ShareTypeIcon';

import './NoteState.scss';

const propTypes = {
  style: PropTypes.object,
  triggerElementName: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  handleStateChange: PropTypes.func,
};

const NoteStatePopup = ({
  style,
  triggerElementName,
  onClose = () => {},
  handleStateChange = () => {},
}) => {
  const [t] = useTranslation();
  const [position, setPosition] = useState({ left: 'auto', right: 'auto', top: 'auto' });
  const popupRef = useRef();
  const { popupMenuRef, location } = useOverflowContainer('.normal-notes-container', 'bottom', isOpen);

  const isOwnedByCurrentUser = annotation.Author === core.getCurrentUser();

  useOnClickOutside(popupRef, (e) => {
    const triggerElement = document.querySelector(`[data-element=${triggerElementName}]`);
    const clickedTrigger = triggerElement.contains(e.target);
    if (!clickedTrigger) {
      // we only want to close the popup if we clicked outside and not on the trigger
      onClose();
    }
  });

  useOnFocusOutside(popupRef, () => {
    setIsOpen(false);
  });

  function closeOptionsMenu() {
    setIsOpen(false);
  }

  const createOnStateOptionButtonClickHandler = (state) => {
    return () => {
      handleStateChange(state);
      closeOptionsMenu();
    };

  };

  useEffect(() => {
    const position = getOverlayPositionBasedOn(triggerElementName, popupRef);
    setPosition(position);
  }, []);

  return (
    <PopupPortal
      id="note-state-popup-portal"
      position={position}
    >
      <div
        style={style}
        className={`note-state-options ${isOwnedByCurrentUser ? 'enabled' : 'disabled'} ${location}`}
        ref={popupMenuRef}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            closeOptionsMenu();
          }
        }}
      >
        <DataElementWrapper dataElement="notePopupState">
          <DataElementWrapper
            tabbable
            dataElement="notePopupState-assessor"
            className={`note-state-option${annotationShareType === ShareTypes.ASSESSORS ? ' selected' : ''}`}
            onClick={createOnStateOptionButtonClickHandler(ShareTypes.ASSESSORS)}
          >
            <ShareTypeIcon shareType={ShareTypes.ASSESSORS} />
            {t('option.state.assessors')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateParticipants"
            className={`note-state-option${annotationShareType === ShareTypes.PARTICIPANTS ? ' selected' : ''}`}
            onClick={createOnStateOptionButtonClickHandler(ShareTypes.PARTICIPANTS)}
          >
            <ShareTypeIcon shareType={ShareTypes.PARTICIPANTS} />
            {t('option.state.participants')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateAll"
            className={`note-state-option${annotationShareType === ShareTypes.ALL ? ' selected' : ''}`}
            onClick={createOnStateOptionButtonClickHandler(ShareTypes.ALL)}
          >
            <ShareTypeIcon shareType={ShareTypes.ALL} />
            {t('option.state.all')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateAssessors"
            className={`note-state-option${annotationShareType === ShareTypes.NONE ? ' selected' : ''}`}
            onClick={createOnStateOptionButtonClickHandler(ShareTypes.NONE)}
          >
            <ShareTypeIcon shareType={ShareTypes.NONE} />
            {t('option.state.none')}
          </DataElementWrapper>
        </DataElementWrapper>
      </div>
    </PopupPortal>
  );
};

NoteStatePopup.propTypes = propTypes;

export default NoteStatePopup;