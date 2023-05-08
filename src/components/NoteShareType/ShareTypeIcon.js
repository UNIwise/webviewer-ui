// CUSTOM WISEFLOW
import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { ShareTypeColors } from 'constants/shareTypes';
import './ShareTypeIcon.scss';
import Tooltip from '../Tooltip';

const propTypes = {
  shareType: PropTypes.string, // in ["ASSESSORS", "PARTICIPANTS", "ALL", "NONE"]
  label: PropTypes.string,
};

function ShareTypeIcon(props) {
  const shareTypeColor = ShareTypeColors[props.shareType];
  const iconRef = useRef();
  return (
    <Tooltip ref={iconRef} translatedContent={props.label} showOnKeyboardFocus hideOnClick>
      <div ref={iconRef} className="share-type-icon" aria-label={props.label}>
        <div className="share-type-icon-inner" style={{ backgroundColor: shareTypeColor }} />
      </div>
    </Tooltip>
  );
}

PropTypes.ShareTypeIcon = propTypes;

export default ShareTypeIcon;
