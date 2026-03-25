import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import selectors from 'selectors';
import DataElements from 'src/constants/dataElement';
import actions from 'actions';
import './NotePopup.scss';
import { useDispatch, useSelector } from 'react-redux';
import ToggleElementButton from 'components/ModularComponents/ToggleElementButton';

const createFlyoutItem = (option, icon, dataElement) => ({
  icon,
  label: `action.${option.toLowerCase()}`,
  title: `action.${option.toLowerCase()}`,
  option,
  dataElement,
});

export const notePopupFlyoutItems = [
  createFlyoutItem('Edit', '', 'notePopupEdit'),
  createFlyoutItem('Copy', '', 'notePopupCopy'),
  createFlyoutItem('Delete', '', 'notePopupDelete'),
];

const propTypes = {
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  handleCopy: PropTypes.func,
  isEditable: PropTypes.bool,
  isDeletable: PropTypes.bool,
  noteId: PropTypes.string,
  isCopyable: PropTypes.bool,
  isReply: PropTypes.bool,
};

function noop() {}

function NotePopup(props) {
  const {
    handleEdit = noop,
    handleDelete = noop,
    handleCopy = noop,
    isEditable,
    isDeletable,
    isCopyable,
    isReply,
    noteId,
  } = props;

  const customizableUI = useSelector((state) => selectors.getFeatureFlags(state)?.customizableUI);
  const flyoutSelector = `${DataElements.NOTE_POPUP_FLYOUT}-${noteId}`;
  const [t] = useTranslation();
  const isEditDisabled = useSelector((state) => selectors.isElementDisabled(state, 'notePopupEdit'));
  const isCopyDisabled = useSelector((state) => selectors.isElementDisabled(state, 'notePopupCopy'));
  const isDeleteDisabled = useSelector((state) => selectors.isElementDisabled(state, 'notePopupDelete'));

  const hasEditOption = isEditable && !isEditDisabled;
  const hasCopyOption = isCopyable && !isCopyDisabled;
  const hasDeleteOption = isDeletable && !isDeleteDisabled;

  const handleClick = (selection) => {
    if (selection === 'Edit') {
      handleEdit();
    } else if (selection === 'Copy') {
      handleCopy();
    } else if (selection === 'Delete') {
      handleDelete();
    }
  };

  if (!hasEditOption && !hasCopyOption && !hasDeleteOption) {
    return null;
  }

  const notePopupButtonClass = classNames('overflow note-popup-toggle-trigger');
  const optionsClass = classNames('NotePopup options note-popup-options', { 'options-reply': isReply, 'modular-ui': customizableUI });
  return (
    <div className={optionsClass}>
      <ToggleElementButton
        dataElement={`notePopup-${noteId}`}
        className={notePopupButtonClass}
        img="icon-tools-more"
        title={t('formField.formFieldPopup.options')}
        toggleElement={flyoutSelector}
        disabled={false}
      />
      <NotePopupFlyout
        flyoutSelector={flyoutSelector}
        handleClick={handleClick}
        hasEditOption={hasEditOption}
        hasCopyOption={hasCopyOption}
        hasDeleteOption={hasDeleteOption}
      />
    </div>
  );
}


const NotePopupFlyout = ({
  flyoutSelector,
  handleClick,
  hasEditOption,
  hasCopyOption,
  hasDeleteOption,
}) => {
  const dispatch = useDispatch();
  const currentFlyout = useSelector((state) => selectors.getFlyout(state, flyoutSelector));
  const [t] = useTranslation();

  useLayoutEffect(() => {
    let items = notePopupFlyoutItems;
    if (!hasEditOption) {
      items = items.filter((item) => item.option !== 'Edit');
    }
    if (!hasCopyOption) {
      items = items.filter((item) => item.option !== 'Copy');
    }
    if (!hasDeleteOption) {
      items = items.filter((item) => item.option !== 'Delete');
    }

    const notePopupFlyout = {
      dataElement: flyoutSelector,
      className: 'NotePopupFlyout',
      items: items.map((item) => {
        return {
          ...item,
          label: t(item.label),
          title: t(item.title),
          onClick: () => handleClick(item.option),
        };
      }),
    };

    if (!currentFlyout) {
      dispatch(actions.addFlyout(notePopupFlyout));
    } else {
      dispatch(actions.updateFlyout(notePopupFlyout.dataElement, notePopupFlyout));
    }
  }, [hasEditOption, hasCopyOption, hasDeleteOption]);

  return null;
};

NotePopupFlyout.propTypes = {
  flyoutSelector: PropTypes.string,
  handleClick: PropTypes.func,
  hasEditOption: PropTypes.bool,
  hasCopyOption: PropTypes.bool,
  hasDeleteOption: PropTypes.bool,
};

NotePopup.propTypes = propTypes;

export default NotePopup;
