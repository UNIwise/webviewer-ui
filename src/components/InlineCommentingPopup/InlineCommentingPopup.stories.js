import React from 'react';
import InlineCommentingPopup from './InlineCommentingPopup';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BASIC_PALETTE } from 'constants/commonColors';

const noop = () => { };

export default {
  title: 'Components/InlineCommentPopup',
  component: InlineCommentingPopup,
  includeStories: ['Basic', 'Mobile'],
  parameters: {
    customizableUI: true
  }
};

export const initialState = {
  viewer: {
    disabledElements: {},
    customElementOverrides: {},
    openElements: { inlineCommentPopup: true },
    customPanels: [],
    unreadAnnotationIdSet: new Set(),
    colorMap: [{ colorMapKey: () => BASIC_PALETTE[0] }],
    flyoutMap: {},
    focusedElementsStack: [],
  },
  officeEditor: {},
  featureFlags: {
    customizableUI: true,
  }
};

export const context = {
  searchInput: '',
  resize: noop,
  isSelected: true,
  setCurAnnotId: noop,
  onTopNoteContentClicked: noop,
  pendingEditTextMap: {},
  pendingReplyMap: {},
  pendingAttachmentMap: {}
};


const mockAnnotation = {
  Author: 'Mikel Landa',
  isFormFieldPlaceholder: () => false,
  getReplies: () => [],
  getStatus: () => '',
  isReply: () => false,
  getAssociatedNumber: () => 1,
  getContents: noop,
  getCustomData: () => '',
  getAttachments: noop,
  getRichTextStyle: noop,
};

export const basicProps = {
  isOpen: true,
  isNotesPanelOpen: false,
  commentingAnnotation: mockAnnotation,
  position: { top: 0, left: 0 },
  contextValue: context,
};

export const Basic = () => {
  return (
    <Provider store={configureStore({ reducer: () => initialState })}>
      <InlineCommentingPopup {...basicProps} />
    </Provider>
  );
};

export const mobileProps = {
  ...basicProps,
  isMobile: true,
};

export const Mobile = () => {
  return (
    <Provider store={configureStore({ reducer: () => initialState })}>
      <InlineCommentingPopup {...mobileProps} />
    </Provider>
  );
};

Mobile.parameters = {
  viewport: {
    defaultViewport: 'Mobile',
  },
};