import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { Virtuoso } from 'react-virtuoso';
import { RedactionPanelContext } from './RedactionPanelContext';
import { mapAnnotationToRedactionType } from 'constants/redactionTypes';
import Button from 'components/Button';

import './RedactionPanel.scss';
import RedactionPageGroup from '../RedactionPageGroup';

const RedactionPanel = (props) => {
  const { redactionAnnotations, applyAllRedactions, deleteAllRedactionAnnotations, redactionTypesDictionary } = props;

  const { t } = useTranslation();
  const [redactionPageMap, setRedactionPageMap] = useState({});
  const [redactionPageNumbers, setRedactionPageNumbers] = useState([]);
  // The following prop is needed only for the tests to actually render a list of results
  // it only is ever injected in the tests
  const { isTestMode } = useContext(RedactionPanelContext);

  useEffect(() => {
    const redactionPageMap = {};
    redactionAnnotations.forEach((annotation) => {
      const redactionType = mapAnnotationToRedactionType(annotation);
      const { label, icon } = redactionTypesDictionary[redactionType] || {
        icon: 'icon-tool-redaction-area',
        label: 'redactionPanel.redactionItem.regionRedaction',
      };
      annotation.label = label;
      annotation.icon = icon;
      annotation.redactionType = redactionType;

      const pageNumber = annotation.PageNumber;
      if (redactionPageMap[pageNumber] === undefined) {
        redactionPageMap[pageNumber] = [annotation];
      } else {
        redactionPageMap[pageNumber] = [annotation, ...redactionPageMap[pageNumber]];
      }
    });

    setRedactionPageMap(redactionPageMap);
    setRedactionPageNumbers(Object.keys(redactionPageMap));
  }, [redactionAnnotations]);

  const renderRedactionPageGroups = () => {
    // Needed for the tests to actually render a list of results
    // Not needed for the actual app; if we set it it kills performance when there are a lot of annotations
    const testModeProps = isTestMode
      ? { initialItemCount: redactionPageNumbers.length, key: redactionPageNumbers.length }
      : {};
    return (
      <div className="redaction-group-container">
        <Virtuoso
          data={redactionPageNumbers}
          itemContent={(index, pageNumber) => {
            return (
              <RedactionPageGroup key={index} pageNumber={pageNumber} redactionItems={redactionPageMap[pageNumber]} />
            );
          }}
          {...testModeProps}
        />
      </div>
    );
  };

  const noRedactionAnnotations = (
    <div className="no-marked-redactions">
      <div>
        <Icon className="empty-icon" glyph="icon-no-marked-redactions" />
      </div>
      <div className="msg">{t('redactionPanel.noMarkedRedactions')}</div>
    </div>
  );

  const redactAllButtonClassName = classNames('redact-all-marked', { disabled: redactionAnnotations.length === 0 });
  const clearAllButtonClassName = classNames('clear-all-marked', { disabled: redactionAnnotations.length === 0 });

  return (
    <>
      <div className="marked-redaction-counter">
        <span>{t('redactionPanel.redactionCounter')}</span> {`(${redactionAnnotations.length})`}
      </div>
      {redactionPageNumbers.length > 0 ? renderRedactionPageGroups() : noRedactionAnnotations}
      <div className="redaction-panel-controls">
        <Button
          disabled={redactionAnnotations.length === 0}
          className={clearAllButtonClassName}
          onClick={deleteAllRedactionAnnotations}
          label={t('redactionPanel.clearMarked')}
        >
          {t('redactionPanel.clearMarked')}
        </Button>
        <Button
          disabled={redactionAnnotations.length === 0}
          className={redactAllButtonClassName}
          onClick={applyAllRedactions}
          label={t('redactionPanel.redactAllMarked')}
        >
          {t('redactionPanel.redactAllMarked')}
        </Button>
      </div>
    </>
  );
};

export default RedactionPanel;
