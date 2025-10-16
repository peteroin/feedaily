import React from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
// You may replace this with an imported constant or your real signature base64 string
// const SIGNATURE_BASE64 = "data:image/jpeg;base64,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"; // Add your signature's base64 string here if needed
const SIGNATURE_BASE64 ="data:image/png;base64,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"
const CertificateGenerator = ({
  user,
  overall,
  unlockedBadges,
}) => {
  const handleGenerate = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = 297;
    const pageHeight = 210;
    
    // Palette with keys matching badge labels exactly
    const colorPalettes = {
      "Bronze Donor": {
        background: [253, 244, 230],
        border: [191, 111, 44],
        innerBorder: [232, 203, 178],
        header1: [205, 127, 50],
        header2: [250, 230, 210],
        titleText: [255, 248, 240],
        subtitleText: [162, 82, 28],
        certifyText: [148, 91, 46],
        userNameText: [133, 68, 12],
        commitmentText: [140, 103, 73],
        statsBox: [255, 241, 224],
        statsText: [191, 111, 44],
        badgeText: [205, 127, 50],
        signatureLine: [205, 127, 50],
        socialText: [194, 147, 82],
      },
      "Silver Donor": {
        background: [245, 245, 245],
        border: [160, 160, 160],
        innerBorder: [215, 215, 215],
        header1: [192, 192, 192],
        header2: [230, 230, 230],
        titleText: [245, 245, 245],
        subtitleText: [120, 120, 120],
        certifyText: [100, 100, 100],
        userNameText: [105, 105, 105],
        commitmentText: [130, 130, 130],
        statsBox: [240, 240, 240],
        statsText: [160, 160, 160],
        badgeText: [192, 192, 192],
        signatureLine: [160, 160, 160],
        socialText: [130, 130, 130],
      },
      "Gold Donor": {
        background: [255, 249, 220],
        border: [255, 215, 0],
        innerBorder: [255, 239, 180],
        header1: [255, 223, 0],
        header2: [255, 250, 210],
        titleText: [255, 255, 240],
        subtitleText: [204, 170, 0],
        certifyText: [153, 123, 0],
        userNameText: [153, 102, 0],
        commitmentText: [160, 130, 60],
        statsBox: [255, 250, 230],
        statsText: [255, 215, 0],
        badgeText: [255, 215, 0],
        signatureLine: [255, 215, 0],
        socialText: [170, 140, 20],
      },
      "Platinum Donor": {
        background: [240, 245, 250],
        border: [180, 195, 210],
        innerBorder: [220, 230, 240],
        header1: [190, 210, 230],
        header2: [230, 245, 255],
        titleText: [245, 250, 255],
        subtitleText: [95, 125, 150],
        certifyText: [110, 140, 170],
        userNameText: [75, 110, 140],
        commitmentText: [100, 120, 140],
        statsBox: [230, 240, 250],
        statsText: [180, 195, 210],
        badgeText: [150, 185, 210],
        signatureLine: [140, 180, 210],
        socialText: [130, 160, 200],
      },
      "Super Sharer": {
        background: [230, 230, 250],
        border: [125, 92, 245],
        innerBorder: [200, 190, 250],
        header1: [125, 92, 245],
        header2: [210, 200, 255],
        titleText: [240, 240, 255],
        subtitleText: [95, 72, 230],
        certifyText: [100, 90, 210],
        userNameText: [85, 70, 190],
        commitmentText: [110, 90, 210],
        statsBox: [210, 200, 250],
        statsText: [120, 100, 235],
        badgeText: [125, 92, 245],
        signatureLine: [125, 92, 245],
        socialText: [90, 90, 230],
      },
      "Mega Giver": {
        background: [225, 245, 230],
        border: [0, 184, 148],
        innerBorder: [180, 230, 195],
        header1: [0, 184, 148],
        header2: [210, 250, 220],
        titleText: [240, 255, 245],
        subtitleText: [0, 130, 100],
        certifyText: [0, 120, 100],
        userNameText: [0, 110, 90],
        commitmentText: [0, 130, 110],
        statsBox: [210, 250, 220],
        statsText: [0, 170, 130],
        badgeText: [0, 184, 148],
        signatureLine: [0, 170, 130],
        socialText: [0, 150, 120],
      },
      "Community Hero": {
        background: [255, 240, 230],
        border: [225, 112, 85],
        innerBorder: [255, 220, 210],
        header1: [225, 112, 85],
        header2: [255, 230, 220],
        titleText: [255, 245, 240],
        subtitleText: [170, 70, 40],
        certifyText: [150, 60, 35],
        userNameText: [130, 50, 30],
        commitmentText: [150, 70, 45],
        statsBox: [255, 230, 220],
        statsText: [210, 105, 80],
        badgeText: [225, 112, 85],
        signatureLine: [210, 100, 70],
        socialText: [190, 90, 60],
      },
      Default: {
        background: [252, 250, 255],
        border: [158, 79, 183],
        innerBorder: [209, 178, 237],
        header1: [186, 133, 255],
        header2: [234, 210, 255],
        titleText: [254, 252, 255],
        subtitleText: [121, 47, 184],
        certifyText: [110, 95, 155],
        userNameText: [107, 22, 130],
        commitmentText: [120, 102, 130],
        statsBox: [240, 226, 255],
        statsText: [158, 79, 183],
        badgeText: [139, 37, 209],
        signatureLine: [178, 133, 255],
        socialText: [99, 165, 218],
      }
    };

    const topBadgeLabel =
      unlockedBadges?.length > 0 ? unlockedBadges[unlockedBadges.length - 1]?.label : null;
    const palette = colorPalettes[topBadgeLabel] || colorPalettes.Default;

    // Background
    doc.setFillColor(...palette.background);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Outer Border
    doc.setDrawColor(...palette.border);
    doc.setLineWidth(4);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner Border dashed
    doc.setLineWidth(1.2);
    doc.setDrawColor(...palette.innerBorder);
    doc.setLineDash([3, 2], 0);
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32);
    doc.setLineDash([]);

    // Header Decoration (two stacked rectangles)
    doc.setFillColor(...palette.header1);
    doc.rect(24, 24, pageWidth - 48, 20, "F");
    doc.setFillColor(...palette.header2);
    doc.rect(24, 44, pageWidth - 48, 8, "F");

    // Title
    doc.setFont("times", "bolditalic");
    doc.setFontSize(26);
    doc.setTextColor(...palette.titleText);
    const titleText = "Certificate of Appreciation";
    doc.text(titleText, (pageWidth - doc.getTextWidth(titleText)) / 2, 38);

    // Subtitle
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(...palette.subtitleText);
    const subtitleText = "FeeDaily";
    doc.text(subtitleText, (pageWidth - doc.getTextWidth(subtitleText)) / 2, 50);

    // Certify line
    doc.setFont("times", "italic");
    doc.setFontSize(19);
    doc.setTextColor(...palette.certifyText);
    const certifyText = "This is to certify that";
    doc.text(certifyText, (pageWidth - doc.getTextWidth(certifyText)) / 2, 77);

    // User Name
    doc.setFont("times", "bolditalic");
    doc.setFontSize(33);
    doc.setTextColor(...palette.userNameText);
    const userName = user?.name || "Valued Contributor";
    doc.text(userName, (pageWidth - doc.getTextWidth(userName)) / 2, 98);

    // Commitment lines
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(...palette.commitmentText);
    const achievementText = "has shown extraordinary commitment to reducing food waste";
    doc.text(achievementText, (pageWidth - doc.getTextWidth(achievementText)) / 2, 118);
    const impactText = "and making a lasting, positive impact in their community.";
    doc.text(impactText, (pageWidth - doc.getTextWidth(impactText)) / 2, 134);

    // Stats Box (soft background)
    doc.setFillColor(...palette.statsBox);
    doc.setDrawColor(...palette.innerBorder);
    doc.rect(62, 145, 60, 27, "FD");

    doc.setFont("times", "bolditalic");
    doc.setFontSize(13);
    doc.setTextColor(...palette.statsText);
    const statsText = "Impact Statistics";
    doc.text(statsText, 90 - doc.getTextWidth(statsText) / 2, 156);

    doc.setFont("times", "italic");
    doc.setFontSize(12.5);
    doc.setTextColor(...palette.statsText);
    doc.text(`Food Donated: ${overall?.toFixed(2) ?? "0.00"} kg`, 72, 166);

    // QR code at bottom-right
    const qrContent = user?.name
      ? `https://feedaily.example/certificate/${encodeURIComponent(user.name)}`
      : `https://feedaily.example/certificate`;

    try {
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        margin: 1,
        width: 70,
      });
      doc.addImage(qrDataUrl, "PNG", pageWidth - 60, pageHeight - 150, 34, 34);
    } catch (error) {
      // ignore QR generation failures
      console.error(error);
    }

    // Achievement badge text with palette color
    if (unlockedBadges?.length > 0) {
      const topBadge = unlockedBadges[unlockedBadges.length - 1];
      doc.setFont("times", "bolditalic");
      doc.setFontSize(15);
      doc.setTextColor(...palette.badgeText);
      const badgeText = `Achievement Level: ${topBadge.label}`;
      doc.text(badgeText, (pageWidth - doc.getTextWidth(badgeText)) / 2, 185);
    }

    // Date & certificate number
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...palette.border);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Date: ${currentDate}`, 24, pageHeight - 25);
    const certNumber = `Certificate No: FD-${Date.now().toString().slice(-6)}`;
    doc.text(certNumber, 24, pageHeight - 18);

    // Signature line & label
    const signatureX = pageWidth - 110;
    const signatureY = pageHeight - 47;
    doc.setLineWidth(0.4);
    doc.setDrawColor(...palette.signatureLine);
    doc.line(signatureX, signatureY, signatureX + 82, signatureY);

    if (SIGNATURE_BASE64 && SIGNATURE_BASE64.startsWith("data:image")) {
      doc.addImage(SIGNATURE_BASE64, "PNG", signatureX + 16, signatureY - 15, 50, 20);
    }
    doc.setFont("times", "italic");
    doc.setFontSize(17);
    doc.setTextColor(...palette.signatureLine);
    doc.text("Founder", signatureX + 30, signatureY + 5);

    // Social sharing note
    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...palette.socialText);
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