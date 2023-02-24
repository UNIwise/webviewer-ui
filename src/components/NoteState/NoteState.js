import classNames from 'classnames';
import useOnClickOutside from 'hooks/useOnClickOutside';
import useOnFocusOutside from 'hooks/useOnFocusOutside';
import useOverflowContainer from 'hooks/useOverflowContainer';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';

import core from 'core';

import DataElementWrapper from 'components/DataElementWrapper';
import ShareTypes from 'constants/shareTypes';
import ShareTypeIcon from './ShareTypeIcon';

import './NoteState.scss';

import { getAnnotationShareType } from 'src/helpers/annotationShareType';

const propTypes = {
  annotation: PropTypes.object,
  isSelected: PropTypes.bool,
  openOnInitialLoad: PropTypes.bool,
  handleStateChange: PropTypes.func,
  noteIndex: PropTypes.number,
};

function NoteState(props) {
  const {
    annotation,
    isSelected = false,
    openOnInitialLoad = false,
    handleStateChange,
    noteIndex,
    annotationId,
  } = props;

  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(openOnInitialLoad);
  const popupRef = useRef();
  const { popupMenuRef, location } = useOverflowContainer('.normal-notes-container', 'bottom', isOpen);

  const isOwnedByCurrentUser = annotation.Author === core.getCurrentUser();

  useOnClickOutside(popupRef, () => {
    setIsOpen(false);
  });

  useOnFocusOutside(popupRef, () => {
    setIsOpen(false);
  });

  const togglePopup = e => {
    e.stopPropagation();
    if (!isOwnedByCurrentUser) return;
    setIsOpen(!isOpen);
  };

  function closeOptionsMenu() {
    setIsOpen(false);
  }

  const getShareTypeIcon = (shareType, ariaLabel) => {
    return <ShareTypeIcon shareType={shareType} ariaLabel={ariaLabel} />;
  };

  function createOnStateOptionButtonClickHandler(state) {
    // If not current author, do not allow state change
    if (!isOwnedByCurrentUser) return;

    return function onStateOptionButtonClick() {
      if (handleStateChange) {
        handleStateChange(state);
      }
      closeOptionsMenu();
    };
  }

  if (!annotation) {
    return null;
  }

  const annotationShareType = getAnnotationShareType(annotation) || ShareTypes.NONE;
  const isReply = annotation.isReply();
  const annotationTooltip = `${t('option.notesOrder.shareType')}: ${t(
    `option.state.${annotationShareType.toLowerCase()}`,
  )}`;
  const icon = getShareTypeIcon(annotationShareType, annotationTooltip);

  // Hide sharetype menu if annotation is not selected
  if (!isSelected) {
    return null;
  }

  if (isReply) {
    return null;
  }

  const noteStateButtonClassName = classNames('overflow', { active: isOpen });
  return (
    <Tooltip ref={popupRef} translatedContent={annotationTooltip} showOnKeyboardFocus hideOnClick>
      <DataElementWrapper
        className="NoteState"
        dataElement="noteState"
        onClick={togglePopup}
        type="button"
        onKeyDown={e => {
          if (e.key === 'Escape') {
            closeOptionsMenu();
          }
        }}
      >
        <div className={noteStateButtonClassName}>{icon}</div>
        {isOpen && (
          <div
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
                {getShareTypeIcon(ShareTypes.ASSESSORS)}
                {t('option.state.assessors')}
              </DataElementWrapper>

              <DataElementWrapper
                tabbable
                dataElement="notePopupStateParticipants"
                className={`note-state-option${annotationShareType === ShareTypes.PARTICIPANTS ? ' selected' : ''}`}
                onClick={createOnStateOptionButtonClickHandler(ShareTypes.PARTICIPANTS)}
              >
                {getShareTypeIcon(ShareTypes.PARTICIPANTS)}
                {t('option.state.participants')}
              </DataElementWrapper>

              <DataElementWrapper
                tabbable
                dataElement="notePopupStateAll"
                className={`note-state-option${annotationShareType === ShareTypes.ALL ? ' selected' : ''}`}
                onClick={createOnStateOptionButtonClickHandler(ShareTypes.ALL)}
              >
                {getShareTypeIcon(ShareTypes.ALL)}
                {t('option.state.all')}
              </DataElementWrapper>

              <DataElementWrapper
                tabbable
                dataElement="notePopupStateAssessors"
                className={`note-state-option${annotationShareType === ShareTypes.NONE ? ' selected' : ''}`}
                onClick={createOnStateOptionButtonClickHandler(ShareTypes.NONE)}
              >
                {getShareTypeIcon(ShareTypes.NONE)}
                {t('option.state.none')}
              </DataElementWrapper>
            </DataElementWrapper>
          </div>
        )}
      </DataElementWrapper>
    </Tooltip>
  );
}

NoteState.propTypes = propTypes;

export default NoteState;
