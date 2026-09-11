'use strict';

const prisma = require('../../config/db');

const SURVEY_QUESTIONS = [
  { id: 'sq-01', number: 1, text: 'Store Leader / Buddy menyambut dan memperkenalkan saya dengan baik di hari pertama.', category: 'Orientasi & Sambutan', type: 'SCALE_0_10' },
  { id: 'sq-02', number: 2, text: 'Penjelasan mengenai visi, misi, dan nilai-nilai budaya Re.juve disampaikan dengan jelas.', category: 'Budaya Perusahaan', type: 'SCALE_0_10' },
  { id: 'sq-03', number: 3, text: 'Saya memahami alur kerja harian dan tanggung jawab posisi saya di gerai.', category: 'Pemahaman Peran', type: 'SCALE_0_10' },
  { id: 'sq-04', number: 4, text: 'Store Leader / Buddy memberikan pelatihan SOP higienitas dan sanitasi secara disiplin.', category: 'SOP & Sanitasi', type: 'SCALE_0_10' },
  { id: 'sq-05', number: 5, text: 'Peralatan kerja dan perlengkapan safety di gerai memadai serta berfungsi baik.', category: 'Fasilitas & Peralatan', type: 'SCALE_0_10' },
  { id: 'sq-06', number: 6, text: 'Buddy mendampingi saya saat pertama kali melayani pelanggan (hospitality practice).', category: 'Pendampingan Buddy', type: 'SCALE_0_10' },
  { id: 'sq-07', number: 7, text: 'Feedback atas performa kerja harian saya diberikan secara konstruktif dan membangun.', category: 'Evaluasi & Feedback', type: 'SCALE_0_10' },
  { id: 'sq-08', number: 8, text: 'Saya merasa nyaman bertanya atau berdiskusi bila mengalami kesulitan di gerai.', category: 'Komunikasi Tim', type: 'SCALE_0_10' },
  { id: 'sq-09', number: 9, text: 'Suhu chiller, display botol jus, dan FIFO dipraktikkan sesuai standar kualitas Re.juve.', category: 'Quality Control & Cold Chain', type: 'SCALE_0_10' },
  { id: 'sq-10', number: 10, text: 'Pelatihan pengoperasian POS kasir dan pencatatan transaksi mudah dipahami.', category: 'Kasir & Transaksi', type: 'SCALE_0_10' },
  { id: 'sq-11', number: 11, text: 'Pengelolaan waste, sampling, dan kebersihan area bar diajarkan secara terstruktur.', category: 'Operasional Bar', type: 'SCALE_0_10' },
  { id: 'sq-12', number: 12, text: 'Rekan kerja di gerai saling membantu dan memiliki kerja sama tim yang solid.', category: 'Kolaborasi Tim', type: 'SCALE_0_10' },
  { id: 'sq-13', number: 13, text: 'Store Leader memberikan teladan kedisiplinan dan kepemimpinan yang baik.', category: 'Kepemimpinan Store Leader', type: 'SCALE_0_10' },
  { id: 'sq-14', number: 14, text: 'Saya mendapatkan waktu istirahat dan jadwal kerja yang adil sesuai aturan.', category: 'Kesejahteraan Kerja', type: 'SCALE_0_10' },
  { id: 'sq-15', number: 15, text: 'Program Gamifikasi membantu saya memahami target dan misi onboarding dengan seru.', category: 'Gamifikasi & Motivasi', type: 'SCALE_0_10' },
  { id: 'sq-16', number: 16, text: 'Secara keseluruhan, saya puas dan bangga bergabung menjadi bagian dari Re.juve People.', category: 'Kepuasan Keseluruhan', type: 'SCALE_0_10' },
  { id: 'sq-17', number: 17, text: 'Tuliskan kesan, pesan, atau masukan untuk pengembangan program pendampingan onboarding Re.juve ke depannya.', category: 'Masukan & Saran', type: 'ESSAY' }
];

const getQuestions = () => {
  return SURVEY_QUESTIONS;
};

const submitSurvey = async ({ crewId, batchId = null, crewName, storeLocation, buddyName, ratings = {}, essayAnswer = '' }) => {
  // Hitung rata-rata skor kepuasan dari ratings (skala 0-10)
  const ratingValues = Object.values(ratings).filter(v => typeof v === 'number');
  const avgScore = ratingValues.length > 0
    ? parseFloat((ratingValues.reduce((acc, curr) => acc + curr, 0) / ratingValues.length).toFixed(1))
    : 10.0;

  // Cek apakah sudah pernah submit (1 kru 1 feedback per onboarding)
  const existing = await prisma.crewFeedback.findFirst({
    where: { crewId }
  });

  if (existing) {
    const updated = await prisma.crewFeedback.update({
      where: { feedbackId: existing.feedbackId },
      data: {
        batchId: batchId || existing.batchId,
        crewName: crewName || existing.crewName,
        storeLocation: storeLocation || existing.storeLocation,
        buddyName: buddyName || existing.buddyName,
        ratings,
        essayAnswer,
        avgScore,
        submittedAt: new Date()
      }
    });
    return updated;
  }

  const created = await prisma.crewFeedback.create({
    data: {
      crewId,
      batchId: batchId || null,
      crewName,
      storeLocation,
      buddyName,
      ratings,
      essayAnswer,
      avgScore,
      submittedAt: new Date()
    }
  });

  return created;
};

const getSurveys = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const where = {};
  if (query.batchId) where.batchId = query.batchId;
  if (query.crewId) where.crewId = query.crewId;
  if (query.storeLocation) {
    where.storeLocation = { contains: query.storeLocation, mode: 'insensitive' };
  }

  const [feedbacks, total] = await Promise.all([
    prisma.crewFeedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
      include: {
        crew: {
          select: { userId: true, name: true, email: true, departmentId: true }
        },
        batch: {
          select: { batchId: true, code: true, name: true }
        }
      }
    }),
    prisma.crewFeedback.count({ where })
  ]);

  return {
    data: feedbacks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

const getSurveyById = async (id) => {
  const feedback = await prisma.crewFeedback.findUnique({
    where: { feedbackId: id },
    include: {
      crew: {
        select: { userId: true, name: true, email: true, departmentId: true }
      },
      batch: {
        select: { batchId: true, code: true, name: true }
      }
    }
  });
  return feedback;
};

const getMyFeedback = async (crewId) => {
  const feedback = await prisma.crewFeedback.findFirst({
    where: { crewId },
    orderBy: { submittedAt: 'desc' }
  });
  return feedback;
};

module.exports = {
  getQuestions,
  submitSurvey,
  getSurveys,
  getSurveyById,
  getMyFeedback
};
