import i18next from 'i18next';
import actions from 'actions';
import selectors from 'selectors';
import core from 'core';
import { createAnnouncement } from 'helpers/accessibility';

export default (dispatch, documentViewerKey, store) => (zoom) => {
  if (!Number.isFinite(zoom)) {
    // v11: jumpToAnnotation can fire zoomUpdated with NaN, which leaves the DocumentViewer
    // in a broken state (pages render with zero dimensions). Defer restoration to avoid
    // flickering from synchronous re-renders during the jump animation.
    const lastGoodZoom = selectors.getZoom(store.getState(), documentViewerKey);
    if (lastGoodZoom && Number.isFinite(lastGoodZoom)) {
      requestAnimationFrame(() => {
        const currentZoom = core.getZoom(documentViewerKey);
        if (!Number.isFinite(currentZoom)) {
          core.getDocumentViewer(documentViewerKey)?.zoomTo(lastGoodZoom);
        }
      });
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
