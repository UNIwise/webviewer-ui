import i18next from 'i18next';
import actions from 'actions';
import selectors from 'selectors';
import core from 'core';
import { createAnnouncement } from 'helpers/accessibility';

export default (dispatch, documentViewerKey, store) => (zoom) => {
  if (!Number.isFinite(zoom)) {
    // v11: jumpToAnnotation can fire zoomUpdated with NaN, which leaves the DocumentViewer
    // in a broken state (pages render with zero dimensions). Restore the last known good zoom.
    const lastGoodZoom = selectors.getZoom(store.getState(), documentViewerKey);
    if (lastGoodZoom && Number.isFinite(lastGoodZoom)) {
      core.getDocumentViewer(documentViewerKey)?.zoomTo(lastGoodZoom);
    }
    return;
  }
  dispatch(actions.setZoom(zoom, documentViewerKey));
  const featureFlags = selectors.getFeatureFlags(store.getState());
  const { customizableUI } = featureFlags;

  if (customizableUI) {
    const currentZoom = Math.round(core.getZoom() * 100);
    const zoomAnnouncement = `${i18next.t('action.zoomChanged')} ${currentZoom}%`;
    createAnnouncement(zoomAnnouncement);
  }
};
