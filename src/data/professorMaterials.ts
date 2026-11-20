export interface ProfessorSlideFile {
  title: string;
  fileId: string;
  viewUrl: string;
  downloadUrl: string;
}

export interface ModulePptFolder {
  moduleId: 'm1' | 'm2' | 'm3' | 'm4' | 'm5';
  folderName: string;
  folderUrl: string;
  files: ProfessorSlideFile[];
}

function driveFile(title: string, fileId: string): ProfessorSlideFile {
  return {
    title,
    fileId,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export const PROFESSOR_SITE_LINKS = {
  downloadsPage: 'https://sites.google.com/view/swaminathandbms/downloads',
  courseMaterialsFolder: 'https://drive.google.com/drive/folders/164gkAwdws2F_hOIuM6BnW2tRaVIcolQe',
  pptRootFolder: 'https://drive.google.com/drive/folders/101dT_UMaQpKzmwMCSBbdG6cfEuesLzTx',
  modelQuestionPaper: driveFile(
    'BACSE202-DBS-Theory-Model_QP (1).pdf',
    '1UhBUZuoU13kQc33pzbFxTxEJVoskaM4r'
  ),
};

export const PROFESSOR_PPT_FOLDERS: Record<'m1' | 'm2' | 'm3' | 'm4' | 'm5', ModulePptFolder> = {
  m1: {
    moduleId: 'm1',
    folderName: 'Module_1',
    folderUrl: 'https://drive.google.com/drive/folders/1eKEJO68-Q_qvrBg-RgYo3HFle0j_GYy2',
    files: [
      driveFile('Module 1. Database Systems Concepts and Architecture..pptx', '1lCbNx8Xdu1ZI2JB7qnwqyiVd3VlJ7E2y'),
      driveFile('Module_0_DATA_(Pre_Requiste).pptx', '1k48iY8JikCKZJrIHhgDq50iOTs9YiWqa'),
    ],
  },
  m2: {
    moduleId: 'm2',
    folderName: 'Module_2',
    folderUrl: 'https://drive.google.com/drive/folders/1ImsoFOcSMh3Q1dxZ9t6EmV3FBpVHIcfg',
    files: [
      driveFile('Module 2. Relational Model and E-R Modeling.pptx', '1MkpIJiSpc39B_-fp11YMER7HhSPQSmmX'),
      driveFile('Module 2. Part 1 Relational Database Design.pptx', '1OCtLxxyEyc5k3LhXwFX9SaYLxiUoa-qa'),
      driveFile('Module 2. Part 2 Functional dependencies.pptx', '1nutBrSM_XLaTAt8aX6KLT-2Jja8Kp6pV'),
      driveFile('Module-2-Consolidated.ppt', '1RFBklmgDcj0tn1h3cTuTtF0t_JzPD4Z8'),
    ],
  },
  m3: {
    moduleId: 'm3',
    folderName: 'Module_3',
    folderUrl: 'https://drive.google.com/drive/folders/1CxNTyk58jtDN7_UB0a2K9TDpCO1vs8vi',
    files: [
      driveFile('BACSE202-DBS-Module-3_Complete.pptx', '1ntl5dELADH_2A37Xmpuav6Q6loJOvaOb'),
      driveFile('Module 3. Indexing.pptx', '1nCTxsZxIFUUINKXS0tSw6GhnpFgEgomz'),
      driveFile('Module 3. Hashing.pptx', '143Ren57OZF8BL1GcF-akP-Js5lB3hODD'),
      driveFile('Linear_Hashing_Numerical_Example.pptx', '1Ba3xLSaB_BmKYKt0UrAlhz6GBc0xpLye'),
      driveFile('Module 3. Relational Algebra.pptx', '1xNDUmM8-3SHAq0LHnAp-v6broR1Kfs58'),
      driveFile('Translating SQL queries to Relational Algebra.pptx', '1DMXwyYiK8aSypSfAEzx4ojWn-1lc423S'),
      driveFile('B+.docx', '1PKbcFbxU0JUs9lPo5bKyWI6-HE4HzQ_L'),
    ],
  },
  m4: {
    moduleId: 'm4',
    folderName: 'Module_4',
    folderUrl: 'https://drive.google.com/drive/folders/1UfDb-moP1zEPJgrdQQyMKk21lED_Jdqp',
    files: [
      driveFile('Module - 4 Transaction Processing and Recovery.pptx', '1ufXmLrC62lwTxVsz1LeMd7j0Y6fEAFvc'),
      driveFile('Module - 4 Database Concurrency Control Techniques.pptx', '1bzduFrI3IwEJ4xSvrTBm9QYpEWnA4fbV'),
      driveFile('Module-4.ppt', '1pbWH0XKqiJ2TiAcIYieInc7IkeJ6Qn77'),
    ],
  },
  m5: {
    moduleId: 'm5',
    folderName: 'Module_5',
    folderUrl: 'https://drive.google.com/drive/folders/1IKNCzvE2IxEbwEA4ZcTosHgX_G_U5OK6',
    files: [
      driveFile('BACSE202-DBS-Module-5.ppt', '1wJ710wfA8DyEn5lR4WjMIKmhNN_IwVZw'),
      driveFile('Module 5. No-SQL database management.pptx', '14qVhu1CNsISLCNvp3_0TVAzkDXO2j-PC'),
    ],
  },
};
