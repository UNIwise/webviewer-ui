import React, { useCallback, useContext, useEffect, useState } from 'react';
import useCore from 'hooks/useCore';
import NotePopup from './NotePopup';
import { deleteOfficeEditorComment } from 'helpers/officeEditorCommentHelper';
import NoteContext from 'components/Note/Context';
import { useDispatch, useSelector } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';

function NotePopupContainer(props) {
  const { annotation, setIsEditing, editingKey, flyoutId } = props;
  const { core } = useCore();
  const { isOfficeEditorCommentAnnotation } = useContext(NoteContext);
  const dispatch = useDispatch();
  const activeDocumentViewerKey = useSelector(selectors.getActiveDocumentViewerKey);
  const isReadOnly = core.getIsReadOnly();
  const [canModify, setCanModify] = useState((isOfficeEditorCommentAnnotation && !isReadOnly) || core.canModify(annotation));
  const [canModifyContents, setCanModifyContents] = useState(core.canModifyContents(annotation));

  useEffect(() => {
    function onUpdateAnnotationPermission() {
      const officeEditorCanDelete = isOfficeEditorCommentAnnotation && !isReadOnly;
      setCanModify(officeEditorCanDelete || core.canModify(annotation));
      setCanModifyContents(core.canModifyContents(annotation));
    }

    onUpdateAnnotationPermission();
    core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
    return () => core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  }, [annotation, isOfficeEditorCommentAnnotation, isReadOnly, core]);

  const handleEdit = useCallback(() => {
    const isFreeText = annotation instanceof window.Core.Annotations.FreeTextAnnotation;
    if (isFreeText && core.getAnnotationManager().isFreeTextEditingEnabled()) {
      core.getAnnotationManager().trigger('annotationDoubleClicked', annotation);
    } else {
      if (isOfficeEditorCommentAnnotation) {
        dispatch(actions.triggerNoteEditing());
      }
      setIsEditing(true, editingKey);
    }
  }, [annotation, setIsEditing, editingKey, core]);

  const handleDelete = useCallback(() => {
    if (isOfficeEditorCommentAnnotation) {
      return deleteOfficeEditorComment({ annotation, core });
    }

    core.deleteAnnotations([annotation, ...annotation.getGroupedChildren()]);
  }, [annotation, core, isOfficeEditorCommentAnnotation]);

  const handleCopy = useCallback(() => {
    const annotManager = core.getAnnotationManager(activeDocumentViewerKey);
    annotManager.deselectAllAnnotations();
    const copiedAnnotation = annotManager.getAnnotationCopy(annotation);
    if (Array.isArray(copiedAnnotation)) {
      copiedAnnotation.forEach((copiedAnnot) => {
        annotManager.addAnnotation(copiedAnnot);
        annotManager.redrawAnnotation(copiedAnnot);
      });
    } else if (copiedAnnotation) {
      annotManager.addAnnotation(copiedAnnotation);
      annotManager.redrawAnnotation(copiedAnnotation);
    }
    window.dispatchEvent(new CustomEvent('annotationCopied', {
      detail: { annotation, copiedAnnotation }
    }));
  }, [annotation, activeDocumentViewerKey, core]);

  const isEditable = canModifyContents;
  const isDeletable = canModify && !annotation?.NoDelete;
  const isCopyable = canModify;
  const noteId = flyoutId || ((annotation) ? annotation.Id : '');
  const passProps = {
    handleEdit,
    handleDelete,
    handleCopy,
    isCopyable,
    isEditable,
    isDeletable,
    noteId,
  };

  return (
    <NotePopup {...props} {...passProps} />
  );
}

export default NotePopupContainer;
