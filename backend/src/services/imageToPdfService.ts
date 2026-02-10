import { PDFDocument } from 'pdf-lib';

export const convertImageToPdf = async (
  imageBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ pdfBuffer: Buffer; pdfFileName: string }> => {
  const pdfDoc = await PDFDocument.create();

  const isJpeg = mimeType.toLowerCase().includes('jpeg') || mimeType.toLowerCase().includes('jpg');
  const image = isJpeg
    ? await pdfDoc.embedJpg(imageBuffer)
    : await pdfDoc.embedPng(imageBuffer);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfFileName = originalName.replace(/\.[^/.]+$/, '') + '.pdf';

  return { pdfBuffer: Buffer.from(pdfBytes), pdfFileName };
};

export default {
  convertImageToPdf,
};
