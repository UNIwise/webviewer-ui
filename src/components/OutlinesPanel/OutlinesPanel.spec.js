import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editable } from './OutlinesPanel.stories';
import outlineUtils from '../../helpers/OutlineUtils';

const BasicOutlinesPanel = withProviders(Editable);

const NOOP = () => { };

jest.mock('core', () => ({
  getTool: (toolName) => ({
    clearOutlineDestination: NOOP,
  }),
  setToolMode: NOOP,
  goToOutline: NOOP,
  addEventListener: NOOP,
  removeEventListener: NOOP,
  getOutlines: NOOP,
  getDocumentViewer: () => ({
    getDocument: () => ({
      getViewerCoordinates: () => ({ x: 0, y: 0 }),
      getPageRotation: () => 0,
    }),
  }),
}));

describe('OutlinesPanel', () => {
  it('Story should not throw any errors', () => {
    expect(() => {
      render(<BasicOutlinesPanel />);
    }).not.toThrow();
  });

  it('Clicks on one outline should make it active and clicks on the panel empty area should deselect the selected outline', async () => {
    const { container } = render(<BasicOutlinesPanel />);

    const outlineElements = container.querySelectorAll('.outline-drag-container');
    const outlineSingle = outlineElements[0].querySelector('.bookmark-outline-single-container');

    expect(outlineSingle.className).toContain('default');

    // use userEvent since .bookmark-outline-single-container is not a button
    userEvent.click(outlineSingle);

    await waitFor(() => {
      // use waitFor since there's a 300ms delay before setting an outline as active
      expect(outlineSingle.className).toContain('default selected');
    });

    const outlinePanelEmptyArea = container.querySelector('.bookmark-outline-row');
    fireEvent.click(outlinePanelEmptyArea);
    const outlineSingleAfterClickingOutside = outlineElements[0].querySelector('.bookmark-outline-single-container');
    await waitFor(() => {
      expect(outlineSingleAfterClickingOutside.className).not.toContain('selected');
    });
  });

  it('Clicks the Add Outline button should show an input element and add an outline', async () => {
    const { container } = render(<BasicOutlinesPanel />);

    const addNewOutline = jest.spyOn(outlineUtils, 'addNewOutline');
    addNewOutline.mockImplementation(() => { });

    let textInput = container.querySelector('.bookmark-outline-input');
    expect(textInput).toBeNull();

    const addItemButton = container.querySelector('.add-new-button');
    expect(addItemButton.className).toContain('Button');
    fireEvent.click(addItemButton);

    textInput = container.querySelector('.bookmark-outline-input');
    expect(textInput).not.toBeNull();
    fireEvent.change(textInput, { target: { value: 'new outline' } });
    fireEvent.keyDown(textInput, { key: 'Enter', code: 'Enter' });

    expect(addNewOutline).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(addNewOutline).toHaveBeenCalledWith('new outline', null, 1, 0, 0, 0);
    });

    addNewOutline.mockRestore();
  });

  it('In multi-select mode, add button is enabled when no outline is selected and delete button is enabled when at least one outline is selected', async () => {
    const { container } = render(<BasicOutlinesPanel />);
    const multiSelectButton = container.querySelector('[data-element="outlineMultiSelect"]');
    expect(multiSelectButton.className).toContain('bookmark-outline-control-button');
    await multiSelectButton.click();

    const addNewContainer = container.querySelector('[data-element="addNewOutlineButtonContainer"]');
    const addNewButton = addNewContainer.firstChild;
    const deleteButton = addNewContainer.lastChild;
    expect(addNewButton).not.toBeDisabled();
    expect(deleteButton).toBeDisabled();

    const checkboxContainer = container.querySelector('.bookmark-outline-checkbox');
    const checkboxInput = checkboxContainer.querySelector('input[type="checkbox"]');
    await checkboxInput.click();
    expect(checkboxContainer.className).toContain('ui__choice--checked');
    expect(addNewButton).toBeDisabled();
    expect(deleteButton).not.toBeDisabled();
  });
});
