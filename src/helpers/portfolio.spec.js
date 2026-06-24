import { findPDFNetPortfolioItem } from './portfolio';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

describe('portfolio', () => {
  describe('getPDFNetFiles', () => {
    let mockSdfDoc;
    let mockPdfDoc;
    let mockNameTree;
    let mockPDFNet;
    let mockCore;

    beforeEach(() => {
      mockSdfDoc = {};
      mockPdfDoc = {
        getSDFDoc: jest.fn().mockResolvedValue(mockSdfDoc),
      };
      mockNameTree = {
        isValid: jest.fn().mockResolvedValue(true),
        getIteratorBegin: jest.fn().mockResolvedValue({
          hasNext: jest.fn().mockResolvedValue(false),
        }),
      };
      mockPDFNet = {
        runWithCleanup: jest.fn((fn) => fn()),
        NameTree: {
          find: jest.fn().mockResolvedValue(mockNameTree),
        },
      };
      window.Core = {
        PDFNet: mockPDFNet,
      };
      mockCore = {
        isFullPDFEnabled: jest.fn().mockReturnValue(true),
        getDocument: jest.fn().mockReturnValue({
          getPDFDoc: jest.fn().mockResolvedValue(mockPdfDoc),
        }),
      };
    });

    afterEach(() => {
      delete window.Core;
    });

    it('passes the SDFDoc (not the PDFDoc) to PDFNet.NameTree.find', async () => {
      await findPDFNetPortfolioItem(mockCore, 'some-id');

      expect(mockPdfDoc.getSDFDoc).toHaveBeenCalled();
      expect(mockPDFNet.NameTree.find).toHaveBeenCalledWith(
        mockSdfDoc,
        'EmbeddedFiles',
      );
      expect(mockPDFNet.NameTree.find).not.toHaveBeenCalledWith(
        mockPdfDoc,
        'EmbeddedFiles',
      );
    });

    it('does not call PDFNet.NameTree.find when fullAPI is not enabled', async () => {
      mockCore.isFullPDFEnabled.mockReturnValue(false);

      await findPDFNetPortfolioItem(mockCore, 'some-id');

      expect(mockPDFNet.NameTree.find).not.toHaveBeenCalled();
    });
  });
});
