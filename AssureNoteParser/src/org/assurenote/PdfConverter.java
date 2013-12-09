package org.assurenote;

import java.io.FileOutputStream;
import java.io.IOException;
 
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Font.FontFamily;
import com.itextpdf.text.Phrase;
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
        Document document = new Document(PageSize.A4.rotate(), 15, 15, 15, 15);
        // step 2
        PdfWriter writer
            = PdfWriter.getInstance(document, new FileOutputStream(RESULT));
        // step 3
        document.open();
        // step 4
        // Create and add a Paragraph
        Paragraph p
            = new Paragraph("AssureNote", new Font(FontFamily.HELVETICA, 12));
        p.setAlignment(Element.ALIGN_RIGHT);
        document.add(p);
        // Create and add an Image
        Image img = Image.getInstance(RESOURCE);
        img.setAbsolutePosition(
            (PageSize.A4.rotate().getWidth() - img.getScaledWidth()) / 2,
            (PageSize.A4.rotate().getHeight() - img.getScaledHeight()) / 2);
        System.err.println("width=" + PageSize.A4.rotate().getWidth() + ", height=" + PageSize.A4.rotate().getHeight());
//        document.add(img);
        Font font10 = new Font(BaseFont.createFont("HeiseiKakuGo-W5","UniJIS-UCS2-H",BaseFont.NOT_EMBEDDED),10,Font.BOLD);
        Font font18 = new Font(BaseFont.createFont("HeiseiKakuGo-W5","UniJIS-UCS2-H",BaseFont.NOT_EMBEDDED),18,Font.BOLD);
        Font font12 = new Font(BaseFont.createFont("HeiseiKakuGo-W5","UniJIS-UCS2-H",BaseFont.NOT_EMBEDDED),12,Font.BOLD);
        Paragraph p1 = new Paragraph(new Chunk("これは最初のパラグラフです。 ",font10));
        p1.add("行の幅は自動的に計算されます。");
        p1.add("デフォルトの行の幅は指定された文字ピッチの1.5倍です。");
        p1.add(new Chunk("chunks を加えることができます。"));
        p1.add(new Phrase("phrases も加えることができます。"));
//      p1.setLeading(20f); //行の幅を変えたいとき
        p1.add(new Phrase(
                "あなたが行の幅を変えない限り、文字の大きさを変えたとしても行間の幅は変わりません。 " +
                "文字の大きさを途中で帰ると、しばしばまずいことになってしまいます。",font18));
        document.add(p1);
        Paragraph p2 = new Paragraph(new Phrase(
                        "二番目のパラグラフです。 ",font12));
        p2.add("見てわかるとおり、改行されて始まります。");
        document.add(p2);
        Paragraph p3 = new Paragraph("三番目のパラグラフです。",font12);
        document.add(p3);
        PdfContentByte cb = writer.getDirectContent();
        cb.saveState();
        cb.moveTo(100, 100);
        cb.lineTo(300, 100);
        cb.lineTo(300, 200);
        cb.lineTo(100, 200);
        cb.closePath();
        cb.setLineWidth(0.3f);
        cb.setColorStroke(BaseColor.GRAY);
        cb.setLineDash(3, 1);
        cb.stroke();
        cb.restoreState();
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
