import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';

import './SavedStateIndicator.scss';

export const SavedStateIndicatorState = {
  SAVED: 'SAVED',
  SAVING: 'SAVING',
  UNSAVED_EDITS: 'UNSAVED_EDITS',
  SAVED_OFFLINE: 'SAVED_OFFLINE',
  ERROR: 'ERROR',
  NONE: 'NONE',
};

const stateConfig = (labels) => ({
  [SavedStateIndicatorState.SAVING]: { icon: 'sprite:clock-outline', label: labels.saving },
  [SavedStateIndicatorState.SAVED]: { icon: 'check', label: labels.saved },
  [SavedStateIndicatorState.UNSAVED_EDITS]: { icon: 'edit', label: labels.unsaved },
  [SavedStateIndicatorState.SAVED_OFFLINE]: { icon: 'cloud-slash', label: labels.savedOffline },
  [SavedStateIndicatorState.ERROR]: {
    icon: 'exclamation-triangle',
    label: labels.errorLabel,
    title: labels.errorTitle,
  },
});

const SavedStateIndicator = ({ state, labels }) => {
  if (state === SavedStateIndicatorState.NONE) {
    return null;
  }

  const { icon, label, title } = stateConfig(labels)[state];

  return (
    <div className="SavedStateIndicator" title={title}>
      <Icon glyph={icon} />
      <span>{label}</span>
    </div>
  );
};

SavedStateIndicator.propTypes = {
  state: PropTypes.oneOf(Object.values(SavedStateIndicatorState)).isRequired,
  labels: PropTypes.shape({
    saved: PropTypes.string.isRequired,
    saving: PropTypes.string.isRequired,
    unsaved: PropTypes.string.isRequired,
    savedOffline: PropTypes.string.isRequired,
    errorLabel: PropTypes.string.isRequired,
    errorTitle: PropTypes.string.isRequired,
  }).isRequired,
};

export default SavedStateIndicator;
