import jsPDF from 'jspdf';
import { Grade, Student, Subject } from '../types';

interface ExportPdfOptions {
  student: Student;
  subjects: Subject[];
  grades: Grade[];
  overallAvgSem1: number | null;
  overallAvgSem2: number | null;
  overallAvgFull: number | null;
  attendanceRate?: number;
  schoolName?: string;
  schoolCity?: string;
  academicYear?: string;
  semester?: 1 | 2;
}

// Clean Polish characters for standard PDF 14 font compatibility
function sanitizePolishChars(str: string): string {
  const map: Record<string, string> = {
    'ą': 'a', 'Ą': 'A',
    'ć': 'c', 'Ć': 'C',
    'ę': 'e', 'Ę': 'E',
    'ł': 'l', 'Ł': 'L',
    'ń': 'n', 'Ń': 'N',
    'ó': 'o', 'Ó': 'O',
    'ś': 's', 'Ś': 'S',
    'ź': 'z', 'Ź': 'Z',
    'ż': 'z', 'Ż': 'Z',
  };
  return str.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => map[match] || match);
}

export function generateGradesPdf({
  student,
  subjects,
  grades,
  overallAvgSem1,
  overallAvgSem2,
  overallAvgFull,
  attendanceRate = 94.2,
  schoolName = 'XIV Liceum Ogolnoksztalcace im. Stanislawa Staszica',
  schoolCity = 'Warszawa',
  academicYear = '2025/2026',
  semester = 2,
}: ExportPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('pl-PL');

  // --- Header ---
  doc.setFillColor(26, 54, 93); // #1a365d navy
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(sanitizePolishChars(schoolName).toUpperCase(), pageWidth / 2, 9, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Dziennik Elektroniczny EduSynergia | ${sanitizePolishChars(schoolCity)} | Rok ${academicYear} | Semestr ${semester === 1 ? 'I' : 'II'}`,
    pageWidth / 2,
    16,
    { align: 'center' }
  );

  // --- Document Title ---
  doc.setTextColor(26, 54, 93);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('KARTA OSIAGNIEC EDUKACYJNYCH UCZNIA', pageWidth / 2, 33, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Wydruk urzedowy z dnia: ${todayStr}`, pageWidth / 2, 38, { align: 'center' });

  // --- Student Info Box ---
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Uczen: ${sanitizePolishChars(student.firstName)} ${sanitizePolishChars(student.lastName)}`, 18, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Oddzial: Klasa ${student.className}`, 18, 55);
  doc.text(`Nr w dzienniku: ${student.numberInJournal}`, 70, 55);
  doc.text(`PESEL: ${student.pesel || '08251203492'}`, 120, 55);

  doc.text(`Wychowawca: mgr Tomasz Kowalczyk`, 18, 60);
  doc.text(`Frekwencja: ${attendanceRate}%`, 120, 60);

  // --- Grades Table ---
  let y = 70;

  // Table header
  doc.setFillColor(26, 54, 93);
  doc.rect(14, y, pageWidth - 28, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  doc.text('Lp.', 16, y + 5);
  doc.text('Przedmiot nauczania', 24, y + 5);
  doc.text('Oceny Sem. I', 78, y + 5);
  doc.text('Sr. I', 114, y + 5);
  doc.text('Oceny Sem. II', 124, y + 5);
  doc.text('Sr. II', 160, y + 5);
  doc.text('Roczna', 170, y + 5);
  doc.text('Ocena konc.', 183, y + 5);

  y += 7;

  // Table rows
  subjects.forEach((sub, idx) => {
    const subGradesSem1 = grades.filter(
      g => g.studentId === student.id && g.subjectId === sub.id && g.semester === 1
    );
    const subGradesSem2 = grades.filter(
      g => g.studentId === student.id && g.subjectId === sub.id && g.semester === 2
    );

    const sem1Str = subGradesSem1.map(g => g.value).join(', ') || '-';
    const sem2Str = subGradesSem2.map(g => g.value).join(', ') || '-';

    // Calculate averages
    const calcAvg = (list: Grade[]) => {
      const active = list.filter(g => g.countToAverage);
      if (active.length === 0) return '-';
      const sum = active.reduce((acc, curr) => acc + curr.numericValue * curr.weight, 0);
      const totalW = active.reduce((acc, curr) => acc + curr.weight, 0);
      return totalW > 0 ? (sum / totalW).toFixed(2) : '-';
    };

    const avg1 = calcAvg(subGradesSem1);
    const avg2 = calcAvg(subGradesSem2);

    const fullGrades = [...subGradesSem1, ...subGradesSem2];
    const avgFull = calcAvg(fullGrades);

    let finalGrade = '-';
    if (avgFull !== '-') {
      const num = parseFloat(avgFull);
      if (num >= 5.6) finalGrade = '6 (cel)';
      else if (num >= 4.75) finalGrade = '5 (bdb)';
      else if (num >= 3.75) finalGrade = '4 (db)';
      else if (num >= 2.75) finalGrade = '3 (dst)';
      else if (num >= 1.85) finalGrade = '2 (dop)';
      else finalGrade = '1 (ndst)';
    }

    // Row zebra background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }

    // Row borders
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`${idx + 1}.`, 16, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePolishChars(sub.name).substring(0, 26), 24, y + 4.5);
    doc.setFont('helvetica', 'normal');

    // Truncate long grades list if necessary
    doc.text(sem1Str.substring(0, 18), 78, y + 4.5);
    doc.text(avg1, 114, y + 4.5);
    doc.text(sem2Str.substring(0, 18), 124, y + 4.5);
    doc.text(avg2, 160, y + 4.5);
    doc.text(avgFull, 170, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(finalGrade, 183, y + 4.5);

    y += 6.5;
  });

  // --- Summary Card at bottom ---
  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 54, 93);
  doc.text('PODSUMOWANIE WYNIKOW W NAUCE:', 18, y + 7);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const fullAvgText = overallAvgFull !== null ? overallAvgFull.toFixed(2) : '-';
  const sem1AvgText = overallAvgSem1 !== null ? overallAvgSem1.toFixed(2) : '-';
  const sem2AvgText = overallAvgSem2 !== null ? overallAvgSem2.toFixed(2) : '-';

  doc.text(
    `Srednia Semestr I: ${sem1AvgText}    |    Srednia Semestr II: ${sem2AvgText}    |    Srednia roczna: ${fullAvgText}`,
    18,
    y + 13
  );

  if (overallAvgFull !== null && overallAvgFull >= 4.75) {
    doc.setTextColor(180, 83, 9); // amber
    doc.setFont('helvetica', 'bold');
    doc.text('WYROZNIENIE: Swiadectwo z biało-czerwonym paskiem (srednia >= 4.75)', 18, y + 18);
  } else {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Status: Promocja do klasy programowo wyzszej', 18, y + 18);
  }

  // --- Signatures ---
  y += 30;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, y, 75, y);
  doc.line(pageWidth - 75, y, pageWidth - 24, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Podpis wychowawcy klasy', 35, y + 4);
  doc.text('Pieczec i podpis Dyrektora Szkoly', pageWidth - 65, y + 4);

  // Footer note
  doc.setFontSize(7);
  doc.text('Dokument wygenerowany z autoryzowanego systemu dziennika elektronicznego EduSynergia.', pageWidth / 2, 285, {
    align: 'center',
  });

  // Save the PDF
  const filename = `Zestawienie_Ocen_${sanitizePolishChars(student.lastName)}_${sanitizePolishChars(student.firstName)}_${todayStr.replace(/\./g, '-')}.pdf`;
  doc.save(filename);
}
