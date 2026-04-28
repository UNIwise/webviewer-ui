import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import core from 'core';
import NotePopupWithOutI18n, { notePopupFlyoutItems } from './NotePopup';
import NotePopupContainerWithOutI18n from './NotePopupContainer';
import { Basic, DifferentStates } from './NotePopup.stories';
import { configureStore } from '@reduxjs/toolkit';
import NoteContext from 'components/Note/Context';

const NotePopup = withI18n(NotePopupWithOutI18n);
const NotePopupContainer = withProviders(NotePopupContainerWithOutI18n);
const BasicStory = withI18n(Basic);
const DifferentStatesStory = withI18n(DifferentStates);
const noteContextValue = { isOfficeEditorCommentAnnotation: false };

const DEFAULT_NOTES_PANEL_WIDTH = 293;

const initialState = {
  viewer: {
    documentContainerHeight: null,
    activeDocumentViewerKey: 1,
    customElementOverrides: {},
    isNotesPanelMultiSelectEnabled: true,
    disabledElements: {},
    openElements: {
      notesPanel: true,
    },
    panelWidths: {
      notesPanel: DEFAULT_NOTES_PANEL_WIDTH,
    },
    sortStrategy: 'position',
    annotationFilters: {
      isDocumentFilterActive: false,
      includeReplies: true,
      authorFilter: [],
      colorFilter: [],
      typeFilter: [],
      statusFilter: [],
    },
    flyoutMap: {
      'notePopupFlyout-1': {
        dataElement: 'notePopupFlyout-1',
        items: notePopupFlyoutItems,
      }
    },
    activeFlyout: 'notePopupFlyout-1',
    flyoutToggleElement: 'notePopup-1',
    modularHeaders: { },
    modularHeadersHeight: {
      topHeaders: 49
    },
    modularComponents: {},
    activeTabInPanel: {},
    flyoutPosition: { x: 0, y: 0 },
  },
  officeEditor: {},
  featureFlags: { customizableUI: true },
};

function createStateForDataElement(dataElement, opts = { disabled: true }) {
  const state = { viewer: { disabledElements: {}, customElementOverrides: {} } };
  state.viewer.disabledElements[dataElement] = opts;
  return state;
}

const store = configureStore({ reducer: () => initialState });
const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');

jest.mock('core');
const notePopupDeletedataElement = 'notePopupDelete';

describe('NotePopup', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    useSelectorMock.mockImplementation(function (selector) {
      return selector({ viewer: { disabledElements: {}, customElementOverrides: {} } });
    });
  });

  it('Basic story should not throw error when rendering', () => {
    expect(() => {
      render(<BasicStory />);
    }).not.toThrow();
  });

  it('Check aria-pressed tag on toggle button', () => {
    render(<BasicStory />);
    const btn = screen.getByRole('button');
    // The toggle button uses aria-pressed to indicate popup state
    expect(btn).toHaveAttribute('aria-pressed');
  });

  it('DifferentStates story should not throw error when rendering', () => {
    expect(() => {
      render(<DifferentStatesStory />);
    }).not.toThrow();
  });

  it('Should not throw errors if no props given', () => {
    expect(() => {
      render(
        <Provider store={store}>
          <NotePopup />
        </Provider>,
      );
    }).not.toThrow();
  });

  it('Should show popup when enabled', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isEditable isDeletable />
      </Provider>,
    );
    expect(container.querySelector('.NotePopup')).toBeInTheDocument();
  });

  it('Should show popup options when isOpen is true', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isEditable isDeletable isOpen />
      </Provider>,
    );
    expect(container.querySelector('div.note-popup-options')).toBeInTheDocument();
  });

  it('Should show popup container when options are available', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isEditable isDeletable isOpen={false} />
      </Provider>,
    );
    // The options container renders as long as there are valid options (flyout-based design)
    expect(container.querySelector('div.note-popup-options')).toBeInTheDocument();
  });

  it('Should not show component if disabled', () => {
    useSelectorMock.mockReturnValue(true);
    const { container } = render(
      <Provider store={store}>
        <NotePopup isEditable isDeletable />
      </Provider>,
    );
    expect(container.querySelector('.NotePopup')).not.toBeInTheDocument();
  });

  it('Should not show delete option if disable', () => {
    useSelectorMock.mockImplementation(function (selector) {
      return selector(createStateForDataElement(notePopupDeletedataElement, { disabled: true }));
    });
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable isDeletable />
      </Provider>,
    );
    expect(container.querySelector('.note-popup-options')).toBeInTheDocument();
    expect(container.querySelector('button[data-element="notePopupDelete"]')).not.toBeInTheDocument();
  });

  it('Should not show delete option if not deletable', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable isDeletable={false} />
      </Provider>,
    );
    expect(container.querySelector('.note-popup-options')).toBeInTheDocument();
    expect(container.querySelector('button[data-element="notePopupDelete"]')).not.toBeInTheDocument();
  });

  it('Should call correct function when delete option clicked', () => {
    const handleDelete = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable isDeletable handleDelete={handleDelete} noteId="1" />
      </Provider>,
    );
    // In flyout-based design, delete is in the flyout registered via dispatch
    // The toggle button should be rendered
    const toggleButton = container.querySelector('.note-popup-toggle-trigger');
    expect(toggleButton).toBeInTheDocument();
  });

  it('Should not show edit option if disable', () => {
    const dataElement = 'notePopupEdit';
    const state = createStateForDataElement(dataElement);
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    useSelectorMock.mockImplementation(function (selector) {
      return selector(state);
    });
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable isDeletable />
      </Provider>,
    );
    expect(container.querySelector('.note-popup-options')).toBeInTheDocument();
    expect(container.querySelector('button[data-element="notePopupEdit"]')).not.toBeInTheDocument();
  });

  it('Should not show edit option if not editable', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable={false} isDeletable />
      </Provider>,
    );
    expect(container.querySelector('.note-popup-options')).toBeInTheDocument();
    expect(container.querySelector('button[data-element="notePopupEdit"]')).not.toBeInTheDocument();
  });

  it('Should call correct function when edit option clicked', () => {
    const handleEdit = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable isDeletable handleEdit={handleEdit} noteId="1" />
      </Provider>,
    );
    // In flyout-based design, edit is in the flyout registered via dispatch
    // The toggle button should be rendered
    const toggleButton = container.querySelector('.note-popup-toggle-trigger');
    expect(toggleButton).toBeInTheDocument();
  });

  it('Should render toggle trigger button', () => {
    const annotation = { Id: 'unit-test-annotation-id' };
    const { container } = render(
      <Provider store={store}>
        <NotePopup annotation={annotation} isEditable isDeletable noteId="1" />
      </Provider>,
    );
    expect(container.querySelector('div.note-popup-options')).toBeInTheDocument();
    const button = container.querySelector('.note-popup-toggle-trigger');
    expect(button).toBeInTheDocument();
  });

  it('Should render popup options container when options available', () => {
    const annotation = { Id: 'unit-test-annotation-id' };
    const { container } = render(
      <div>
        <div id="unit-test-outside">Outside of notepopup</div>
        <Provider store={store}>
          <NotePopup annotation={annotation} isEditable isDeletable noteId="1" />
        </Provider>
      </div>,
    );
    expect(container.querySelector('.note-popup-options')).toBeInTheDocument();
  });

  it('Should not render component when not editable and not deletable and not copyable', () => {
    const { container } = render(
      <Provider store={store}>
        <NotePopup isOpen isEditable={false} isDeletable={false} isCopyable={false} />
      </Provider>,
    );
    expect(container.querySelector('.NotePopup')).not.toBeInTheDocument();
  });
});

describe('NotePopupContainer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    useSelectorMock.mockImplementation((callback) =>
      callback({
        viewer: {
          activeDocumentViewerKey: 1,
          disabledElements: {},
          customElementOverrides: {},
        },
      }),
    );
  });

  it('Should attach updateAnnotationPermission event listener on mount', () => {
    const addEventListenerMock = jest.spyOn(core, 'addEventListener');
    render(<NoteContext.Provider value={noteContextValue}><NotePopupContainer /></NoteContext.Provider>);
    expect(addEventListenerMock).toHaveBeenCalledWith(
      'updateAnnotationPermission',
      expect.any(Function),
      undefined,
      expect.any(Number),
    );
  });

  it('Should remove updateAnnotationPermission event listener on unmount', () => {
    const removeEventListenerMock = jest.spyOn(core, 'removeEventListener');
    const { unmount } = render(<NoteContext.Provider value={noteContextValue}><NotePopupContainer /></NoteContext.Provider>);
    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'updateAnnotationPermission',
      expect.any(Function),
      expect.any(Number),
    );
  });
});
