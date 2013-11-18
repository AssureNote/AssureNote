package org.assurenote;

import java.io.FileOutputStream;
import java.io.IOException;
 
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Font.FontFamily;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfWriter;
 
/**
 * Creates a Hello World in PDF version 1.7
 */
public class PdfConverter {
 
    /** Path to the resulting PDF file. */
    public static final String RESULT = "test.pdf";
    public static final String RESOURCE = "text.png";
    /**
     * Creates a PDF file: hello.pdf
     * @param    args    no arguments needed
     */
    public static void main(String[] args) throws DocumentException, IOException {
    	// step 1
        Document document = new Document(PageSize.POSTCARD, 30, 30, 30, 30);
        // step 2
        PdfWriter writer
            = PdfWriter.getInstance(document, new FileOutputStream(RESULT));
        // step 3
        document.open();
        // step 4
        // Create and add a Paragraph
        Paragraph p
            = new Paragraph("Foobar Film Festival", new Font(FontFamily.HELVETICA, 22));
        p.setAlignment(Element.ALIGN_CENTER);
        document.add(p);
        // Create and add an Image
        Image img = Image.getInstance(RESOURCE);
        img.setAbsolutePosition(
            (PageSize.POSTCARD.getWidth() - img.getScaledWidth()) / 2,
            (PageSize.POSTCARD.getHeight() - img.getScaledHeight()) / 2);
        document.add(img);
        // Now we go to the next page
        document.newPage();
        document.add(p);
        document.add(img);
        // Add text on top of the image
        PdfContentByte over = writer.getDirectContent();
        over.saveState();
        float sinus = (float)Math.sin(Math.PI / 60);
        float cosinus = (float)Math.cos(Math.PI / 60);
        BaseFont bf = BaseFont.createFont();
        over.beginText();
        over.setTextRenderingMode(PdfContentByte.TEXT_RENDER_MODE_FILL_STROKE);
        over.setLineWidth(1.5f);
        over.setRGBColorStroke(0xFF, 0x00, 0x00);
        over.setRGBColorFill(0xFF, 0xFF, 0xFF);
        over.setFontAndSize(bf, 36);
        over.setTextMatrix(cosinus, sinus, -sinus, cosinus, 50, 324);
        over.showText("SOLD OUT");
        over.endText();
        over.restoreState();
        // Add a rectangle under the image
        PdfContentByte under = writer.getDirectContentUnder();
        under.saveState();
        under.setRGBColorFill(0xFF, 0xD7, 0x00);
        under.rectangle(5, 5,
            PageSize.POSTCARD.getWidth() - 10, PageSize.POSTCARD.getHeight() - 10);
        under.fill();
        under.restoreState();
        // step 5
        document.close();
    }
}
