/**
 * Contains string enums for WebViewer UI events.
 * @name UI.Events
 * @property {string} ANNOTATION_FILTER_CHANGED {@link UI#event:annotationFilterChanged UI.Events.annotationFilterChanged}
 * @property {string} DOCUMENT_LOADED {@link UI#event:documentLoaded UI.Events.documentLoaded}
 * @property {string} DOCUMENT_MERGED {@link UI#event:documentMerged UI.Events.documentMerged}
 * @property {string} FILE_DOWNLOADED {@link UI#event:fileDownloaded UI.Events.fileDownloaded}
 * @property {string} LOAD_ERROR {@link UI#event:loaderror UI.Events.loaderror}
 * @property {string} DRAG_OUTLINE {@link UI#event:dragOutline UI.Events.dragOutline}
 * @property {string} DROP_OUTLINE {@link UI#event:dropOutline UI.Events.dropOutline}
 * @property {string} PANEL_RESIZED {@link UI#event:panelResized UI.Events.panelResized}
 * @property {string} THEME_CHANGED {@link UI#event:themeChanged UI.Events.themeChanged}
 * @property {string} TOOLBAR_GROUP_CHANGED {@link UI#event:toolbarGroupChanged UI.Events.toolbarGroupChanged}
 * @property {string} SELECTED_THUMBNAIL_CHANGED {@link UI#event:selectedThumbnailChanged UI.Events.selectedThumbnailChanged}
 * @property {string} THUMBNAIL_DRAGGED {@link UI#event:thumbnailDragged UI.Events.thumbnailDragged}
 * @property {string} THUMBNAIL_DROPPED {@link UI#event:thumbnailDropped UI.Events.thumbnailDropped}
 * @property {string} USER_BOOKMARKS_CHANGED {@link UI#event:userBookmarksChanged UI.Events.userBookmarksChanged}
 * @property {string} OUTLINE_BOOKMARKS_CHANGED {@link UI#event:outlineBookmarksChanged UI.Events.outlineBookmarksChanged}
 * @property {string} VIEWER_LOADED {@link UI#event:viewerLoaded UI.Events.viewerLoaded}
 * @property {string} VISIBILITY_CHANGED {@link UI#event:visibilityChanged UI.Events.visibilityChanged}
 * @property {string} FULLSCREEN_MODE_TOGGLED {@link UI#event:fullscreenModeToggled UI.Events.fullscreenModeToggled}
 * @property {string} BEFORE_TAB_CHANGED {@link UI#event:beforeTabChanged UI.Events.beforeTabChanged}
 * @property {string} TAB_DELETED {@link UI#event:tabDeleted UI.Events.tabDeleted}
 * @property {string} TAB_ADDED {@link UI#event:tabAdded UI.Events.tabAdded}
 * @property {string} TAB_MOVED {@link UI#event:tabMoved UI.Events.tabMoved}
 * @property {string} LANGUAGE_CHANGED {@link UI#event:tabMoved UI.Events.languageChanged}
 * @property {string} MULTI_VIEWER_READY {@link UI#event:multiViewerReady  UI.Events.multiViewerReady }
 * @property {string} COMPARE_ANNOTATIONS_LOADED {@link UI#event:compareAnnotationsLoaded  UI.Events.compareAnnotationsLoaded }
 * @property {string} TAB_MANAGER_READY {@link UI#event:onTabManagerReady  UI.Events.onTabManagerReady }
 * @property {string} TOOLTIP_OPENED {@link UI#event:tooltipOpened  UI.Events.tooltipOpened }
 * @example
  WebViewer(...).then(function(instance) {
    const UIEvents = instance.UI.Events;
    instance.UI.addEventListener(UIEvents.ANNOTATION_FILTER_CHANGED, e => {
      const { types, authors, colors } = e.detail;
      console.log(types, authors, colors);
    });
  });
 */

export default {
  // CUSTOM WISEFLOW
  'WISEFLOW_ANNOTATION_CHANGED': 'wiseflowAnnotationChanged',
  'UNPOSTED_ANNOTATIONS_CHANGED': 'unpostedAnnotationsChanged',
  // CUSTOM WISEFLOW END
  'ANNOTATION_FILTER_CHANGED': 'annotationFilterChanged',
  'DOCUMENT_LOADED': 'documentLoaded',
  'DOCUMENT_MERGED': 'documentMerged',
  'FILE_DOWNLOADED': 'fileDownloaded',
  'LOAD_ERROR': 'loaderror',
  'DRAG_OUTLINE': 'dragOutline',
  'DROP_OUTLINE': 'dropOutline',
  'PANEL_RESIZED': 'panelResized',
  'THEME_CHANGED': 'themeChanged',
  'TOOLBAR_GROUP_CHANGED': 'toolbarGroupChanged',
  'SELECTED_THUMBNAIL_CHANGED': 'selectedThumbnailChanged',
  'THUMBNAIL_DRAGGED': 'thumbnailDragged',
  'THUMBNAIL_DROPPED': 'thumbnailDropped',
  'USER_BOOKMARKS_CHANGED': 'userBookmarksChanged',
  'OUTLINE_BOOKMARKS_CHANGED': 'outlineBookmarksChanged',
  'VIEWER_LOADED': 'viewerLoaded',
  'VISIBILITY_CHANGED': 'visibilityChanged',
  'FULLSCREEN_MODE_TOGGLED': 'fullscreenModeToggled',
  'BEFORE_TAB_CHANGED': 'beforeTabChanged',
  'TAB_DELETED': 'tabDeleted',
  'TAB_ADDED': 'tabAdded',
  'TAB_MOVED': 'tabMoved',
  'LANGUAGE_CHANGED': 'languageChanged',
  'MULTI_VIEWER_READY': 'multiViewerReady',
  'COMPARE_ANNOTATIONS_LOADED': 'compareAnnotationsLoaded',
  'TAB_MANAGER_READY': 'onTabManagerReady',
  'MODULAR_UI_IMPORTED': 'modularUIImported',
  'TOOLTIP_OPENED': 'tooltipOpened'
};

/**
 * Triggered when Core#annotationChanged is triggered.
 * Implements custom annotation change handling, like adding default share type on create etc.
 * @name UI#wiseflowAnnotationChanged
 * @event
 * @type {object}
 * @property {Annotation[]} annotations - The updated annotations.
 * @property {string} action - action: "add", .
 * @property {object} info - Event info (https://www.pdftron.com/api/web/Core.AnnotationManager.html#.AnnotationChangedInfoObject).
 */

/**
 * Triggered when number of unposted annotations are changed.
 * Returns map of annotations with pending text edits.
 * @name UI#unpostedAnnotationsChanged
 * @event
 * @type {object}
 * @property {object} pendingEditTextMap Map of pending edit texts
 * @property {number} unpostedAnnotationsCount Number of unposted annotations
 */

/**
 * Triggered when annotation filter in the notes panel has changed.
 * Returns empty arrays if the filter is cleared.
 * @name UI#annotationFilterChanged
 * @event
 * @type {object}
 * @property {string[]} types Types filter
 * @property {string[]} authors Author filter
 * @property {string[]} colors Color filter
 * @property {string[]} shareTypes Status filter
 */

/**
* Triggered when a new document has been loaded.
* @name UI#documentLoaded
* @event
*/

/**
* Triggered when a new document has been merged into the thumbnails panel.
* @name UI#documentMerged
* @event
* @type {object}
* @property {string} filename File name
* @property {number[]} pages Page numbers
*/

/**
* Triggered when the file has finished downloading.
* @name UI#fileDownloaded
* @event
*/

/**
* Triggered when there is an error loading the document.
* @name UI#loaderror
* @event
* @param {object} err The error
*/

/**
* Triggered when dragging Outline item.
* @name UI#dragOutline
* @event
*/

/**
* Triggered when dropping Outline item.
* @name UI#dropOutline
* @event
*/

/**
* Triggered when the panels are resized.
* @name UI#panelResized
* @event
* @type {object}
* @property {string} element DataElement name
* @property {number} width New panel width
*/

/**
* Triggered when the UI theme has changed.
* @name UI#themeChanged
* @event
* @param {string} theme The new UI theme
*/

/**
* Triggered when the toolbar group has changed.
* @name UI#toolbarGroupChanged
* @event
* @param {string} toolbarGroup The new toolbar group
*/

/**
* Triggered when the selected thumbnail changed.
* @name UI#selectedThumbnailChanged
* @event
* @param {array} selectedThumbnailPageIndexes The array of indexes of currently selected thumbnails
*/

/**
* Triggered when thumbnail(s) are dragged in the thumbnail panel
* @name UI#thumbnailDragged
* @event
*/

/**
* Triggered when dragged thumbnail(s) are dropped to a new location in the thumbnail panel
* @name UI#thumbnailDropped
* @event
* @type {object}
* @property {Array<number>} pageNumbersBeforeMove The array of page numbers to be moved
* @property {Array<number>} pageNumbersAfterMove The array of page numbers of where thumbnails being dropped
* @property {number} numberOfPagesMoved Number of page(s) being moved
*/

/**
* Triggered when user bookmarks have changed.
* @name UI#userBookmarksChanged
* @event
* @param {object} bookmarks The new bookmarks
*/

/**
* Triggered when outline bookmarks have changed.
* @name UI#outlineBookmarksChanged
* @event
* @param {object} bookmarkData
* @param {object} bookmarkData.bookmark The changed bookmark
* @param {string} bookmarkData.bookmark.id Changed outline bookmark id
* @param {string} bookmarkData.bookmark.name Changed outline bookmark name
* @param {string} bookmarkData.path Changed outline path in the outline tree
* @param {string} bookmarkData.action The action that triggered the outline bookmarks change
*/

/**
* Triggered when the viewer has loaded.
* @name UI#viewerLoaded
* @event
*/

/**
* Triggered when the visibility of an element has changed.
* @name UI#visibilityChanged
* @event
* @type {object}
* @property {object} detail
* @property {string} detail.element DataElement name
* @property {boolean} detail.isVisible The new visibility
*/

/**
* Triggered when fullscreen mode is toggled.
* @name UI#fullscreenModeToggled
* @event
* @type {object}
* @property {boolean} isInFullscreen Whether in fullscreen mode or not.
*/

/**
* Triggered before the UI switches tabs
* @name UI#beforeTabChanged
* @event
* @type {object}
* @property {object} currentTab An object containing the properties for the currently active tab (null if no currently active tab)
* @property {number} currentTab.id The id of the tab being switched to
* @property {string} currentTab.src Source of current tab
* @property {string} currentTab.options Tab load options
* @property {boolean} currentTab.annotationsChanged True if the annotations have been changed since loading the tab
* @property {object} nextTab An object containing the properties for the tab being switched to
* @property {number} nextTab.id The id of the tab being switched to
* @property {string} nextTab.src Source of current tab
* @property {string} nextTab.options Tab load options
*/

/**
* Triggered when a Tab is deleted
* @name UI#tabDeleted
* @event
* @type {object}
* @property {number} id The id of the tab being deleted
* @property {string} src Source of current tab
* @property {string} options Tab load options
*/

/**
* Triggered when a Tab is added
* @name UI#tabAdded
* @event
* @type {object}
* @property {number} id The id of the tab being added
* @property {string} src Source of current tab
* @property {string} options Tab load options
*/

/**
* Triggered when a Tab is moved
* @name UI#tabMoved
* @event
* @type {object}
* @property {number} id The id of the tab being moved
* @property {string} src Source of moved tab
* @property {string} options Tab load options
* @property {number} prevIndex Previous index of tab
* @property {number} newIndex New index of tab
*/

/**
* Triggered when the language changes in WebViewer via [setLanguage]{@link UI#setLanguage UI.setLanguage}
* @name UI#languageChanged
* @event
* @type {object}
* @property {string} prev The previous language
* @property {string} next The new language that was just set
*/

/**
* Triggered when MultiViewerMode is enabled and ready to be interacted with
* @name UI#multiViewerReady
* @event
*/

/** Triggered when the compare annotations are loaded
* @name UI#compareAnnotationsLoaded
* @event
*/

/** Triggered when the Multi-Tab is ready and TabManager can be interacted with
* @name UI#onTabManagerReady
* @event
*/

/** Triggered when a Modular UI JSON configuration is imported
 * @name UI#modularUIImported
 * @event
 * @property {object} importedComponents The JSON object containing the imported components
 */

/** Triggered when a tooltip is opened
 * @name UI#tooltipOpened
 * @event
 */
