import jsPDF from "jspdf";

export interface DiagnosisData {
  session: {
    id: string;
    chiefComplaint: string;
    additionalInfo: string;
    status: string;
    urgencyLevel: string;
    createdAt: Date;
  };
  predictions: Array<{
    disease: {
      name: string;
      description: string;
      severityLevel: string;
      icdCode?: string;
    };
    confidence: string;
    reasoning?: string[];
    riskFactors?: string[];
    recommendations?: string[];
  }>;
  doctorReview?: {
    finalDiagnosis: string;
    doctorName?: string;
    doctorSpecialization?: string;
    confidence?: number;
    notes?: string;
    recommendedActions?: string[];
  };
}

export class PDFExportService {
  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  private static getConfidenceColor(conf: number): string {
    if (conf >= 80) return "#16a34a"; // green-600
    if (conf >= 60) return "#ca8a04"; // yellow-600
    return "#dc2626"; // red-600
  }

  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case "mild":
        return "#16a34a";
      case "moderate":
        return "#ca8a04";
      case "severe":
        return "#dc2626";
      case "critical":
        return "#991b1b";
      default:
        return "#6b7280";
    }
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  static async generateDiagnosisPDF(data: DiagnosisData): Promise<jsPDF> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (
      text: string,
      x: number,
      y: number,
      options: { fontSize?: number } = {}
    ) => {
      const lines = doc.splitTextToSize(text, contentWidth - x + margin);
      doc.text(lines, x, y);
      return y + lines.length * (options.fontSize || 10) * 0.35;
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    yPosition = addText(
      "AI-Powered Medical Diagnosis Report",
      margin,
      yPosition
    );

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPosition = addText(
      `Generated on: ${this.formatDate(new Date())}`,
      margin,
      yPosition
    );

    yPosition += 15;

    // Important Notice
    doc.setFillColor(255, 243, 205); // orange-50
    doc.rect(margin, yPosition, contentWidth, 25, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    yPosition = addText("IMPORTANT NOTICE", margin + 5, yPosition + 8);
    doc.setFont("helvetica", "normal");
    yPosition = addText(
      "This AI analysis is for informational purposes only. Always consult with a healthcare provider for proper diagnosis and treatment.",
      margin + 5,
      yPosition + 2
    );
    yPosition += 20;

    // Session Information
    checkNewPage(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    yPosition = addText("Session Information", margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    yPosition = addText(`Session ID: ${data.session.id}`, margin, yPosition);
    yPosition = addText(
      `Chief Complaint: ${data.session.chiefComplaint}`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Additional Information: ${data.session.additionalInfo}`,
      margin,
      yPosition
    );
    yPosition = addText(`Status: ${data.session.status}`, margin, yPosition);
    yPosition = addText(
      `Urgency Level: ${data.session.urgencyLevel}`,
      margin,
      yPosition
    );
    yPosition = addText(
      `Created: ${this.formatDate(data.session.createdAt)}`,
      margin,
      yPosition
    );
    yPosition += 10;

    // Top Prediction
    if (data.predictions.length > 0) {
      checkNewPage(40);
      const topPrediction = data.predictions[0];
      const confidence = parseFloat(topPrediction.confidence) * 100;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      yPosition = addText("Most Likely Condition", margin, yPosition);
      yPosition += 5;

      doc.setFontSize(14);
      yPosition = addText(topPrediction.disease.name, margin, yPosition);
      yPosition += 5;

      // Confidence and severity badges
      doc.setFontSize(10);
      doc.setFillColor(this.getConfidenceColor(confidence));
      doc.rect(margin, yPosition, 60, 8, "F");
      doc.setTextColor(255, 255, 255);
      yPosition = addText(
        `${confidence.toFixed(1)}% Confidence`,
        margin + 2,
        yPosition + 6
      );
      doc.setTextColor(0, 0, 0);

      doc.setFillColor(
        this.getSeverityColor(topPrediction.disease.severityLevel)
      );
      doc.rect(margin + 70, yPosition - 8, 50, 8, "F");
      doc.setTextColor(255, 255, 255);
      yPosition = addText(
        topPrediction.disease.severityLevel,
        margin + 72,
        yPosition - 2
      );
      doc.setTextColor(0, 0, 0);

      if (topPrediction.disease.icdCode) {
        doc.setFillColor(200, 200, 200);
        doc.rect(margin + 130, yPosition - 8, 40, 8, "F");
        doc.setTextColor(0, 0, 0);
        yPosition = addText(
          topPrediction.disease.icdCode,
          margin + 132,
          yPosition - 2
        );
      }

      yPosition += 10;

      // Description
      if (topPrediction.disease.description) {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        yPosition = addText("Description:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition = addText(
          topPrediction.disease.description,
          margin,
          yPosition + 2
        );
        yPosition += 5;
      }

      // AI Reasoning
      if (topPrediction.reasoning && topPrediction.reasoning.length > 0) {
        checkNewPage(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        yPosition = addText("AI Reasoning:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        topPrediction.reasoning.forEach((reason) => {
          yPosition = addText(`• ${reason}`, margin + 5, yPosition + 2);
        });
        yPosition += 5;
      }

      // Risk Factors
      if (topPrediction.riskFactors && topPrediction.riskFactors.length > 0) {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        yPosition = addText("Risk Factors:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition = addText(
          topPrediction.riskFactors.join(", "),
          margin,
          yPosition + 2
        );
        yPosition += 5;
      }

      // Recommendations
      if (
        topPrediction.recommendations &&
        topPrediction.recommendations.length > 0
      ) {
        checkNewPage(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        yPosition = addText("Recommendations:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        topPrediction.recommendations.forEach((recommendation) => {
          yPosition = addText(`• ${recommendation}`, margin + 5, yPosition + 2);
        });
        yPosition += 5;
      }
    }

    // Other Predictions
    if (data.predictions.length > 1) {
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      yPosition = addText("Other Possible Conditions", margin, yPosition);
      yPosition += 5;

      data.predictions.slice(1, 4).forEach((prediction) => {
        checkNewPage(15);
        const predConfidence = parseFloat(prediction.confidence) * 100;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        yPosition = addText(
          `${prediction.disease.name} (${predConfidence.toFixed(
            1
          )}% confidence)`,
          margin,
          yPosition
        );
        yPosition += 3;
      });
      yPosition += 5;
    }

    // Doctor Review
    if (data.doctorReview) {
      checkNewPage(40);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      yPosition = addText("Doctor Review", margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      yPosition = addText("Final Diagnosis:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition = addText(
        data.doctorReview.finalDiagnosis,
        margin,
        yPosition + 2
      );
      yPosition += 5;

      if (data.doctorReview.doctorName) {
        doc.setFont("helvetica", "bold");
        yPosition = addText("Reviewed by:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition = addText(
          `Dr. ${data.doctorReview.doctorName}${
            data.doctorReview.doctorSpecialization
              ? ` (${data.doctorReview.doctorSpecialization})`
              : ""
          }`,
          margin,
          yPosition + 2
        );
        yPosition += 5;
      }

      if (data.doctorReview.confidence) {
        doc.setFont("helvetica", "bold");
        yPosition = addText("Doctor Confidence:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition = addText(
          `${data.doctorReview.confidence}/10`,
          margin,
          yPosition + 2
        );
        yPosition += 5;
      }

      if (data.doctorReview.notes) {
        checkNewPage(20);
        doc.setFont("helvetica", "bold");
        yPosition = addText("Doctor Notes:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition = addText(data.doctorReview.notes, margin, yPosition + 2);
        yPosition += 5;
      }

      if (
        data.doctorReview.recommendedActions &&
        data.doctorReview.recommendedActions.length > 0
      ) {
        checkNewPage(30);
        doc.setFont("helvetica", "bold");
        yPosition = addText("Recommended Actions:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        data.doctorReview.recommendedActions.forEach((action) => {
          yPosition = addText(`• ${action}`, margin + 5, yPosition + 2);
        });
        yPosition += 5;
      }
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Generated by SymptomDX - AI-Powered Medical Diagnosis Platform",
      margin,
      footerY
    );
    doc.text(
      "This report is for informational purposes only. Always consult with a healthcare provider.",
      margin,
      footerY + 5
    );

    return doc;
  }

  static async downloadDiagnosisPDF(
    data: DiagnosisData,
    filename?: string
  ): Promise<void> {
    const doc = await this.generateDiagnosisPDF(data);
    const defaultFilename = `diagnosis-report-${data.session.id.slice(
      0,
      8
    )}.pdf`;
    doc.save(filename || defaultFilename);
  }
}
