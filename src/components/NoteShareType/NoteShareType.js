import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './NoteShareType.scss';

import core from 'core';
import getAnnotationManager from 'src/core/getAnnotationManager';
import { getAnnotationShareType, setAnnotationShareType } from 'src/helpers/annotationShareType';
import useOverflowContainer from 'hooks/useOverflowContainer';
import useOnClickOutside from 'hooks/useOnClickOutside';

import DataElementWrapper from 'components/DataElementWrapper';
import ShareTypes from 'constants/shareTypes';
import ShareTypeIcon from '../NoteShareType/ShareTypeIcon';

const propTypes = {
  annotation: PropTypes.object.isRequired,
};

function NoteShareType(props) {
  const { annotation } = props;

  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();
  const [shareType, setShareType] = useState(getAnnotationShareType(annotation) || ShareTypes.NONE);

  const { popupMenuRef: dialogRef, style } = useOverflowContainer(isOpen, { container: '.normal-notes-container', offset: 25 });

  const isOwnedByCurrentUser = annotation.Author === core.getCurrentUser();

  const annotationTooltip = useMemo(() => `${t('option.notesOrder.shareType')}: ${t(
    `option.state.${shareType.toLowerCase()}`,
  )}`, [shareType]);

  const onClose = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const onOpen = () => {
    dialogRef.current?.show();
    setIsOpen(true);
  };

  const togglePopup = (e) => {
    e.stopPropagation();
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  useOnClickOutside(wrapperRef, () => {
    onClose();
  });

  const preventAutoClose = (e) => e.stopPropagation();

  const handleStateChange = useCallback((newValue) => {
    // CUSTOM WISEFLOW: Set custom data value called sharetype and trigger annotationChanged event

    // Set share type and trigger annotationChanged "modify" event
    setAnnotationShareType(annotation, newValue);
    getAnnotationManager().trigger('annotationChanged', [[annotation], 'modify', {}]);
    setShareType(newValue);
    onClose();
  }, [annotation]);

  return (
    <DataElementWrapper
      className={classNames('NoteShareType', { active: isOpen })}
      dataElement="noteShareType"
      disabled={!isOwnedByCurrentUser}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      ref={wrapperRef}
    >
      <button className="share-type-icon-button" onClick={togglePopup}><ShareTypeIcon shareType={shareType} label={annotationTooltip} /></button>

      <dialog
        ref={dialogRef}
        style={style}
        className={classNames('note-share-type-dialog')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="note-share-type-popup" onClick={preventAutoClose}>
          <DataElementWrapper
            tabbable
            dataElement="notePopupStateAssessor"
            type="button"
            className={classNames('note-sharetype-option', { selected: shareType === ShareTypes.ASSESSORS })}
            onClick={() => handleStateChange(ShareTypes.ASSESSORS)}
          >
            <ShareTypeIcon shareType={ShareTypes.ASSESSORS} />
            {t('option.state.assessors')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateParticipants"
            type="button"
            className={classNames('note-sharetype-option', { selected: shareType === ShareTypes.PARTICIPANTS })}
            onClick={() => handleStateChange(ShareTypes.PARTICIPANTS)}
          >
            <ShareTypeIcon shareType={ShareTypes.PARTICIPANTS} />
            {t('option.state.participants')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateAll"
            type="button"
            className={classNames('note-sharetype-option', { selected: shareType === ShareTypes.ALL })}
            onClick={() => handleStateChange(ShareTypes.ALL)}
          >
            <ShareTypeIcon shareType={ShareTypes.ALL} />
            {t('option.state.all')}
          </DataElementWrapper>

          <DataElementWrapper
            tabbable
            dataElement="notePopupStateAssessors"
            type="button"
            className={classNames('note-sharetype-option', { selected: shareType === ShareTypes.NONE })}
            onClick={() => handleStateChange(ShareTypes.NONE)}
          >
            <ShareTypeIcon shareType={ShareTypes.NONE} />
            {t('option.state.none')}
          </DataElementWrapper>
        </div>
      </dialog>
    </DataElementWrapper>
  );
}

NoteShareType.propTypes = propTypes;

export default NoteShareType;
