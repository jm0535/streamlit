
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export a visual element (Grid or Score) to PDF
 */
export async function exportVisualToPDF(
  elementId: string,
  title: string = 'Export',
  options: {
    orientation?: 'p' | 'l'; // portrait or landscape
    format?: string;
  } = {}
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // 1. Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    // 2. Generate PDF
    const orientation = options.orientation || (canvas.width > canvas.height ? 'l' : 'p');
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: options.format || 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit page width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add Title
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);

    // Add Image
    // Ensure it doesn't overflow height, multiple pages if needed?
    // For now simple single page scaling
    let renderHeight = imgHeight;
    if (renderHeight > pdfHeight - 20) {
      // Scale to fit height instead
      // Or just let it span pages (complex)
      // We'll just fit to page for now
      const ratio = (pdfHeight - 20) / imgHeight;
      if (ratio < 1) {
         // Scale down
         // imgWidth *= ratio;
         renderHeight = pdfHeight - 20;
      }
    }

    pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, renderHeight);
    pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

  } catch (err) {
    console.error('PDF Export failed', err);
    throw err;
  }
}
