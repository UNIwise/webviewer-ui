import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ShareTypes, { ShareTypeColors } from 'constants/shareTypes';
import { getAnnotationShareType } from 'helpers/annotationShareType';
import core from 'core';
import actions from 'actions';
import selectors from 'selectors';
import fireEvent from 'helpers/fireEvent';
import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';
import defaultTool from 'constants/defaultTool';
import Events from 'constants/events';
import { mapAnnotationToKey } from 'constants/map';
import DataElements from 'constants/dataElement';
import { rgbaToHex, hexToRgba } from 'helpers/color';
import { getAnnotationClass } from 'helpers/getAnnotationClass';
import Choice from 'components/Choice';
import Button from 'components/Button';
import { Tabs, Tab, TabPanel } from 'components/Tabs';

import './FilterAnnotModal.scss';

const TABS_ID = 'filterAnnotModal';

const FilterAnnotModal = ({ coAssessors }) => {
  const [isDisabled, isOpen, colorMap, selectedTab, annotationFilters] = useSelector((state) => [
    selectors.isElementDisabled(state, DataElements.FILTER_MODAL),
    selectors.isElementOpen(state, DataElements.FILTER_MODAL),
    selectors.getColorMap(state),
    selectors.getSelectedTab(state, TABS_ID),
    selectors.getAnnotationFilters(state)
  ]);
  const [t] = useTranslation();
  const dispatch = useDispatch();

  // Fields to be rendered
  const [authors, setAuthors] = useState([]);
  const [annotTypes, setAnnotTypes] = useState([]);
  const [colors, setColorTypes] = useState([]);
  const [shareTypes, setShareTypes] = useState([]);

  const [authorFilter, setAuthorFilter] = useState([]);
  const [typesFilter, setTypesFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [checkRepliesForAuthorFilter, setCheckRepliesForAuthorFilter] = useState(true);
  const [filterCount, setFilterCount] = useState(0);
  const [ifShowAnnotationStatus, setIfShowAnnotationStatus] = useState(false);
  // CUSTOM WISEFLOW: sharetype filter
  const [shareTypeFilter, setShareTypeFilter] = useState([]);
  const [coAssessorFilter, setCoAssessorFilter] = useState([]);

  const getIconColor = annot => {
    const key = mapAnnotationToKey(annot);
    const iconColorProperty = colorMap[key]?.iconColor;

    return annot[iconColorProperty];
  };

  const similarColorExist = (currColors, newColor) => {
    const colorObject = currColors.map((c) => Object.assign({
      R: parseInt(`${c[1]}${c[2]}`, 16),
      G: parseInt(`${c[3]}${c[4]}`, 16),
      B: parseInt(`${c[5]}${c[6]}`, 16)
    }));

    const threshold = 10;
    const similarColors = colorObject
      .filter((c) => Math.abs(newColor.R - c.R) < threshold
        && Math.abs(newColor.G - c.G) < threshold
        && Math.abs(newColor.B - c.B) < threshold);

    return !!similarColors.length;
  };

  const filterApply = () => {
    dispatch(
      actions.setCustomNoteFilter((annot) => {
        let type = true;
        let author = true;
        let color = true;
        let sharetype = true;
        if (typesFilter.length > 0) {
          type = typesFilter.includes(getAnnotationClass(annot));
        }
        if (authorFilter.length > 0) {
          author = authorFilter.includes(core.getDisplayAuthor(annot['Author']));
          if (!author && checkRepliesForAuthorFilter) {
            const allReplies = annot.getReplies();
            for (const reply of allReplies) {
              // Short-circuit the search if at least one reply is created by
              // one of the desired authors
              if (authorFilter.includes(core.getDisplayAuthor(reply['Author']))) {
                author = true;
                break;
              }
            }
          }
        }
        if (colorFilter.length > 0) {
          const iconColor = getIconColor(annot);
          if (iconColor) {
            color = similarColorExist(colorFilter, iconColor);
          } else {
            // check for default color if no color is available
            color = colorFilter.includes('#485056');
          }
        }
        if (shareTypeFilter.length > 0) {
          // CUSTOM WISEFLOW: get customData sharetype
          if (getAnnotationShareType(annot)) {
            sharetype = shareTypeFilter.includes(getAnnotationShareType(annot));
          }
        }
        return type && author && color && sharetype;
      }),
    );
    dispatch(actions.setAnnotationFilters({
      includeReplies: checkRepliesForAuthorFilter,
      authorFilter,
      colorFilter,
      typeFilter: typesFilter,
      shareTypes: shareTypeFilter,
    }));
    fireEvent(
      Events.ANNOTATION_FILTER_CHANGED,
      {
        types: typesFilter,
        authors: authorFilter,
        colors: colorFilter,
        shareTypes: shareTypeFilter,
        checkRepliesForAuthorFilter
      }
    );
    closeModal();
  };

  const filterClear = () => {
    setCheckRepliesForAuthorFilter(false);
    setAuthorFilter([]);
    setTypesFilter([]);
    setColorFilter([]);
    setShareTypeFilter([]);
  };

  const closeModal = () => {
    dispatch(actions.closeElement(DataElements.FILTER_MODAL));
    core.setToolMode(defaultTool);
  };

  useEffect(() => {
    const annots = core.getAnnotationsList();
    // set is a great way to remove any duplicate additions and ensure the unique items are present
    // the only gotcha that it should not be used by state since not always it will trigger a rerender
    const authorsToBeAdded = new Set();
    const annotTypesToBeAdded = new Set();
    const annotColorsToBeAdded = new Set();
    const annotShareTypesToBeAdded = new Set();
    annots.forEach((annot) => {
      const displayAuthor = core.getDisplayAuthor(annot['Author']);
      if (displayAuthor && displayAuthor !== '') {
        authorsToBeAdded.add(displayAuthor);
      }
      // We don't show it in the filter for WidgetAnnotation or StickyAnnotation or LinkAnnotation from the comments
      if (
        annot instanceof window.Core.Annotations.WidgetAnnotation ||
        (annot instanceof window.Core.Annotations.StickyAnnotation && annot.isReply()) ||
        annot instanceof window.Core.Annotations.Link
      ) {
        return;
      }
      annotTypesToBeAdded.add(getAnnotationClass(annot));
      const iconColor = getIconColor(annot);
      if (iconColor && !similarColorExist([...annotColorsToBeAdded], iconColor)) {
        annotColorsToBeAdded.add(rgbaToHex(iconColor.R, iconColor.G, iconColor.B, iconColor.A));
      }

      if (getAnnotationShareType(annot)) {
        annotShareTypesToBeAdded.add(getAnnotationShareType(annot));
      }
    });

    setAuthors([...authorsToBeAdded]);
    setAnnotTypes([...annotTypesToBeAdded]);
    setColorTypes([...annotColorsToBeAdded]);
    setShareTypes([...annotShareTypesToBeAdded]);

    core.addEventListener('documentUnloaded', closeModal);
    return () => {
      core.removeEventListener('documentUnloaded', closeModal);
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedTab === DataElements.ANNOTATION_STATUS_FILTER_PANEL_BUTTON && !ifShowAnnotationStatus) {
      dispatch(actions.setSelectedTab(TABS_ID, DataElements.ANNOTATION_USER_FILTER_PANEL_BUTTON));
    }
  }, [isOpen, selectedTab, ifShowAnnotationStatus]);

  useEffect(() => {
    setFilterCount((checkRepliesForAuthorFilter ? 1 : 0) + authorFilter.length + colorFilter.length + typesFilter.length + statusFilter.length);
  }, [checkRepliesForAuthorFilter, authorFilter, colorFilter, typesFilter, statusFilter]);

  useEffect(() => {
    setIfShowAnnotationStatus((statuses.length > 1) || (statuses.length === 1 && statuses[0] !== 'None'));
  }, [statuses]);

  useEffect(() => {
    if (isOpen) {
      setCheckRepliesForAuthorFilter(annotationFilters.includeReplies);
      setAuthorFilter(annotationFilters.authorFilter);
      setColorFilter(annotationFilters.colorFilter);
      setTypesFilter(annotationFilters.typeFilter);
      setStatusFilter(annotationFilters.statusFilter);
    }
  }, [isOpen]);

  const renderAuthors = () => {
    return (
      <>
        {/* <div className="include-replies">
          <Choice
            isSwitch
            label={t('option.filterAnnotModal.includeReplies')}
            checked={checkRepliesForAuthorFilter}
            onChange={(e) => setCheckRepliesForAuthorFilter(e.target.checked)}
            id="filter-annot-modal-include-replies"
          />
        </div> */}
        <div className="user-filters three-column-filter">
          {[...authors].map((val, index) => {
            return (
              <Choice
                type="checkbox"
                key={index}
                label={val}
                checked={authorFilter.includes(val)}
                id={val}
                onChange={(e) => {
                  if (authorFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setAuthorFilter([...authorFilter, e.target.getAttribute('id')]);
                  } else {
                    setAuthorFilter(authorFilter.filter((author) => author !== e.target.getAttribute('id')));
                  }
                }}
              />
            );
          })}
        </div>
      </>
    );
  };

  const renderAnnotTypes = () => {
    return (
      <div className="type-filters three-column-filter">
        {[...annotTypes]
          .sort((type1, type2) => (t(`annotation.${type1}`) <= t(`annotation.${type2}`) ? -1 : 1))
          .map((val, index) => {
            return (
              <Choice
                type="checkbox"
                key={index}
                label={t(`annotation.${val}`)}
                checked={typesFilter.includes(val)}
                id={val}
                onChange={(e) => {
                  if (typesFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setTypesFilter([...typesFilter, e.target.getAttribute('id')]);
                  } else {
                    setTypesFilter(typesFilter.filter((type) => type !== e.target.getAttribute('id')));
                  }
                }}
              />
            );
          })}
      </div>
    );
  };

  const renderColorTypes = () => {
    return (
      <div className="color-filters">
        {[...colors].map((val, index) => {
          return (
            <div className="colorSelect" key={`color${index}`}>
              <Choice
                type="checkbox"
                checked={colorFilter.includes(val)}
                id={val}
                onChange={(e) => {
                  if (colorFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setColorFilter([...colorFilter, e.target.getAttribute('id')]);
                  } else {
                    setColorFilter(colorFilter.filter((color) => color !== e.target.getAttribute('id')));
                  }
                }}
              />
              <div
                className="colorCell"
                style={{
                  background: hexToRgba(val),
                }}
              ></div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderShareTypes = () => {
    return (
      <div className="status-filters three-column-filter">
        {shareTypes.map((val, index) => {
          return (
            <Choice
              type="checkbox"
              key={index}
              checked={shareTypeFilter.includes(val)}
              label={
                <div
                  style={{
                    backgroundColor: `${ShareTypeColors[val]}`,
                    padding: `5px 10px`,
                    borderRadius: `5px`,
                    color: `#fff`,
                  }}
                >
                  {t(`option.state.${val.toLocaleLowerCase()}`)}
                </div>
              }
              id={val}
              onChange={e => {
                if (shareTypeFilter.indexOf(e.target.getAttribute('id')) === -1) {
                  setShareTypeFilter([...shareTypeFilter, e.target.getAttribute('id')]);
                } else {
                  setShareTypeFilter(shareTypeFilter.filter(status => status !== e.target.getAttribute('id')));
                }
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderCoAssessors = () => {
    if (!coAssessors) return null;
    return (
      <div className="filter">
        <div className="heading">{t('option.filterAnnotModal.coAssessor')}</div>
        <div className="buttons">
          {[...coAssessors].map((val, index) => {
            return (
              <Choice
                type="checkbox"
                key={index}
                label={val.name}
                checked={coAssessorFilter.includes(val)}
                id={val.id}
                onChange={e => {
                  if (coAssessorFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setCoAssessorFilter([...coAssessorFilter, e.target.getAttribute('id')]);
                  } else {
                    setCoAssessorFilter(coAssessorFilter.filter(type => type !== e.target.getAttribute('id')));
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const modalClass = classNames({
    Modal: true,
    FilterAnnotModal: true,
    open: isOpen,
    closed: !isOpen,
  });

  return isDisabled ? null : (
    <div className={modalClass} data-element={DataElements.FILTER_MODAL} onMouseDown={closeModal}>
      <FocusTrap locked={isOpen} focusLastOnUnlock>
        <div className="container" onMouseDown={(e) => e.stopPropagation()}>
          {core.getAnnotationsList().length > 0 ? (
            <div className="filter-modal">
              <Swipeable onSwipedDown={closeModal} preventDefaultTouchmoveEvent>
                <div className="swipe-indicator" />
                <div className="header">
                  <div>{`${t('option.filterAnnotModal.filters')} (${filterCount})`}</div>
                  <Button
                    img="icon-close"
                    onClick={closeModal}
                    title="action.close"
                  />
                </div>
              </Swipeable>
              <div className="divider"></div>
              <div className="body">
                <Tabs id={TABS_ID}>
                  <div className="tab-list">
                    <Tab dataElement={DataElements.ANNOTATION_USER_FILTER_PANEL_BUTTON}>
                      <button className="tab-options-button">
                        {t('option.filterAnnotModal.user')}
                      </button>
                    </Tab>
                    <div className="tab-options-divider" />
                    <Tab dataElement={DataElements.ANNOTATION_SHARE_TYPE_FILTER_PANEL_BUTTON}>
                      <button className="tab-options-button">
                        {t('option.filterAnnotModal.shareType')}
                      </button>
                    </Tab>
                    <div className="tab-options-divider" />
                    <Tab dataElement={DataElements.ANNOTATION_COLOR_FILTER_PANEL_BUTTON}>
                      <button className="tab-options-button">
                        {t('option.filterAnnotModal.color')}
                      </button>
                    </Tab>
                    <div className="tab-options-divider" />
                    <Tab dataElement={DataElements.ANNOTATION_TYPE_FILTER_PANEL_BUTTON}>
                      <button className="tab-options-button">
                        {t('option.filterAnnotModal.type')}
                      </button>
                    </Tab>
                    <div className="tab-options-divider" />
                    <Tab dataElement={DataElements.ANNOTATION_CO_ASSESSOR_FILTER_PANEL_BUTTON}>
                      <button className="tab-options-button">
                        {t('option.filterAnnotModal.coAssessor')}
                      </button>
                    </Tab>
                  </div>
                  <div className="filter-options">
                    <TabPanel dataElement="annotationUserFilterPanel">
                      {renderAuthors()}
                    </TabPanel>
                    <TabPanel dataElement="annotationShareTypesFilterPanel">
                      {renderShareTypes()}
                    </TabPanel>
                    <TabPanel dataElement="annotationColorFilterPanel">
                      {renderColorTypes()}
                    </TabPanel>
                    <TabPanel dataElement="annotationTypeFilterPanel">
                      {renderAnnotTypes()}
                    </TabPanel>
                    <TabPanel dataElement="annotationCoAssessorFilterPanel">
                      {renderCoAssessors()}
                    </TabPanel>
                  </div>
                </Tabs>
              </div>
              <div className="divider"></div>
              <div className="footer">
                <Button className="filter-annot-cancel" onClick={closeModal} label={t('action.cancel')} />
                <Button className="filter-annot-clear" onClick={filterClear} label={t('action.clearAll')} disabled={filterCount === 0} />
                <Button className="filter-annot-apply" onClick={filterApply} label={t('action.apply')} />
              </div>
            </div>
          ) : (
            <div>
              <div className="swipe-indicator" />
              <div className="message">{t('message.noAnnotationsFilter')}</div>
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
};

export default FilterAnnotModal;
