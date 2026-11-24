import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Sanitize text for StandardFonts (WinAnsi encoding) so pdf-lib never throws
 * on emojis, smart quotes, em-dashes, or currency symbols.
 */
function sanitizePdfText(input) {
  if (input === null || input === undefined) return 'Not provided';
  const raw = String(input)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/•/g, '*')
    .replace(/₦/g, 'NGN ')
    .replace(/…/g, '...');

  // Keep printable ASCII (0x20-0x7E), newline (0x0A), and safe Latin-1 (0xA0-0xFF)
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code === 10 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
      out += raw[i];
    }
  }
  return out.trim() || 'Not provided';
}

function dataUrlToUint8Array(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUrl.slice(0, commaIdx);
  const base64 = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+)/i);
  const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : '';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, mimeType };
}

function wrapLines(text, font, fontSize, maxWidth) {
  const safe = sanitizePdfText(text);
  const paragraphs = safe.split('\n');
  const result = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) result.push(currentLine);
        // Handle single very long word (e.g. long URL)
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) result.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) result.push(currentLine);
  }
  return result.length > 0 ? result : ['Not provided'];
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Generates a single combined PDF file containing:
 * 1. Full GETIT Staff Enrollment Application Dossier (all 21 questions, contact info, interview schedule)
 * 2. Every page of the candidate's attached CV (PDF merged directly, or Image/Text embedded cleanly)
 */
export async function exportApplicantFullPdf(app) {
  if (!app) throw new Error('No applicant data provided.');

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28; // A4 width in pt
  const PAGE_H = 841.89; // A4 height in pt
  const MARGIN = 44;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Brand colors
  const TEAL_DARK = rgb(4 / 255, 47 / 255, 46 / 255);      // #042F2E
  const TEAL_MAIN = rgb(15 / 255, 118 / 255, 110 / 255);   // #0F766E
  const TEAL_LIGHT = rgb(240 / 255, 253 / 255, 250 / 255); // #F0FDFA
  const EMERALD_BG = rgb(236 / 255, 253 / 255, 245 / 255); // #ECFDF5
  const EMERALD_TXT = rgb(6 / 255, 95 / 255, 70 / 255);    // #065F46
  const SLATE_DARK = rgb(15 / 255, 23 / 255, 42 / 255);    // #0F172A
  const SLATE_TEXT = rgb(51 / 255, 65 / 255, 85 / 255);    // #334155
  const SLATE_MUTED = rgb(100 / 255, 116 / 255, 139 / 255);// #64748B
  const BORDER_GRAY = rgb(226 / 255, 232 / 255, 240 / 255);// #E2E8F0
  const CARD_BG = rgb(248 / 255, 250 / 255, 252 / 255);    // #F8FAFC
  const WHITE = rgb(1, 1, 1);

  const dossierPages = [];
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  dossierPages.push(page);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    dossierPages.push(page);
    y = PAGE_H - MARGIN;
  };

  const ensureSpace = (needed) => {
    if (y - needed < MARGIN + 24) {
      newPage();
    }
  };

  // --- Executive Top Banner ---
  const bannerH = 92;
  page.drawRectangle({
    x: 0,
    y: PAGE_H - bannerH,
    width: PAGE_W,
    height: bannerH,
    color: TEAL_DARK,
  });

  page.drawText('GETIT EXECUTIVE STAFF RECRUITMENT DOSSIER', {
    x: MARGIN,
    y: PAGE_H - 28,
    size: 9.5,
    font: fontBold,
    color: rgb(94 / 255, 234 / 255, 212 / 255),
  });

  const fullNameSafe = sanitizePdfText(app.fullName || 'Unnamed Applicant');
  page.drawText(fullNameSafe, {
    x: MARGIN,
    y: PAGE_H - 52,
    size: 20,
    font: fontBold,
    color: WHITE,
  });

  const appRef = sanitizePdfText(app.applicationRef || app.id || 'N/A');
  const statusLabel = sanitizePdfText((app.status || 'PENDING_REVIEW').replace(/_/g, ' '));
  const submittedStr = app.submittedAt
    ? sanitizePdfText(new Date(app.submittedAt).toLocaleString())
    : 'N/A';

  page.drawText(`Ref: ${appRef}   |   Status: ${statusLabel}   |   Applied: ${submittedStr}`, {
    x: MARGIN,
    y: PAGE_H - 74,
    size: 9.5,
    font: fontRegular,
    color: rgb(204 / 255, 251 / 255, 241 / 255),
  });

  y = PAGE_H - bannerH - 22;

  // Helper: Section Header
  const drawSectionHeader = (title) => {
    ensureSpace(34);
    page.drawRectangle({
      x: MARGIN,
      y: y - 20,
      width: CONTENT_W,
      height: 22,
      color: TEAL_LIGHT,
      borderColor: TEAL_MAIN,
      borderWidth: 0.75,
    });
    page.drawText(sanitizePdfText(title), {
      x: MARGIN + 8,
      y: y - 13,
      size: 10.5,
      font: fontBold,
      color: TEAL_MAIN,
    });
    y -= 32;
  };

  // Helper: Short inline Q&A
  const drawKeyValue = (label, value) => {
    const labelText = sanitizePdfText(label);
    const valLines = wrapLines(value, fontRegular, 10, CONTENT_W - 12);
    const blockH = 14 + valLines.length * 13 + 6;
    ensureSpace(blockH);

    page.drawText(labelText, {
      x: MARGIN,
      y,
      size: 9.5,
      font: fontBold,
      color: SLATE_DARK,
    });
    y -= 13;

    for (const line of valLines) {
      ensureSpace(14);
      page.drawText(line, {
        x: MARGIN + 8,
        y,
        size: 10,
        font: fontRegular,
        color: SLATE_TEXT,
      });
      y -= 13;
    }
    y -= 5;
  };

  // Helper: Long Q&A block with subtle box background
  const drawLongAnswer = (question, answer) => {
    const qLines = wrapLines(question, fontBold, 9.5, CONTENT_W);
    const aLines = wrapLines(answer, fontRegular, 9.8, CONTENT_W - 16);

    ensureSpace(qLines.length * 13 + Math.min(aLines.length, 3) * 13 + 22);

    for (const qLine of qLines) {
      ensureSpace(14);
      page.drawText(qLine, {
        x: MARGIN,
        y,
        size: 9.5,
        font: fontBold,
        color: SLATE_DARK,
      });
      y -= 13;
    }
    y -= 2;

    // Render answer lines cleanly across page breaks if needed
    for (const aLine of aLines) {
      ensureSpace(15);
      page.drawRectangle({
        x: MARGIN,
        y: y - 3.5,
        width: CONTENT_W,
        height: 14,
        color: CARD_BG,
      });
      page.drawLine({
        start: { x: MARGIN, y: y - 3.5 },
        end: { x: MARGIN, y: y + 10.5 },
        thickness: 2,
        color: BORDER_GRAY,
      });
      if (aLine) {
        page.drawText(aLine, {
          x: MARGIN + 8,
          y,
          size: 9.8,
          font: fontRegular,
          color: SLATE_TEXT,
        });
      }
      y -= 13.5;
    }
    y -= 10;
  };

  // --- Interview Schedule Banner (if scheduled) ---
  if (app.interviewSchedule) {
    const sched = app.interviewSchedule;
    const schedLines = [
      `Date: ${sanitizePdfText(sched.date || 'TBD')}   |   Time: ${sanitizePdfText(sched.time || 'TBD')} (${sanitizePdfText(sched.duration || '10 Minutes')})`,
      `Platform: ${sanitizePdfText(sched.platform || 'Google Meet')}`,
      sched.meetingLink ? `Meeting Link: ${sanitizePdfText(sched.meetingLink)}` : null,
      sched.notes ? `Notes: ${sanitizePdfText(sched.notes)}` : null,
    ].filter(Boolean);

    const wrappedSched = schedLines.flatMap((l) => wrapLines(l, fontRegular, 9.5, CONTENT_W - 16));
    const boxH = 22 + wrappedSched.length * 13 + 8;
    ensureSpace(boxH + 10);

    page.drawRectangle({
      x: MARGIN,
      y: y - boxH,
      width: CONTENT_W,
      height: boxH,
      color: EMERALD_BG,
      borderColor: EMERALD_TXT,
      borderWidth: 1,
    });

    page.drawText('SCHEDULED 1-ON-1 EXECUTIVE INTERVIEW', {
      x: MARGIN + 10,
      y: y - 16,
      size: 10,
      font: fontBold,
      color: EMERALD_TXT,
    });

    let sy = y - 31;
    for (const sl of wrappedSched) {
      page.drawText(sl, {
        x: MARGIN + 10,
        y: sy,
        size: 9.5,
        font: fontRegular,
        color: SLATE_DARK,
      });
      sy -= 13;
    }
    y -= boxH + 16;
  }

  // --- SECTION 1 ---
  const stateVal = app.currentState || (app.stateAndCity || '').split(/[—–-]/)[0]?.trim() || app.stateAndCity;
  const cityVal = app.currentCity || (app.stateAndCity || '').split(/[—–-]/)[1]?.trim() || app.stateAndCity;

  drawSectionHeader('SECTION 1: PERSONAL INFORMATION & BACKGROUND (Q1 - Q7)');
  drawKeyValue('1. Full Name', app.fullName);
  drawKeyValue('2. Phone Number (WhatsApp / Call)', app.phone);
  drawKeyValue('3. Email Address', app.email);
  drawKeyValue('4. Current State & City of Residence', `${sanitizePdfText(stateVal)} - ${sanitizePdfText(cityVal)}`);
  drawKeyValue('5. Highest Educational Qualification', app.highestEducation);
  drawKeyValue('6. Current Employment Status', app.employmentStatus);
  drawKeyValue('7. Resumption Availability', app.resumptionAvailability);
  if (app.assignedStaffId) {
    drawKeyValue('Assigned GETIT Staff ID', app.assignedStaffId);
  }

  // --- SECTION 2 ---
  drawSectionHeader('SECTION 2: MANAGEMENT & LEADERSHIP EXPERIENCE (Q8 - Q11)');
  drawKeyValue('8. Previously managed, supervised, or led a team?', app.previouslyManagedTeam);
  drawKeyValue('9. Largest team size managed at the same time', app.teamSizeManaged);
  drawLongAnswer(
    '10. Previous management/leadership experience, responsibilities & team achievements:',
    app.leadershipExperienceSummary
  );
  drawLongAnswer(
    '11. Experience recruiting people and building a team from scratch:',
    app.recruitedTeamFromScratch
  );

  // --- SECTION 3 ---
  drawSectionHeader('SECTION 3: PRACTICAL LEADERSHIP QUESTIONS (Q12 - Q16)');
  drawLongAnswer(
    '12. Building & managing a team of 20 people from scratch (recruitment, organisation & supervision):',
    app.planForTeamOf20
  );
  drawLongAnswer(
    '13. Turnaround plan when only 5 of 15 recruits are performing after two weeks:',
    app.turnaroundUnderperforming15
  );
  drawLongAnswer(
    '14. Strategy to establish 200 new business relationships within 30 days:',
    app.planFor200BusinessRelationships
  );
  drawLongAnswer(
    '15. Monitoring daily activities & ensuring every team member is accountable:',
    app.dailyMonitoringAccountability
  );
  drawLongAnswer(
    '16. Difficult situation experienced while managing people, handling & outcome:',
    app.difficultSituationHandled
  );

  // --- SECTION 4 ---
  drawSectionHeader('SECTION 4: AVAILABILITY & COMMITMENT (Q17 - Q19)');
  drawKeyValue('17. Comfortable with fieldwork, visiting businesses & supervising across locations?', app.comfortableWithFieldwork);
  drawKeyValue('18. Comfortable working with performance targets & submitting regular activity reports?', app.comfortableWithTargetsAndReports);
  drawLongAnswer('19. Why suitable for this management position:', app.whySuitableForManagement);

  // --- SECTION 5 ---
  drawSectionHeader('SECTION 5: SUPPORTING DOCUMENTS & REFEREE (Q20 - Q21)');
  const cvMeta = `${app.cvFileName || 'Not attached'}${app.cvFileSize ? ` (${formatFileSize(app.cvFileSize)})` : ''}`;
  drawKeyValue('20. Attached CV / Resume Document', cvMeta);
  drawKeyValue('21. Professional Referee', app.professionalReferee || 'Not provided');

  // --- MERGE ATTACHED CV INTO THE SAME PDF ---
  let cvMergeStatus = 'No CV file attached.';
  if (app.cvDataUrl) {
    const decoded = dataUrlToUint8Array(app.cvDataUrl);
    if (decoded && decoded.bytes.length > 0) {
      const mime = decoded.mimeType || (app.cvMimeType || '').toLowerCase();
      const lowerName = (app.cvFileName || '').toLowerCase();

      if (mime.includes('pdf') || lowerName.endsWith('.pdf')) {
        try {
          const cvPdf = await PDFDocument.load(decoded.bytes, { ignoreEncryption: true });
          const cvPageCount = cvPdf.getPageCount();
          const copiedPages = await pdfDoc.copyPages(cvPdf, cvPdf.getPageIndices());

          // Add a crisp notice on the dossier page before appending CV pages
          drawKeyValue(
            'CV Attachment Included Below',
            `All ${cvPageCount} page(s) of "${app.cvFileName || 'Candidate_CV.pdf'}" are appended immediately after this section in this PDF.`
          );

          for (const cp of copiedPages) {
            pdfDoc.addPage(cp);
          }
          cvMergeStatus = `Merged ${cvPageCount} PDF page(s).`;
        } catch (err) {
          console.warn('Could not merge PDF CV pages:', err);
          drawKeyValue(
            'CV Attachment Note',
            `The attached PDF ("${app.cvFileName || 'CV.pdf'}") could not be merged automatically (${err.message || 'protected/unsupported PDF'}). Use "Download CV" to view the original file.`
          );
          cvMergeStatus = 'PDF CV could not be merged (encrypted or unsupported format).';
        }
      } else if (
        mime.includes('png') ||
        mime.includes('jpeg') ||
        mime.includes('jpg') ||
        lowerName.endsWith('.png') ||
        lowerName.endsWith('.jpg') ||
        lowerName.endsWith('.jpeg')
      ) {
        try {
          const img = mime.includes('png') || lowerName.endsWith('.png')
            ? await pdfDoc.embedPng(decoded.bytes)
            : await pdfDoc.embedJpg(decoded.bytes);

          const imgPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
          imgPage.drawText(`ATTACHED CANDIDATE CV: ${sanitizePdfText(app.cvFileName || 'CV Image')}`, {
            x: MARGIN,
            y: PAGE_H - 34,
            size: 10,
            font: fontBold,
            color: TEAL_MAIN,
          });

          const maxImgW = PAGE_W - MARGIN * 2;
          const maxImgH = PAGE_H - MARGIN * 2 - 24;
          const dims = img.scale(1);
          const scale = Math.min(maxImgW / dims.width, maxImgH / dims.height, 1);
          const drawW = dims.width * scale;
          const drawH = dims.height * scale;

          imgPage.drawImage(img, {
            x: (PAGE_W - drawW) / 2,
            y: PAGE_H - 48 - drawH,
            width: drawW,
            height: drawH,
          });
          cvMergeStatus = 'Embedded CV image page.';
        } catch (err) {
          console.warn('Could not embed image CV:', err);
          drawKeyValue('CV Attachment Note', `Attached image "${app.cvFileName}" could not be embedded automatically.`);
        }
      } else if (mime.startsWith('text/') || lowerName.endsWith('.txt')) {
        try {
          const textContent = new TextDecoder('utf-8').decode(decoded.bytes);
          newPage();
          drawSectionHeader(`ATTACHED CANDIDATE CV CONTENT: ${app.cvFileName || 'CV.txt'}`);
          drawLongAnswer('Full CV Text:', textContent);
          cvMergeStatus = 'Included plain text CV.';
        } catch (err) {
          console.warn('Could not decode text CV:', err);
        }
      } else {
        drawKeyValue(
          'CV Attachment Note',
          `Attached file "${app.cvFileName || 'CV'}" (${mime || 'binary document'}) is not a PDF/image and cannot be rendered as PDF pages directly. Use "Download CV" to open the original file.`
        );
        cvMergeStatus = 'Non-PDF CV noted.';
      }
    }
  }

  // Add subtle footer to dossier pages (skipping appended CV pages so CV layout stays untouched)
  const totalPages = pdfDoc.getPageCount();
  dossierPages.forEach((p, idx) => {
    p.drawLine({
      start: { x: MARGIN, y: 30 },
      end: { x: PAGE_W - MARGIN, y: 30 },
      thickness: 0.5,
      color: BORDER_GRAY,
    });
    p.drawText(
      `GETIT Staff Enrollment Dossier  |  ${fullNameSafe} (${appRef})  |  Page ${idx + 1} of ${totalPages}`,
      {
        x: MARGIN,
        y: 18,
        size: 8,
        font: fontRegular,
        color: SLATE_MUTED,
      }
    );
  });

  const pdfBytes = await pdfDoc.save();
  const safeName = (app.fullName || 'Applicant').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const safeRef = (app.applicationRef || app.id || 'REF').replace(/[^a-zA-Z0-9-]+/g, '');
  const filename = `GETIT_Full_Dossier_and_CV_${safeName}_${safeRef}.pdf`;

  triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), filename);
  return { filename, totalPages, cvMergeStatus };
}

/**
 * Exports all applicant data and 21 Q&A answers as a clean, readable plain text file (.txt).
 */
export function exportApplicantTextSummary(app) {
  if (!app) return;
  const stateVal = app.currentState || (app.stateAndCity || '').split(/[—–-]/)[0]?.trim() || app.stateAndCity || 'N/A';
  const cityVal = app.currentCity || (app.stateAndCity || '').split(/[—–-]/)[1]?.trim() || app.stateAndCity || 'N/A';

  const lines = [
    '====================================================================',
    'GETIT EXECUTIVE STAFF RECRUITMENT - COMPLETE CANDIDATE DOSSIER',
    '====================================================================',
    `Full Name:        ${app.fullName || 'N/A'}`,
    `Application Ref:  ${app.applicationRef || app.id || 'N/A'}`,
    `Status:           ${app.status || 'PENDING_REVIEW'}`,
    `Submitted At:     ${app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'N/A'}`,
    app.assignedStaffId ? `Assigned Staff ID: ${app.assignedStaffId}` : null,
    '',
  ].filter((l) => l !== null);

  if (app.interviewSchedule) {
    lines.push(
      '--- SCHEDULED 1-ON-1 INTERVIEW ---',
      `Date:         ${app.interviewSchedule.date || 'TBD'}`,
      `Time Slot:    ${app.interviewSchedule.time || 'TBD'} (${app.interviewSchedule.duration || '10 Minutes'})`,
      `Platform:     ${app.interviewSchedule.platform || 'Google Meet'}`,
      `Meeting Link: ${app.interviewSchedule.meetingLink || 'N/A'}`,
      `Notes:        ${app.interviewSchedule.notes || 'N/A'}`,
      ''
    );
  }

  lines.push(
    '--- SECTION 1: PERSONAL INFORMATION & BACKGROUND (Q1 - Q7) ---',
    `1. Full Name:             ${app.fullName || 'N/A'}`,
    `2. Phone Number:          ${app.phone || 'N/A'}`,
    `3. Email Address:         ${app.email || 'N/A'}`,
    `4. State & City:          ${stateVal} - ${cityVal}`,
    `5. Highest Education:     ${app.highestEducation || 'N/A'}`,
    `6. Employment Status:     ${app.employmentStatus || 'N/A'}`,
    `7. Resumption Available:  ${app.resumptionAvailability || 'N/A'}`,
    '',
    '--- SECTION 2: MANAGEMENT & LEADERSHIP EXPERIENCE (Q8 - Q11) ---',
    `8. Previously managed/supervised a team?: ${app.previouslyManagedTeam || 'N/A'}`,
    `9. Largest team size managed:             ${app.teamSizeManaged || 'N/A'}`,
    '10. Previous management/leadership experience, responsibilities & achievements:',
    app.leadershipExperienceSummary || 'Not provided',
    '',
    '11. Experience recruiting people and building a team from scratch:',
    app.recruitedTeamFromScratch || 'Not provided',
    '',
    '--- SECTION 3: PRACTICAL LEADERSHIP QUESTIONS (Q12 - Q16) ---',
    '12. Plan for building & managing a team of 20 people from scratch:',
    app.planForTeamOf20 || 'Not provided',
    '',
    '13. Turnaround plan when only 5 of 15 recruits perform after two weeks:',
    app.turnaroundUnderperforming15 || 'Not provided',
    '',
    '14. Strategy to establish 200 new business relationships within 30 days:',
    app.planFor200BusinessRelationships || 'Not provided',
    '',
    '15. Monitoring daily activities & ensuring accountability:',
    app.dailyMonitoringAccountability || 'Not provided',
    '',
    '16. Difficult situation handled while managing people & outcome:',
    app.difficultSituationHandled || 'Not provided',
    '',
    '--- SECTION 4: AVAILABILITY & COMMITMENT (Q17 - Q19) ---',
    `17. Comfortable with fieldwork & supervising across locations?: ${app.comfortableWithFieldwork || 'N/A'}`,
    `18. Comfortable with targets & regular activity reports?:       ${app.comfortableWithTargetsAndReports || 'N/A'}`,
    '19. Why suitable for this management position:',
    app.whySuitableForManagement || 'Not provided',
    '',
    '--- SECTION 5: SUPPORTING DOCUMENTS & REFEREE (Q20 - Q21) ---',
    `20. Uploaded CV File:     ${app.cvFileName || 'Not attached'}${app.cvFileSize ? ` (${formatFileSize(app.cvFileSize)})` : ''}`,
    `21. Professional Referee: ${app.professionalReferee || 'Not provided'}`,
    '===================================================================='
  );

  const safeName = (app.fullName || 'Applicant').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const safeRef = (app.applicationRef || app.id || 'REF').replace(/[^a-zA-Z0-9-]+/g, '');
  const filename = `GETIT_Dossier_${safeName}_${safeRef}.txt`;
  triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }), filename);
  return filename;
}
