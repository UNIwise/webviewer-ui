import React from 'react';
import PropTypes from 'prop-types';
import core from 'core';

import NoteState from './NoteState';
import { createStateAnnotation } from 'helpers/NoteStateUtils';
import { setAnnotationShareType } from 'src/helpers/annotationShareType';
import getAnnotationManager from 'src/core/getAnnotationManager';


const propTypes = {
  annotation: PropTypes.object,
};

function NoteStateContainer(props) {
  const { annotation } = props;

  const handleStateChange = React.useCallback(
    function handleStateChangeCallback(newValue) {
      // CUSTOM WISEFLOW: Set custom data value called sharetype and trigger annotationChanged event

      // Set share type and trigger annotationChanged "modify" event
      setAnnotationShareType(annotation, newValue);
      getAnnotationManager().trigger('annotationChanged', [[annotation], 'modify', {}]);
    },
    [annotation],
  );

  return (
    <div>
      <NoteState handleStateChange={handleStateChange} {...props} />
    </div>
  );
}

NoteStateContainer.propTypes = propTypes;
export default NoteStateContainer;
