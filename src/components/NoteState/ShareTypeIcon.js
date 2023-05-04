// CUSTOM WISEFLOW
import React from 'react';
import PropTypes from 'prop-types';

import { ShareTypeColors } from 'constants/shareTypes';
import './ShareTypeIcon.scss';

const propTypes = {
  shareType: PropTypes.string, // in ["ASSESSORS", "PARTICIPANTS", "ALL", "NONE"]
  ariaLabel: PropTypes.string,
};

function ShareTypeIcon(props) {
  const shareTypeColor = ShareTypeColors[props.shareType];
  return (
    <div className="share-type-icon" aria-label={props.ariaLabel}>
      <div className="share-type-icon-inner" style={{ backgroundColor: shareTypeColor }} />
    </div>
  );
}

PropTypes.ShareTypeIcon = propTypes;

export default ShareTypeIcon;
