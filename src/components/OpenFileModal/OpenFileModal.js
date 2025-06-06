import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import TabManager from 'helpers/TabManager';
import classNames from 'classnames';
import getHashParameters from 'helpers/getHashParameters';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabPanel } from 'components/Tabs';
import FileInputPanel from 'components/PageReplacementModal/FileInputPanel';
import FilePickerPanel from 'components/PageReplacementModal/FilePickerPanel';
import selectors from 'selectors';
import actions from 'actions';
import DataElements from 'constants/dataElement';
import ModalWrapper from '../ModalWrapper';

import '../PageReplacementModal/PageReplacementModal.scss';
import './OpenFileModal.scss';

const OpenFileModal = ({ isDisabled, isOpen, tabManager, closeElements }) => {
  const { t } = useTranslation();
  const [selectedTab] = useSelector((state) => [
    selectors.getSelectedTab(state, 'openFileModal'),
  ]);
  const [src, setSrc] = useState('');
  const [extension, setExtension] = useState('pdf');
  const [filename, setFilename] = useState();
  const [size, setSize] = useState();
  const [error, setError] = useState({ 'fileError': '', 'urlError': '', 'extensionError': '' });

  const closeModal = () => {
    closeElements([DataElements.OPEN_FILE_MODAL]);
    setSrc('');
    setError({ 'fileError': '', 'urlError': '' });
    setFilename(null);
    setExtension('pdf');
    setSize(null);
  };

  useEffect(() => {
    if (isOpen) {
      closeElements([
        DataElements.PRINT_MODAL,
        DataElements.LOADING_MODAL,
        DataElements.PROGRESS_MODAL,
        DataElements.ERROR_MODAL,
        DataElements.MODEL3D_MODAL,
      ]);
    } else {
      setSrc('');
      setError({ 'fileError': '', 'urlError': '' });
      setFilename(null);
      setExtension(null);
      setSize(null);
    }
  }, [isOpen]);

  const handleAddTab = async (source, _extension, _filename, _size) => {
    if (!source) {
      return setError({ 'urlError': 'URL or File must be provided' });
    }
    if (!_extension || acceptFormats.indexOf(_extension) === -1) {
      return setError({ 'extensionError': 'Extension must be provided' });
    }
    const useDb = !_size || TabManager.MAX_FILE_SIZE > _size;
    await tabManager.addTab(source, {
      extension: _extension,
      filename: _filename,
      setActive: true,
      saveCurrentActiveTabState: true,
      useDB: useDb
    });
    closeModal();
  };

  const modalClass = classNames({
    Modal: true,
    OpenFileModal: true,
    open: isOpen,
    closed: !isOpen,
  });

  const extensionRegExp = /(?:\.([^.?]+))?$/;

  const handleFileChange = async (file) => {
    setError(null);
    if (!file) {
      return;
    }
    if (file instanceof window.Core.Document) {
      await handleAddTab(file, file.type, file.filename);
    } else {
      const ext = window.Core.mimeTypeToExtension[file.type] || extensionRegExp.exec(file.name)[1] || null;
      const filename = file.name;
      const size = file.size;
      const src = URL.createObjectURL(file);
      setSrc(src);
      setFilename(filename);
      setExtension(ext);
      setSize(size);
      await handleAddTab(file, ext, filename, size);
    }
  };

  const handleURLChange = async (url) => {
    setError(null);
    setSrc(url.trim());
    const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
    setFilename(filename);
    setExtension(extensionRegExp.exec(filename)[1]);
    setSize(null);
  };

  const wvServer = !!getHashParameters('webviewerServerURL', null);
  let acceptFormats = wvServer ? window.Core.SupportedFileFormats.SERVER : window.Core.SupportedFileFormats.CLIENT;
  acceptFormats = acceptFormats.reduce((uniqueArr, curr) => {
    if (uniqueArr.indexOf(curr) === -1) {
      uniqueArr.push(curr);
    }
    return uniqueArr;
  }, []);

  return !isDisabled && (
    <div className={modalClass} data-element={DataElements.OPEN_FILE_MODAL} onMouseDown={closeModal}>
      <div className="container" onMouseDown={(e) => e.stopPropagation()}>
        <ModalWrapper
          title={t('OpenFile.newTab')}
          isOpen={isOpen}
          closeButtonDataElement={'openFileModalClose'}
          onCloseClick={closeModal}
          swipeToClose
          closeHandler={closeModal}
        >
          <div className="swipe-indicator" />
          <Tabs className="open-file-modal-tabs" id="openFileModal">
            <div className="tabs-header-container">
              <div className="tab-list">
                <Tab dataElement="urlInputPanelButton">
                  <button className="tab-options-button">
                    {t('link.url')}
                  </button>
                </Tab>
                <div className="tab-options-divider" />
                <Tab dataElement="filePickerPanelButton">
                  <button className="tab-options-button">
                    {t('option.pageReplacementModal.localFile')}
                  </button>
                </Tab>
              </div>
            </div>
            <TabPanel dataElement="urlInputPanel">
              <div className="panel-body">
                <FileInputPanel
                  onFileSelect={(url) => {
                    handleURLChange(url);
                  }}
                  acceptFormats={acceptFormats}
                  extension={(!src.length || !extension?.length) ? '' : extension}
                  setExtension={setExtension}
                  defaultValue={src}
                />
              </div>
            </TabPanel>
            <TabPanel dataElement="filePickerPanel">
              <div className="panel-body">
                <FilePickerPanel
                  onFileProcessed={(file) => handleFileChange(file)}
                />
              </div>
            </TabPanel>
          </Tabs>
          <div className="page-replacement-divider" />
          <div className="footer">
            {error?.urlError && <p className="error">* {error.urlError}</p>}
            {error?.fileError && <p className="error">* {error.fileError}</p>}
            {error?.extensionError && <p className="error">* {error.extensionError}</p>}
            <Button
              className="modal-btn"
              dataElement="linkSubmitButton"
              label={t('OpenFile.addTab')}
              style={{ width: 90 }}
              onClick={() => handleAddTab(src, extension, filename, size)}
              disabled={selectedTab !== 'urlInputPanelButton' || (!src.length || !extension?.length)}
            />
          </div>
        </ModalWrapper>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, DataElements.OPEN_FILE_MODAL),
  isOpen: selectors.isElementOpen(state, DataElements.OPEN_FILE_MODAL),
  tabManager: selectors.getTabManager(state),
});

const mapDispatchToProps = {
  closeElements: actions.closeElements,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OpenFileModal);
