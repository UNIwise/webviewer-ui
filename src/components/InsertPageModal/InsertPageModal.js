import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import { useTranslation } from 'react-i18next';
import DataElements from 'constants/dataElement';
import { Tabs, Tab, TabPanel } from 'components/Tabs';
import Button from 'components/Button';
import { getInstanceNode } from 'helpers/getRootNode';
import ModalWrapper from 'components/ModalWrapper';

import core from 'core';

import { insertAbove, insertBelow, exitPageInsertionWarning } from '../../helpers/pageManipulationFunctions';
import InsertBlankPagePanel from './InsertBlankPagePanel';
import InsertUploadedPagePanel from './InsertUploadedPagePanel';

import FilePickerPanel from '../PageReplacementModal/FilePickerPanel';

import './InsertPageModal.scss';

const options = { loadAsPDF: true, l: window.sampleL /* license key here */ };

const InsertPageModal = ({ loadedDocumentPageCount }) => {
  const [selectedPageIndexes, currentPage, selectedTab] = useSelector((state) => [
    selectors.getSelectedThumbnailPageIndexes(state),
    selectors.getCurrentPage(state),
    selectors.getSelectedTab(state, DataElements.INSERT_PAGE_MODAL),
  ]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [insertNewPageBelow, setInsertNewPageBelow] = useState(false);
  const [insertNewPageIndexes, setInsertNewPageIndexes] = useState([]);
  const [numberOfBlankPagesToInsert, setNumberOfBlankPagesToInsert] = useState(1);
  const [insertPageHeight, setInsertPageHeight] = useState(0);
  const [insertPageWidth, setInsertPageWidth] = useState(0);
  const [pageNumberError, setPageNumberError] = useState('');

  useEffect(() => {
    const pageNumbers = selectedPageIndexes.length > 0 ? selectedPageIndexes.map((i) => i + 1) : [currentPage];
    setInsertNewPageIndexes(pageNumbers);
  }, [selectedPageIndexes]);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const closeModal = () => {
    dispatch(actions.closeElement(DataElements.INSERT_PAGE_MODAL));
  };

  const showCloseModalWarning = () => {
    exitPageInsertionWarning(closeModal, dispatch);
  };

  const apply = () => {
    if (insertNewPageBelow) {
      for (let i = 0; i < numberOfBlankPagesToInsert; ++i) {
        insertBelow(insertNewPageIndexes.map((page, index) => page + (index + 1) * i), insertPageWidth, insertPageHeight);
      }
    } else {
      for (let i = 0; i < numberOfBlankPagesToInsert; ++i) {
        insertAbove(insertNewPageIndexes.map((page, index) => page + (index + 1) * i), insertPageWidth, insertPageHeight);
      }
    }
    closeModal();
  };

  // File picker can merge docs, in which case the callback gets
  // executed with a Document not a file
  const fileProcessedHandler = async (file) => {
    let document;
    // eslint-disable-next-line no-undef
    if (file instanceof getInstanceNode().instance.Core.Document) {
      document = file;
    } else {
      try {
        document = await core.createDocument(file, options);
      } catch (e) {
        console.error('File type not supported');
      }
    }
    setSelectedDoc(document);
  };

  const clearDocument = () => {
    setSelectedDoc(null);
  };

  const renderFileSelectedPanel = () => {
    return (
      <InsertUploadedPagePanel
        sourceDocument={selectedDoc}
        closeModal={closeModal}
        clearLoadedFile={clearDocument}
        loadedDocumentPageCount={loadedDocumentPageCount}
        insertNewPageIndexes={insertNewPageIndexes}
      />
    );
  };

  const renderSelectionTabs = () => {
    const isUploadPagePanelActive = selectedTab === DataElements.INSERT_FROM_FILE_TAB;
    const insertBlankPageProps = {
      insertNewPageBelow,
      insertNewPageIndexes,
      numberOfBlankPagesToInsert,
      pageNumberError,
      setInsertNewPageBelow,
      setInsertNewPageIndexes,
      setNumberOfBlankPagesToInsert,
      setInsertPageHeight,
      setInsertPageWidth,
      setPageNumberError,
      loadedDocumentPageCount,
    };
    return (
      <div className="container tabs" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <Tabs className="insert-page-tabs" id={DataElements.INSERT_PAGE_MODAL}>
          <div className="tabs-header-container">
            <div className="tab-list">
              <Tab dataElement={DataElements.INSERT_BLANK_PAGE_TAB}>
                <button className="tab-options-button">{t('insertPageModal.tabs.blank')}</button>
              </Tab>
              <div className="tab-options-divider" />
              <Tab dataElement={DataElements.INSERT_FROM_FILE_TAB}>
                <button className="tab-options-button">{t('insertPageModal.tabs.upload')}</button>
              </Tab>
            </div>
          </div>
          <TabPanel dataElement={DataElements.INSERT_BLANK_PAGE_PANEL}>
            <InsertBlankPagePanel {...insertBlankPageProps} />
          </TabPanel>
          <TabPanel dataElement={DataElements.INSERT_FROM_FILE_PANEL}>
            <div className='panel-body'>
              <FilePickerPanel
                onFileProcessed={fileProcessedHandler} />
            </div>
          </TabPanel>
        </Tabs>
        <div className="divider"></div>
        <div className="footer">
          <Button
            className="insertPageModalConfirmButton"
            label="insertPageModal.button"
            onClick={apply}
            disabled={insertPageWidth <= 0 || insertPageHeight <= 0 || isUploadPagePanelActive || insertNewPageIndexes.length === 0 || pageNumberError} />
        </div>
      </div>
    );
  };

  return (
    <div className="Modal open InsertPageModal" data-element={DataElements.INSERT_PAGE_MODAL} onMouseDown={selectedDoc ? showCloseModalWarning : closeModal}>
      <ModalWrapper
        title={selectedDoc ? null : t('insertPageModal.title')}
        isOpen={true}
        closeHandler={closeModal}
        onCloseClick={closeModal}
        swipeToClose
      >
        {selectedDoc ? renderFileSelectedPanel() : renderSelectionTabs()}
      </ModalWrapper>
    </div>
  );
};

export default InsertPageModal;
