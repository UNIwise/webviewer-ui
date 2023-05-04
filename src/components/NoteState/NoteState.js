import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';
import NoteStatePopup from './NoteStatePopup';

import core from 'core';

import DataElementWrapper from 'components/DataElementWrapper';
import ShareTypes from 'constants/shareTypes';
import ShareTypeIcon from './ShareTypeIcon';

import './NoteState.scss';

import { getAnnotationShareType } from 'src/helpers/annotationShareType';

const propTypes = {
  annotation: PropTypes.object.isRequired,
  openOnInitialLoad: PropTypes.bool,
  handleStateChange: PropTypes.func,
  noteIndex: PropTypes.number,
};

function NoteState(props) {
  const {
    annotation,
    openOnInitialLoad = false,
    handleStateChange = () => {},
    noteIndex,
    annotationId,
  } = props;

  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(openOnInitialLoad);
  const popupRef = useRef();

  const togglePopup = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const annotationShareType = getAnnotationShareType(annotation) || ShareTypes.NONE;
  const annotationTooltip = `${t('option.notesOrder.shareType')}: ${t(
    `option.state.${annotationShareType.toLowerCase()}`,
  )}`;

  const noteStateButtonClassName = classNames('overflow', { active: isOpen });
  return (
    <Tooltip ref={popupRef} translatedContent={annotationTooltip} showOnKeyboardFocus hideOnClick>  
      <DataElementWrapper
        className="NoteState"
        dataElement="noteState"
        type="button"
        onClick={togglePopup}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        ref={popupRef}
      >  
        <div className={noteStateButtonClassName}>
          <ShareTypeIcon shareType={annotationShareType} ariaLabel={annotationTooltip} />
        </div>
        {isOpen && (
          <NoteStatePopup
            triggerElementName="noteState"
            handleStateChange={handleStateChange}
            onClose={() => {
              setIsOpen(false);
            }}
          />
        )}
      </DataElementWrapper>
    </Tooltip>
  );
}

NoteState.propTypes = propTypes;

export default NoteState;
