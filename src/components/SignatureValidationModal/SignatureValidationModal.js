import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import selectors from 'selectors';
import DataElements from 'constants/dataElement';
import Button from 'components/Button';
import ModalWrapper from 'components/ModalWrapper';

import {
  renderPermissionStatus,
  Spinner,
} from 'components/SignaturePanel';
import SignatureIcon from 'components/SignaturePanel/SignatureIcon';

import actions from 'actions';

import './SignatureValidationModal.scss';

const SignatureValidationModal = () => {
  const [translate] = useTranslation();

  const [isOpen, verificationResult] = useSelector(
    (state) => {
      const { validationModalWidgetName } = state.digitalSignatureValidation;
      return [
        selectors.isElementOpen(state, DataElements.SIGNATURE_VALIDATION_MODAL),
        selectors.getVerificationResult(state, validationModalWidgetName),
      ];
    },
    shallowEqual,
  );

  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(actions.closeElements([DataElements.SIGNATURE_VALIDATION_MODAL]));
  };


  useEffect(() => {
    if (isOpen) {
      dispatch(
        actions.closeElements([
          DataElements.SIGNATURE_MODAL,
          DataElements.LOADING_MODAL,
          DataElements.PRINT_MODAL,
          DataElements.ERROR_MODAL,
          DataElements.PASSWORD_MODAL,
        ])
      );
    }
  }, [dispatch, isOpen]);

  /**
   * @todo Figure out if this useEffect is still needed? Component appears to be
   * operating normally without it.
   */
  /*
  useEffect(() => {
    const onDigitalSignatureAvailable = widget => {
      setWidgetName(widget.getField().name);
      dispatch(actions.openElements(['signatureValidationModal']));
    };

    core.addEventListener(
      'digitalSignatureAvailable',
      onDigitalSignatureAvailable,
    );
    return () => core.removeEventListener(
      'digitalSignatureAvailable',
      onDigitalSignatureAvailable,
    );
  }, [dispatch]);
  */

  const {
    badgeIcon,
    verificationStatus,
    permissionStatus,
    isCertification,
    documentPermission,
    trustVerificationResultString,
    timeOfTrustVerificationEnum,
    trustVerificationTime,
    digestAlgorithm,
    digestStatus,
    documentStatus,
    trustStatus,
    signerName,
  } = verificationResult;
  const {
    DigestAlgorithm,
    DigitalSignatureField,
    VerificationOptions,
    VerificationResult,
  } = window.Core.PDFNet;
  const {
    ModificationPermissionsStatus,
    TrustStatus,
    DigestStatus,
    DocumentStatus,
  } = VerificationResult;
  const { TimeMode } = VerificationOptions;

  const renderSignatureSummary = () => {
    let status;
    switch (badgeIcon) {
      case 'digital_signature_valid':
        status = translate('digitalSignatureModal.valid');
        break;
      case 'digital_signature_warning':
        status = translate('digitalSignatureModal.unknown');
        break;
      case 'digital_signature_error':
        status = translate('digitalSignatureModal.invalid');
        break;
      default:
        status = translate('digitalSignatureModal.unknown');
    }

    const type = isCertification
      ? translate('digitalSignatureModal.certification')
      : translate('digitalSignatureModal.signature');

    return (
      <div>
        <div className="summary-box">
          <SignatureIcon badge={badgeIcon} size="medium" />
          <div>
            {
              translate(
                'digitalSignatureModal.summaryBox.summary',
                {
                  type,
                  status,
                }
              )
            }
            {
              badgeIcon === 'digital_signature_valid'
                ? translate(
                  'digitalSignatureModal.summaryBox.signedBy',
                  {
                    name: signerName || translate('digitalSignatureModal.unknown'),
                    interpolation: { escapeValue: false }
                  },
                ) : ''
            }
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderTitle = () => {
    const typeCapitalized = isCertification
      ? translate('digitalSignatureModal.Certification')
      : translate('digitalSignatureModal.Signature');

    return translate('digitalSignatureModal.title', { type: typeCapitalized });
  };

  /**
   * Returns a message in a <p> tag corresponding to the enum value of
   * documentPermission, which originates from the invocation of
   * PDFNet.DigitalSignatureField.getDocumentPermissions
   */
  const renderDocumentPermission = () => {
    if (!documentPermission) {
      return;
    }

    let content = '';
    const editor = isCertification ? 'certifier' : 'signer';

    switch (documentPermission) {
      case DigitalSignatureField.DocumentPermissions.e_no_changes_allowed:
        content += translate('digitalSignatureModal.documentPermission.noChangesAllowed', { editor });
        break;
      case DigitalSignatureField.DocumentPermissions.e_formfilling_signing_allowed:
        content += translate('digitalSignatureModal.documentPermission.formfillingSigningAllowed', { editor });
        break;
      case DigitalSignatureField.DocumentPermissions.e_annotating_formfilling_signing_allowed:
        content += translate('digitalSignatureModal.documentPermission.annotatingFormfillingSigningAllowed', { editor });
        break;
      case DigitalSignatureField.DocumentPermissions.e_unrestricted:
        content += translate('digitalSignatureModal.documentPermission.unrestricted', { editor });
        break;
    }

    return <p>{content}</p>;
  };

  /**
   * Returns a message in a <p> tag corresponding to the signature's trust
   * verification result.
   *
   * If trustVerificationResultString is a falsy value (i.e. undefined, null or
   * empty string), originating from the invocation of
   * PDFNet.TrustVerificationResult.getResultString, then a message indicating
   * no trust verification result is rendered.
   *
   * If a trust verification result is available, then the based on
   * timeOfTrustVerificationEnum, which originates from the invocation of
   * PDFNet.TrustVerificationResult.getTimeOfTrustVerificationEnum, an
   * appropriate message is rendered
   */
  const renderTrustVerification = () => {
    if (!trustVerificationResultString) {
      return (
        <p>{translate('digitalSignatureModal.trustVerification.none')}</p>
      );
    }

    let content = '';
    switch (timeOfTrustVerificationEnum) {
      case (TimeMode.e_current):
        content += translate(
          'digitalSignatureModal.trustVerification.current',
          { trustVerificationTime }
        );
        break;
      case (TimeMode.e_signing):
        content += translate(
          'digitalSignatureModal.trustVerification.signing',
          { trustVerificationTime }
        );
        break;
      case (TimeMode.e_timestamp):
        content += translate(
          'digitalSignatureModal.trustVerification.timestamp',
          { trustVerificationTime }
        );
        break;
    }

    return <p>{content}</p>;
  };

  /**
   * Returns a message in a <p> tag corresponding to the signature's digest
   * algorithm, which originates from the invocation of
   * PDFNet.verificationResult.getDigestAlgorithm
   */
  const renderDigestAlgorithm = () => {
    let content = translate('digitalSignatureModal.digestAlgorithm.preamble');

    switch (digestAlgorithm) {
      case DigestAlgorithm.Type.e_SHA1:
        content += 'SHA1.';
        break;
      case DigestAlgorithm.Type.e_SHA256:
        content += 'SHA256.';
        break;
      case DigestAlgorithm.Type.e_SHA384:
        content += 'SHA384.';
        break;
      case DigestAlgorithm.Type.e_SHA512:
        content += 'SHA512.';
        break;
      case DigestAlgorithm.Type.e_RIPEMD160:
        content += 'RIPEMD160.';
        break;
      case DigestAlgorithm.Type.e_unknown_digest_algorithm:
        content = translate('digitalSignatureModal.digestAlgorithm.unknown');
        break;
    }

    return <p>{content}</p>;
  };

  /**
   * Returns a message in a <p> tag corresponding to the boolean trust status of
   * the signature, which originates from evaluating whether or not the value of
   * PDFNet.verificationResult.getTrustStatus is set to the enum
   * PDFNet.verificationResult.trustStatus.e_trust_verified
   *
   * Intentionally an un-used function, as @rdjericpdftron has noted that it
   * is superfluous, but the method has been left behind in-case it could be
   * leveraged in the future
   */
  /*
  const renderSignerIdentityValidity = () => {
    let content = translate('digitalSignatureModal.signerIdentity.preamble');
    if (validSignerIdentity) {
      content += translate('digitalSignatureModal.signerIdentity.valid');
    } else {
      content += translate('digitalSignatureModal.signerIdentity.unknown');
    }
    return <p>{content}</p>;
  };
  */

  const renderDocumentStatus = () => {
    let content;

    switch (documentStatus) {
      case DocumentStatus.e_no_error:
        content = translate(
          'digitalSignatureVerification.documentStatus.noError'
        );
        break;
      case DocumentStatus.e_corrupt_file:
        content = translate(
          'digitalSignatureVerification.documentStatus.corruptFile'
        );
        break;
      case DocumentStatus.e_unsigned:
        content = translate(
          'digitalSignatureVerification.documentStatus.unsigned'
        );
        break;
      case DocumentStatus.e_bad_byteranges:
        content = translate(
          'digitalSignatureVerification.documentStatus.badByteRanges'
        );
        break;
      case DocumentStatus.e_corrupt_cryptographic_contents:
        content = translate(
          'digitalSignatureVerification.documentStatus.corruptCryptographicContents'
        );
        break;
    }

    return <p>{content}</p>;
  };

  const renderDigestStatus = () => {
    let content;

    switch (digestStatus) {
      case DigestStatus.e_digest_invalid:
        content = translate(
          'digitalSignatureVerification.digestStatus.digestInvalid'
        );
        break;
      case DigestStatus.e_digest_verified:
        content = translate(
          'digitalSignatureVerification.digestStatus.digestVerified'
        );
        break;
      case DigestStatus.e_digest_verification_disabled:
        content = translate(
          'digitalSignatureVerification.digestStatus.digestVerificationDisabled'
        );
        break;
      case DigestStatus.e_weak_digest_algorithm_but_digest_verifiable:
        content = translate(
          'digitalSignatureVerification.digestStatus.weakDigestAlgorithmButDigestVerifiable'
        );
        break;
      case DigestStatus.e_no_digest_status:
        content = translate(
          'digitalSignatureVerification.digestStatus.noDigestStatus'
        );
        break;
      case DigestStatus.e_unsupported_encoding:
        content = translate(
          'digitalSignatureVerification.digestStatus.unsupportedEncoding'
        );
        break;
    }

    return <p>{content}</p>;
  };

  const renderTrustStatus = () => {
    const verificationType = isCertification
      ? translate('digitalSignatureVerification.certifier')
      : translate('digitalSignatureVerification.signer');
    let content;

    switch (trustStatus) {
      case TrustStatus.e_trust_verified:
        content = translate(
          'digitalSignatureVerification.trustStatus.trustVerified',
          { verificationType },
        );
        break;
      case TrustStatus.e_untrusted:
        content = translate(
          'digitalSignatureVerification.trustStatus.untrusted'
        );
        break;
      case TrustStatus.e_trust_verification_disabled:
        content = translate(
          'digitalSignatureVerification.trustStatus.trustVerificationDisabled'
        );
        break;
      case TrustStatus.e_no_trust_status:
        content = translate(
          'digitalSignatureVerification.trustStatus.noTrustStatus'
        );
        break;
    }

    return <p>{content}</p>;
  };

  const renderDocumentIntegrityHeader = () => (
    <p
      className="header"
    >
      {translate('digitalSignatureModal.header.documentIntegrity')}
    </p>
  );

  const renderIdentitiesTrustHeader = () => (
    <p
      className="header"
    >
      {translate('digitalSignatureModal.header.identitiesTrust')}
    </p>
  );

  const renderGeneralErrorsHeader = () => (
    <p
      className="header"
    >
      {translate('digitalSignatureModal.header.generalErrors')}
    </p>
  );

  const renderDigestStatusHeader = () => (
    <p
      className="header"
    >
      {translate('digitalSignatureModal.header.digestStatus')}
    </p>
  );

  const renderModalBody = () => {
    if (typeof verificationStatus === 'undefined') {
      return (
        <div className="center">
          <Spinner />
        </div>
      );
    }
    return (
      <>
        <div className="body">
          <div className="section">
            {renderDocumentIntegrityHeader()}
            {
              renderPermissionStatus({
                isCertification,
                ModificationPermissionsStatus,
                permissionStatus,
                translate,
              })
            }
            {renderDocumentPermission()}
          </div>
          <div className="section">
            {renderIdentitiesTrustHeader()}
            {renderTrustStatus()}
            {renderTrustVerification()}
          </div>
          <div className="section">
            {renderGeneralErrorsHeader()}
            {renderDocumentStatus()}
          </div>
          <div className="section">
            {renderDigestStatusHeader()}
            {renderDigestStatus()}
            {renderDigestAlgorithm()}
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="close-modal-button"
            onClick={closeModal}
            label={translate('action.close')}
          />
        </div>
      </>
    );
  };

  return (
    <div
      className={classNames({
        Modal: true,
        SignatureValidationModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element={DataElements.SIGNATURE_VALIDATION_MODAL}
    >
      <ModalWrapper
        title={renderHeaderTitle()}
        closeHandler={closeModal}
        onCloseClick={closeModal}
        isOpen={isOpen}
        swipeToClose
      >
        <div className="container">
          {renderSignatureSummary()}
          {renderModalBody()}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default SignatureValidationModal;
