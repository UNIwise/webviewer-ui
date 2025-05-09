import React from 'react';
import { legacy_createStore as createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import OutlineContent from './OutlineContent';
import OutlineContext from '../Outline/Context';
import { menuItems } from '../MoreOptionsContextMenuFlyout/MoreOptionsContextMenuFlyout';
import '../LeftPanel/LeftPanel.scss';

const NOOP = () => { };

export default {
  title: 'Components/OutlineContent',
  component: OutlineContent,
  parameters: {
    customizableUI: true,
  }
};

const reducer = () => {
  return {
    viewer: {
      disabledElements: {},
      customElementOverrides: {},
      isOutlineEditingEnabled: true,
      flyoutMap: {
        'bookmarkOutlineFlyout-': {
          dataElement: 'bookmarkOutlineFlyout-',
          items: menuItems,
        }
      },
      activeFlyout: 'bookmarkOutlineFlyout-',
      openElements: {
        'bookmarkOutlineFlyout-': true,
      }
    },
    document: {
      outlines: {},
    },
    featureFlags: {
      customizableUI: true,
    },
  };
};

export const Basic = () => {
  return (
    <ReduxProvider store={createStore(reducer)}>
      <div className='Panel LeftPanel' style={{ width: '330px', minWidth: '330px' }}>
        <div className='left-panel-container' style={{ minWidth: '330px' }}>
          <div className='bookmark-outline-single-container default'>
            <OutlineContext.Provider
              value={{
                setEditingOutlines: NOOP,
                editingOutlines: {},
                isMultiSelectMode: false,
                isOutlineEditable: true,
                addNewOutline: NOOP,
                renameOutline: NOOP,
                removeOutlines: NOOP,
              }}
            >
              <OutlineContent
                outlinePath='0'
                text='A test outline'
                // isAdding={true}
                setIsHovered={NOOP}
                isOutlineChangingDest={true}
                onCancel={NOOP}
              />
            </OutlineContext.Provider>
          </div>
        </div>
      </div>
    </ReduxProvider>
  );
};

export const Adding = () => {
  return (
    <ReduxProvider store={createStore(reducer)}>
      <div className='Panel LeftPanel' style={{ width: '330px', minWidth: '330px' }}>
        <div className='left-panel-container' style={{ minWidth: '330px' }}>
          <div className='bookmark-outline-single-container editing'>
            <OutlineContext.Provider
              value={{
                currentDestPage: 1,
                currentDestText: 'Full Page',
                setEditingOutlines: NOOP,
                editingOutlines: {},
                isMultiSelectMode: false,
                isOutlineEditable: true,
                addNewOutline: NOOP,
                renameOutline: NOOP,
                removeOutlines: NOOP,
              }}
            >
              <OutlineContent
                outlinePath='0'
                text=''
                isAdding={true}
                setIsHovered={NOOP}
                isOutlineRenaming={false}
                onCancel={NOOP}
              />
            </OutlineContext.Provider>
          </div>
        </div>
      </div>
    </ReduxProvider>
  );
};

export const Renaming = () => {
  return (
    <ReduxProvider store={createStore(reducer)}>
      <div className='Panel LeftPanel' style={{ width: '330px', minWidth: '330px' }}>
        <div className='left-panel-container' style={{ minWidth: '330px' }}>
          <div className='bookmark-outline-single-container editing'>
            <OutlineContext.Provider
              value={{
                setEditingOutlines: NOOP,
                editingOutlines: {},
                isMultiSelectMode: false,
                isOutlineEditable: true,
                addNewOutline: NOOP,
                renameOutline: NOOP,
                removeOutlines: NOOP,
              }}
            >
              <OutlineContent
                outlinePath='0'
                text='A test outline'
                setIsHovered={NOOP}
                isOutlineRenaming={true}
                onCancel={NOOP}
              />
            </OutlineContext.Provider>
          </div>
        </div>
      </div>
    </ReduxProvider>
  );
};

export const ChangingDestination = () => {
  return (
    <ReduxProvider store={createStore(reducer)}>
      <div className='Panel LeftPanel' style={{ width: '330px', minWidth: '330px' }}>
        <div className='left-panel-container' style={{ minWidth: '330px' }}>
          <div className='bookmark-outline-single-container editing'>
            <OutlineContext.Provider
              value={{
                setEditingOutlines: NOOP,
                editingOutlines: {},
                isMultiSelectMode: false,
                isOutlineEditable: true,
                addNewOutline: NOOP,
                renameOutline: NOOP,
                removeOutlines: NOOP,
                currentDestPage: 1,
                currentDestText: 'Area Selection',
              }}
            >
              <OutlineContent
                outlinePath='0'
                text='A test outline'
                setIsHovered={NOOP}
                isOutlineChangingDest={true}
                onCancel={NOOP}
              />
            </OutlineContext.Provider>
          </div>
        </div>
      </div>
    </ReduxProvider>
  );
};

export const ColoredOutline = () => {
  return (
    <ReduxProvider store={createStore(reducer)}>
      <div className='Panel LeftPanel' style={{ width: '330px', minWidth: '330px' }}>
        <div className='left-panel-container' style={{ minWidth: '330px' }}>
          <div className='bookmark-outline-single-container default'>
            <OutlineContext.Provider
              value={{
                setEditingOutlines: NOOP,
                editingOutlines: {},
                isMultiSelectMode: false,
                isOutlineEditable: true,
                addNewOutline: NOOP,
                renameOutline: NOOP,
                removeOutlines: NOOP,
              }}
            >
              <OutlineContent
                outlinePath='0'
                text='A colored outline'
                setIsHovered={NOOP}
                textColor="rgb(213, 42, 42)"
                isOutlineChangingDest={true}
                onCancel={NOOP}
              />
            </OutlineContext.Provider>
          </div>
        </div>
      </div>
    </ReduxProvider>
  );
};