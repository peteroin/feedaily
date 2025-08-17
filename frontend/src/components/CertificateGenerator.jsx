import React from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
// You may replace this with an imported constant or your real signature base64 string
const SIGNATURE_BASE64 = "data:image/jpeg;base64,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"; // Add your signature's base64 string here if needed

const CertificateGenerator = ({
  user,
  overall,
  totalReceived,
  unlockedBadges,
}) => {
  const handleGenerate = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = 297;
    const pageHeight = 210;

    // Background
    doc.setFillColor(252, 250, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Border (muted purple)
    doc.setDrawColor(158, 79, 183);
    doc.setLineWidth(3.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner Border (pale pastel)
    doc.setLineWidth(0.7);
    doc.setDrawColor(209, 178, 237);
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32);

    // Header Decoration (gradient-like effect using two rectangles)
    doc.setFillColor(186, 133, 255);
    doc.rect(24, 24, pageWidth - 48, 20, "F");
    doc.setFillColor(234, 210, 255);
    doc.rect(24, 44, pageWidth - 48, 7, "F");

    // Title (script font, off-white)
    doc.setFont("times", "bolditalic");
    doc.setFontSize(26);
    doc.setTextColor(254, 252, 255);
    const titleText = "Certificate of Appreciation";
    doc.text(
      titleText,
      (pageWidth - doc.getTextWidth(titleText)) / 2,
      38
    );

    // Subtitle (lighter cursive font)
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(121, 47, 184);
    const subtitleText = "FeeDaily";
    doc.text(
      subtitleText,
      (pageWidth - doc.getTextWidth(subtitleText)) / 2,
      50
    );

    // Certify line (italic soft gray)
    doc.setFont("times", "italic");
    doc.setFontSize(19);
    doc.setTextColor(110, 95, 155);
    const certifyText = "This is to certify that";
    doc.text(certifyText, (pageWidth - doc.getTextWidth(certifyText)) / 2, 77);

    // User Name (cursive, deep purple)
    doc.setFont("times", "bolditalic");
    doc.setFontSize(33);
    doc.setTextColor(107, 22, 130);
    const userName = user?.name || "Valued Contributor";
    doc.text(userName, (pageWidth - doc.getTextWidth(userName)) / 2, 98);

    // Commitment lines (mauve-gray)
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(120, 102, 130);
    const achievementText = "has shown extraordinary commitment to reducing food waste";
    doc.text(
      achievementText,
      (pageWidth - doc.getTextWidth(achievementText)) / 2,
      118
    );
    const impactText =
      "and making a lasting, positive impact in their community.";
    doc.text(
      impactText,
      (pageWidth - doc.getTextWidth(impactText)) / 2,
      134
    );

    // Stats Box (soft lavender) - now only for Food Donated
    doc.setFillColor(240, 226, 255);
    doc.setDrawColor(210, 178, 237);
    doc.rect(62, 145, 60, 27, "FD");

    doc.setFont("times", "bolditalic");
    doc.setFontSize(13);
    doc.setTextColor(158, 79, 183);
    const statsText = "Impact Statistics";
    doc.text(
      statsText,
      90 - doc.getTextWidth(statsText) / 2,
      156
    );

    doc.setFont("times", "italic");
    doc.setFontSize(12.5);
    doc.setTextColor(109, 60, 141);
    doc.text(`Food Donated: ${overall?.toFixed(2) ?? "0.00"} kg`, 72, 166);

    // Simple QR code (bottom right)
    const qrContent = user?.name
      ? `https://feedaily.example/certificate/${encodeURIComponent(user.name)}`
      : `https://feedaily.example/certificate`;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 70 });
      doc.addImage(qrDataUrl, "PNG", pageWidth - 60, pageHeight - 150, 34, 34);
    } catch (e) {
      // If QR generation fails, ignore and continue
    }

    // Achievement badge (script with accent color)
    if (unlockedBadges?.length > 0) {
      const topBadge = unlockedBadges[unlockedBadges.length - 1];
      doc.setFont("times", "bolditalic");
      doc.setFontSize(15);
      // Attempt to parse color; fallback if string (CSS var) is passed
      let r = 139, g = 37, b = 209;
      if (Array.isArray(topBadge.color)) {
        [r, g, b] = topBadge.color;
      }
      doc.setTextColor(r, g, b);
      const badgeText = `Achievement Level: ${topBadge.label}`;
      doc.text(
        badgeText,
        (pageWidth - doc.getTextWidth(badgeText)) / 2,
        185
      );
    }

    // Date & Certificate Number (small, muted italic)
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(158, 115, 201);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Date: ${currentDate}`, 24, pageHeight - 25);
    const certNumber = `Certificate No: FD-${Date.now().toString().slice(-6)}`;
    doc.text(certNumber, 24, pageHeight - 18);

    // Signature line (cursive accent)
    const signatureX = pageWidth - 110;
    const signatureY = pageHeight - 47;
    doc.setLineWidth(0.4);
    doc.setDrawColor(178, 133, 255);
    doc.line(signatureX, signatureY, signatureX + 82, signatureY);

    if (SIGNATURE_BASE64 && SIGNATURE_BASE64.startsWith("data:image")) {
      doc.addImage(SIGNATURE_BASE64, "PNG", signatureX + 16, signatureY - 23, 50, 20);
    }
    doc.setFont("times", "italic");
    doc.setFontSize(17);
    doc.setTextColor(160, 79, 232);
    doc.text("Founder", signatureX + 36, signatureY + 13);

    // Social sharing note (tiny, pastel blue italic)
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(99, 165, 218);
    doc.text(
      "Share your achievement on social media #FoodsharingHero #Feedaily",
      24,
      pageHeight - 3
    );

    const fileName = `${user?.name?.replace(/\s+/g, "_") || "certificate"}_feedaily_certificate.pdf`;
    doc.save(fileName);
  };

  return (
    <button
      onClick={handleGenerate}
      style={{
        marginTop: 30,
        background: "linear-gradient(90deg, #bc85ff 0%, #e4baff 100%)",
        border: "none",
        color: "#6b1682",
        fontFamily: "cursive",
        borderRadius: 14,
        fontWeight: 600,
        fontSize: "1.13rem",
        padding: "13px 36px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgb(186 133 255 / 0.18)",
        letterSpacing: "0.04em",
        fontStyle: "italic",
        transition: "background 0.28s",
      }}
    >
      Download Certificate PDF
    </button>
  );
};

export default CertificateGenerator;