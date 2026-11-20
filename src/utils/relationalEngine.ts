// ============================================================================
// Module 3B: Relational Algebra, TRC & Heuristic Query-Tree Engine
// Pure, deterministic logic decoupled from UI for unit testing & FAT drills
// ============================================================================

export interface StudentTuple {
  sid: string;
  sname: string;
  dept: 'CSE' | 'ECE' | 'AI';
  cgpa: number;
}

export interface CourseTuple {
  cid: string;
  cname: string;
  dept: 'CSE' | 'ECE' | 'AI';
  credits: number;
}

export interface EnrollmentTuple {
  sid: string;
  cid: string;
  grade: 'S' | 'A' | 'B' | 'C';
}

export interface RelationalDataset {
  students: StudentTuple[];
  courses: CourseTuple[];
  enrollments: EnrollmentTuple[];
}

export const DEFAULT_DATASET: RelationalDataset = {
  students: [
    { sid: 'S1', sname: 'Aarav', dept: 'CSE', cgpa: 9.4 },
    { sid: 'S2', sname: 'Meera', dept: 'CSE', cgpa: 8.8 },
    { sid: 'S3', sname: 'Rohan', dept: 'AI', cgpa: 9.4 },
    { sid: 'S4', sname: 'Diya', dept: 'ECE', cgpa: 7.9 },
    { sid: 'S5', sname: 'Karthik', dept: 'CSE', cgpa: 8.2 },
  ],
  courses: [
    { cid: 'CS301', cname: 'DBMS', dept: 'CSE', credits: 4 },
    { cid: 'CS302', cname: 'OS', dept: 'CSE', credits: 4 },
    { cid: 'CS303', cname: 'CN', dept: 'CSE', credits: 3 },
    { cid: 'AI401', cname: 'ML', dept: 'AI', credits: 4 },
    { cid: 'EC201', cname: 'VLSI', dept: 'ECE', credits: 3 },
  ],
  enrollments: [
    // S1 (Aarav) took ALL 3 CSE courses + AI401
    { sid: 'S1', cid: 'CS301', grade: 'S' },
    { sid: 'S1', cid: 'CS302', grade: 'A' },
    { sid: 'S1', cid: 'CS303', grade: 'S' },
    { sid: 'S1', cid: 'AI401', grade: 'A' },
    // S2 (Meera) took ALL 3 CSE courses
    { sid: 'S2', cid: 'CS301', grade: 'A' },
    { sid: 'S2', cid: 'CS302', grade: 'S' },
    { sid: 'S2', cid: 'CS303', grade: 'B' },
    // S3 (Rohan) took 2 of 3 CSE courses + AI401 (missing CS303)
    { sid: 'S3', cid: 'CS301', grade: 'S' },
    { sid: 'S3', cid: 'CS302', grade: 'B' },
    { sid: 'S3', cid: 'AI401', grade: 'S' },
    // S4 (Diya) took EC201 + CS301
    { sid: 'S4', cid: 'EC201', grade: 'A' },
    { sid: 'S4', cid: 'CS301', grade: 'B' },
    // S5 (Karthik) has ZERO enrollments (ideal for Set Difference & ¬∃)
  ],
};

export function toggleEnrollmentTuple(
  enrollments: EnrollmentTuple[],
  sid: string,
  cid: string,
  defaultGrade: EnrollmentTuple['grade'] = 'A'
): EnrollmentTuple[] {
  const exists = enrollments.some((e) => e.sid === sid && e.cid === cid);
  if (exists) {
    return enrollments.filter((e) => !(e.sid === sid && e.cid === cid));
  }
  return [...enrollments, { sid, cid, grade: defaultGrade }];
}

// ============================================================================
// 1. Relational Algebra Evaluator (σ, π, ⋈, −, ÷)
// ============================================================================

export type RAQueryId =
  | 'selection_projection'
  | 'natural_join'
  | 'division'
  | 'set_difference'
  | 'max_cgpa_self_join'
  | 'high_credit_join';

export interface RAQueryParams {
  dept: 'CSE' | 'ECE' | 'AI';
  minCgpa: number;
  minCredits: number;
}

export interface RAStepTrace {
  stepNo: number;
  opName: string;
  formula: string;
  tupleCount: number;
  detail: string;
}

export interface DivisionProofBreakdown {
  divisorCourses: string[];
  t1Candidates: string[];
  t2Disqualified: Array<{ sid: string; sname: string; missingCourses: string[] }>;
  finalSids: string[];
}

export interface RAExecutionResult {
  queryId: RAQueryId;
  title: string;
  examTag: string;
  raFormula: string;
  sqlEquivalent: string;
  columns: string[];
  rows: Array<Record<string, string | number>>;
  steps: RAStepTrace[];
  divisionProof?: DivisionProofBreakdown;
}

export function evaluateRAQuery(
  queryId: RAQueryId,
  dataset: RelationalDataset,
  params: RAQueryParams
): RAExecutionResult {
  const { students, courses, enrollments } = dataset;
  const studentMap = new Map(students.map((s) => [s.sid, s]));
  const courseMap = new Map(courses.map((c) => [c.cid, c]));

  if (queryId === 'selection_projection') {
    const selected = students.filter(
      (s) => s.dept === params.dept && s.cgpa >= params.minCgpa
    );
    const projected = selected.map((s) => ({
      Sid: s.sid,
      Sname: s.sname,
      Cgpa: s.cgpa,
    }));
    return {
      queryId,
      title: 'Selection & Projection (σ + π)',
      examTag: 'Module 3B · Core Unary Ops',
      raFormula: `π_{Sid, Sname, Cgpa}( σ_{Dept='${params.dept}' ∧ Cgpa >= ${params.minCgpa.toFixed(1)}}(STUDENT) )`,
      sqlEquivalent: `SELECT DISTINCT Sid, Sname, Cgpa FROM STUDENT WHERE Dept = '${params.dept}' AND Cgpa >= ${params.minCgpa.toFixed(1)};`,
      columns: ['Sid', 'Sname', 'Cgpa'],
      rows: projected,
      steps: [
        {
          stepNo: 1,
          opName: 'Base Relation',
          formula: 'STUDENT',
          tupleCount: students.length,
          detail: `Scan all ${students.length} tuples in STUDENT.`,
        },
        {
          stepNo: 2,
          opName: 'Selection (σ)',
          formula: `σ_{Dept='${params.dept}' ∧ Cgpa >= ${params.minCgpa.toFixed(1)}}(STUDENT)`,
          tupleCount: selected.length,
          detail: `Filter rows matching Dept='${params.dept}' AND Cgpa >= ${params.minCgpa.toFixed(1)} -> ${selected.length} row(s).`,
        },
        {
          stepNo: 3,
          opName: 'Projection (π)',
          formula: 'π_{Sid, Sname, Cgpa}(...)',
          tupleCount: projected.length,
          detail: `Keep only {Sid, Sname, Cgpa} columns (set semantics removes duplicates).`,
        },
      ],
    };
  }

  if (queryId === 'natural_join') {
    const deptCourses = courses.filter((c) => c.dept === params.dept);
    const deptCourseSet = new Set(deptCourses.map((c) => c.cid));
    const joinedCE = enrollments
      .filter((e) => deptCourseSet.has(e.cid))
      .map((e) => ({ e, c: courseMap.get(e.cid)! }));
    const joinedAll = joinedCE
      .map(({ e, c }) => ({ e, c, s: studentMap.get(e.sid) }))
      .filter((x): x is { e: EnrollmentTuple; c: CourseTuple; s: StudentTuple } => Boolean(x.s));

    const rows = joinedAll.map(({ s, c, e }) => ({
      Sname: s.sname,
      Cid: c.cid,
      Cname: c.cname,
      Grade: e.grade,
    }));

    return {
      queryId,
      title: '3-Way Natural Join (⋈)',
      examTag: 'Model Q8 · Multi-Table Join',
      raFormula: `π_{Sname, Cid, Cname, Grade}( STUDENT ⋈ ENROLLMENT ⋈ σ_{Dept='${params.dept}'}(COURSE) )`,
      sqlEquivalent: `SELECT DISTINCT s.Sname, c.Cid, c.Cname, e.Grade FROM STUDENT s NATURAL JOIN ENROLLMENT e NATURAL JOIN COURSE c WHERE c.Dept = '${params.dept}';`,
      columns: ['Sname', 'Cid', 'Cname', 'Grade'],
      rows,
      steps: [
        {
          stepNo: 1,
          opName: 'Push Selection (σ)',
          formula: `C1 = σ_{Dept='${params.dept}'}(COURSE)`,
          tupleCount: deptCourses.length,
          detail: `Reduce COURSE from ${courses.length} to ${deptCourses.length} ${params.dept} course(s) before joining.`,
        },
        {
          stepNo: 2,
          opName: 'Natural Join on Cid (⋈)',
          formula: 'J1 = ENROLLMENT ⋈_{Cid} C1',
          tupleCount: joinedCE.length,
          detail: `Match ${enrollments.length} enrollments against ${deptCourses.length} courses on Cid -> ${joinedCE.length} matched tuple(s).`,
        },
        {
          stepNo: 3,
          opName: 'Natural Join on Sid (⋈)',
          formula: 'J2 = STUDENT ⋈_{Sid} J1',
          tupleCount: joinedAll.length,
          detail: `Attach student attributes on Sid -> ${joinedAll.length} tuple(s).`,
        },
        {
          stepNo: 4,
          opName: 'Final Projection (π)',
          formula: 'π_{Sname, Cid, Cname, Grade}(J2)',
          tupleCount: rows.length,
          detail: `Output ${rows.length} projected tuple(s).`,
        },
      ],
    };
  }

  if (queryId === 'division') {
    // R = π_{Sid, Cid}(ENROLLMENT), S = π_{Cid}(σ_{Dept=params.dept}(COURSE))
    const divisorCourses = courses
      .filter((c) => c.dept === params.dept)
      .map((c) => c.cid)
      .sort();

    // T1 = π_{Sid}(R)
    const t1Candidates = Array.from(new Set(enrollments.map((e) => e.sid))).sort();
    const enrolledPairs = new Set(enrollments.map((e) => `${e.sid}|${e.cid}`));

    // T2 = π_{Sid}((T1 × S) − R)
    const t2Disqualified: Array<{ sid: string; sname: string; missingCourses: string[] }> = [];
    const finalSids: string[] = [];

    for (const sid of t1Candidates) {
      const missing = divisorCourses.filter((cid) => !enrolledPairs.has(`${sid}|${cid}`));
      if (missing.length > 0) {
        t2Disqualified.push({
          sid,
          sname: studentMap.get(sid)?.sname ?? sid,
          missingCourses: missing,
        });
      } else if (divisorCourses.length > 0) {
        finalSids.push(sid);
      }
    }

    const rows = finalSids.map((sid) => {
      const st = studentMap.get(sid);
      return {
        Sid: sid,
        Sname: st?.sname ?? sid,
        Dept: st?.dept ?? '-',
        MatchedAll: `${divisorCourses.length}/${divisorCourses.length} (${divisorCourses.join(', ')})`,
      };
    });

    return {
      queryId,
      title: `Relational Division (÷) — Enrolled in ALL ${params.dept} Courses`,
      examTag: 'FAT High-Yield · "FOR ALL" Query',
      raFormula: `π_{Sid, Cid}(ENROLLMENT) ÷ π_{Cid}( σ_{Dept='${params.dept}'}(COURSE) )`,
      sqlEquivalent: `SELECT s.Sid, s.Sname FROM STUDENT s WHERE NOT EXISTS (SELECT c.Cid FROM COURSE c WHERE c.Dept = '${params.dept}' AND NOT EXISTS (SELECT 1 FROM ENROLLMENT e WHERE e.Sid = s.Sid AND e.Cid = c.Cid));`,
      columns: ['Sid', 'Sname', 'Dept', 'MatchedAll'],
      rows,
      steps: [
        {
          stepNo: 1,
          opName: 'Dividend R & Divisor S',
          formula: `R = π_{Sid,Cid}(ENROLLMENT), S = π_{Cid}(σ_{Dept='${params.dept}'}(COURSE))`,
          tupleCount: divisorCourses.length,
          detail: `S has ${divisorCourses.length} required course(s): {${divisorCourses.join(', ') || '∅'}}.`,
        },
        {
          stepNo: 2,
          opName: 'Step 1: T1 = π_{Sid}(R)',
          formula: 'T1 = π_{Sid}(ENROLLMENT)',
          tupleCount: t1Candidates.length,
          detail: `All candidate students with >=1 enrollment: {${t1Candidates.join(', ') || '∅'}}.`,
        },
        {
          stepNo: 3,
          opName: 'Step 2: T2 = π_{Sid}((T1 × S) − R)',
          formula: 'Disqualified candidates missing >=1 course in S',
          tupleCount: t2Disqualified.length,
          detail:
            t2Disqualified.length > 0
              ? `Disqualified: ${t2Disqualified.map((d) => `${d.sid} (missing ${d.missingCourses.join(', ')})`).join('; ')}.`
              : 'No enrolled candidate missed any course in S.',
        },
        {
          stepNo: 4,
          opName: 'Step 3: Result = T1 − T2',
          formula: 'R ÷ S = T1 − T2',
          tupleCount: finalSids.length,
          detail: `Students enrolled in EVERY ${params.dept} course: {${finalSids.join(', ') || '∅'}}.`,
        },
      ],
      divisionProof: {
        divisorCourses,
        t1Candidates,
        t2Disqualified,
        finalSids,
      },
    };
  }

  if (queryId === 'set_difference') {
    const enrolledSids = new Set(enrollments.map((e) => e.sid));
    const unenrolled = students.filter((s) => !enrolledSids.has(s.sid));
    const rows = unenrolled.map((s) => ({
      Sid: s.sid,
      Sname: s.sname,
      Dept: s.dept,
    }));

    return {
      queryId,
      title: 'Set Difference (−) — Students Never Enrolled',
      examTag: 'Module 3B · Anti-Join Pattern',
      raFormula: `π_{Sid, Sname, Dept}( STUDENT ⋈ ( π_{Sid}(STUDENT) − π_{Sid}(ENROLLMENT) ) )`,
      sqlEquivalent: `SELECT Sid, Sname, Dept FROM STUDENT WHERE Sid NOT IN (SELECT Sid FROM ENROLLMENT);`,
      columns: ['Sid', 'Sname', 'Dept'],
      rows,
      steps: [
        {
          stepNo: 1,
          opName: 'All Student IDs',
          formula: 'A = π_{Sid}(STUDENT)',
          tupleCount: students.length,
          detail: `{${students.map((s) => s.sid).join(', ')}} (${students.length} students).`,
        },
        {
          stepNo: 2,
          opName: 'Enrolled Student IDs',
          formula: 'B = π_{Sid}(ENROLLMENT)',
          tupleCount: enrolledSids.size,
          detail: `{${Array.from(enrolledSids).sort().join(', ') || '∅'}} (${enrolledSids.size} distinct enrolled).`,
        },
        {
          stepNo: 3,
          opName: 'Set Difference (A − B)',
          formula: 'A − B',
          tupleCount: unenrolled.length,
          detail: `Remaining Sid(s) not in ENROLLMENT: {${unenrolled.map((s) => s.sid).join(', ') || '∅'}}.`,
        },
      ],
    };
  }

  if (queryId === 'max_cgpa_self_join') {
    // Classic RA maximum without aggregate:
    // NonMax = π_{S1.Sid}( σ_{S1.Cgpa < S2.Cgpa}(ρ_{S1}(STUDENT) × ρ_{S2}(STUDENT)) )
    // Max = π_{Sid}(STUDENT) − NonMax
    const nonMaxSet = new Set<string>();
    let crossPairs = 0;
    let dominatedPairs = 0;
    for (const s1 of students) {
      for (const s2 of students) {
        crossPairs += 1;
        if (s1.cgpa < s2.cgpa) {
          dominatedPairs += 1;
          nonMaxSet.add(s1.sid);
        }
      }
    }
    const maxStudents = students.filter((s) => !nonMaxSet.has(s.sid));
    const rows = maxStudents.map((s) => ({
      Sid: s.sid,
      Sname: s.sname,
      Dept: s.dept,
      Cgpa: s.cgpa,
    }));

    return {
      queryId,
      title: 'Highest CGPA Without Aggregates (ρ + × + −)',
      examTag: 'FAT Trick Question · Self-Join Max',
      raFormula: `π_{Sid}(STUDENT) − π_{S1.Sid}( σ_{S1.Cgpa < S2.Cgpa}( ρ_{S1}(STUDENT) × ρ_{S2}(STUDENT) ) )`,
      sqlEquivalent: `SELECT Sid, Sname, Dept, Cgpa FROM STUDENT WHERE Cgpa = (SELECT MAX(Cgpa) FROM STUDENT);`,
      columns: ['Sid', 'Sname', 'Dept', 'Cgpa'],
      rows,
      steps: [
        {
          stepNo: 1,
          opName: 'Cartesian Self-Product (×)',
          formula: 'ρ_{S1}(STUDENT) × ρ_{S2}(STUDENT)',
          tupleCount: crossPairs,
          detail: `${students.length} × ${students.length} = ${crossPairs} ordered pairs.`,
        },
        {
          stepNo: 2,
          opName: 'Find Dominated Students (σ)',
          formula: 'NonMax = π_{S1.Sid}(σ_{S1.Cgpa < S2.Cgpa}(...))',
          tupleCount: nonMaxSet.size,
          detail: `${dominatedPairs} pairs satisfy S1.Cgpa < S2.Cgpa -> NonMax = {${Array.from(nonMaxSet).sort().join(', ')}}.`,
        },
        {
          stepNo: 3,
          opName: 'Subtract from All (−)',
          formula: 'π_{Sid}(STUDENT) − NonMax',
          tupleCount: maxStudents.length,
          detail: `Undominated max CGPA student(s): {${maxStudents.map((s) => `${s.sid} (${s.cgpa})`).join(', ')}}.`,
        },
      ],
    };
  }

  // high_credit_join (A1 Q6 pattern)
  const qualifyingCourses = courses.filter((c) => c.credits >= params.minCredits);
  const qualCourseSet = new Set(qualifyingCourses.map((c) => c.cid));
  const matched = enrollments
    .filter((e) => qualCourseSet.has(e.cid))
    .map((e) => {
      const s = studentMap.get(e.sid);
      const c = courseMap.get(e.cid);
      return s && c ? { s, c, e } : null;
    })
    .filter((x): x is { s: StudentTuple; c: CourseTuple; e: EnrollmentTuple } => Boolean(x));

  const rows = matched.map(({ s, c, e }) => ({
    Sname: s.sname,
    Cname: c.cname,
    Credits: c.credits,
    Grade: e.grade,
  }));

  return {
    queryId: 'high_credit_join',
    title: 'High-Credit Course Enrollments (A1 Q6 Pattern)',
    examTag: 'A1+TA1 Q6 · Filter + Join',
    raFormula: `π_{Sname, Cname, Credits, Grade}( STUDENT ⋈ ENROLLMENT ⋈ σ_{Credits >= ${params.minCredits}}(COURSE) )`,
    sqlEquivalent: `SELECT DISTINCT s.Sname, c.Cname, c.Credits, e.Grade FROM STUDENT s JOIN ENROLLMENT e ON s.Sid=e.Sid JOIN COURSE c ON e.Cid=c.Cid WHERE c.Credits >= ${params.minCredits};`,
    columns: ['Sname', 'Cname', 'Credits', 'Grade'],
    rows,
    steps: [
      {
        stepNo: 1,
        opName: 'Selection on COURSE (σ)',
        formula: `σ_{Credits >= ${params.minCredits}}(COURSE)`,
        tupleCount: qualifyingCourses.length,
        detail: `${qualifyingCourses.length} of ${courses.length} courses have Credits >= ${params.minCredits}.`,
      },
      {
        stepNo: 2,
        opName: 'Join with ENROLLMENT & STUDENT (⋈)',
        formula: 'STUDENT ⋈ ENROLLMENT ⋈ (...)',
        tupleCount: matched.length,
        detail: `Produces ${matched.length} student-course enrollment row(s).`,
      },
    ],
  };
}

// ============================================================================
// 2. Tuple Relational Calculus (TRC) Quantifier (∃ / ∀) Verifier
// ============================================================================

export type TRCQueryId =
  | 'exists_s_grade'
  | 'forall_all_dept_courses'
  | 'not_exists_unenrolled'
  | 'forall_max_cgpa';

export interface TRCTupleWitness {
  sid: string;
  sname: string;
  dept: string;
  cgpa: number;
  satisfies: boolean;
  witnessDetail: string;
}

export interface TRCExecutionResult {
  queryId: TRCQueryId;
  title: string;
  quantifierTag: string;
  trcFormula: string;
  equivalentRA: string;
  safetyStatus: 'SAFE';
  safetyReason: string;
  witnesses: TRCTupleWitness[];
  passingCount: number;
}

export function evaluateTRCQuery(
  queryId: TRCQueryId,
  dataset: RelationalDataset,
  dept: 'CSE' | 'ECE' | 'AI' = 'CSE'
): TRCExecutionResult {
  const { students, courses, enrollments } = dataset;

  if (queryId === 'exists_s_grade') {
    const witnesses: TRCTupleWitness[] = students.map((s) => {
      const sGrades = enrollments.filter((e) => e.sid === s.sid && e.grade === 'S');
      const satisfies = sGrades.length > 0;
      return {
        sid: s.sid,
        sname: s.sname,
        dept: s.dept,
        cgpa: s.cgpa,
        satisfies,
        witnessDetail: satisfies
          ? `Witness ∃e: ${sGrades.map((e) => `(${e.sid}, ${e.cid}, Grade='S')`).join(', ')}`
          : `No tuple e ∈ ENROLLMENT has e.Sid = '${s.sid}' ∧ e.Grade = 'S'`,
      };
    });

    return {
      queryId,
      title: "Existential (∃): Students with an 'S' Grade",
      quantifierTag: '∃e (Existential)',
      trcFormula: `{ s.Sid, s.Sname | STUDENT(s) ∧ ∃e ( ENROLLMENT(e) ∧ e.Sid = s.Sid ∧ e.Grade = 'S' ) }`,
      equivalentRA: `π_{Sid, Sname}( STUDENT ⋈ σ_{Grade='S'}(ENROLLMENT) )`,
      safetyStatus: 'SAFE',
      safetyReason:
        'Free tuple variable s is strictly range-restricted by STUDENT(s), and bound variable e is bounded by ENROLLMENT(e) -> finite domain dom(Q).',
      witnesses,
      passingCount: witnesses.filter((w) => w.satisfies).length,
    };
  }

  if (queryId === 'forall_all_dept_courses') {
    const targetCourses = courses.filter((c) => c.dept === dept);
    const enrolledPairs = new Set(enrollments.map((e) => `${e.sid}|${e.cid}`));

    const witnesses: TRCTupleWitness[] = students.map((s) => {
      const missing = targetCourses.filter((c) => !enrolledPairs.has(`${s.sid}|${c.cid}`));
      const satisfies = targetCourses.length > 0 && missing.length === 0;
      return {
        sid: s.sid,
        sname: s.sname,
        dept: s.dept,
        cgpa: s.cgpa,
        satisfies,
        witnessDetail: satisfies
          ? `∀c holds across all ${targetCourses.length} ${dept} courses: ${targetCourses.map((c) => c.cid).join(', ')}`
          : `Counterexample at c = ${missing[0]?.cid} (${missing[0]?.cname}): antecedent P(c) is TRUE, but ∃e is FALSE`,
      };
    });

    return {
      queryId,
      title: `Universal Implication (∀): Enrolled in ALL ${dept} Courses`,
      quantifierTag: '∀c (P(c) → ∃e Q(s,c,e))',
      trcFormula: `{ s.Sid, s.Sname | STUDENT(s) ∧ ∀c ( (COURSE(c) ∧ c.Dept = '${dept}') → ∃e (ENROLLMENT(e) ∧ e.Sid = s.Sid ∧ e.Cid = c.Cid) ) }`,
      equivalentRA: `π_{Sid, Cid}(ENROLLMENT) ÷ π_{Cid}( σ_{Dept='${dept}'}(COURSE) )`,
      safetyStatus: 'SAFE',
      safetyReason:
        'Implication ∀c (COURSE(c) → ...) is vacuously TRUE for non-COURSE tuples and only checks finite COURSE tuples; s is bounded by STUDENT(s).',
      witnesses,
      passingCount: witnesses.filter((w) => w.satisfies).length,
    };
  }

  if (queryId === 'not_exists_unenrolled') {
    const witnesses: TRCTupleWitness[] = students.map((s) => {
      const myEnrollments = enrollments.filter((e) => e.sid === s.sid);
      const satisfies = myEnrollments.length === 0;
      return {
        sid: s.sid,
        sname: s.sname,
        dept: s.dept,
        cgpa: s.cgpa,
        satisfies,
        witnessDetail: satisfies
          ? `¬∃e holds: zero tuples in ENROLLMENT reference Sid = '${s.sid}'`
          : `Fails ¬∃e: found counterexample e = (${myEnrollments[0].sid}, ${myEnrollments[0].cid}, ${myEnrollments[0].grade})`,
      };
    });

    return {
      queryId,
      title: 'Negated Existential (¬∃): Students with Zero Enrollments',
      quantifierTag: '¬∃e (Set Difference)',
      trcFormula: `{ s.Sid, s.Sname | STUDENT(s) ∧ ¬∃e ( ENROLLMENT(e) ∧ e.Sid = s.Sid ) }`,
      equivalentRA: `π_{Sid}(STUDENT) − π_{Sid}(ENROLLMENT)`,
      safetyStatus: 'SAFE',
      safetyReason:
        'Safe because STUDENT(s) positively bounds s before applying ¬∃e. Writing { s | ¬STUDENT(s) } alone would be UNSAFE (infinite complement).',
      witnesses,
      passingCount: witnesses.filter((w) => w.satisfies).length,
    };
  }

  // forall_max_cgpa
  const witnesses: TRCTupleWitness[] = students.map((s) => {
    const higher = students.find((s2) => s2.cgpa > s.cgpa);
    const satisfies = !higher;
    return {
      sid: s.sid,
      sname: s.sname,
      dept: s.dept,
      cgpa: s.cgpa,
      satisfies,
      witnessDetail: satisfies
        ? `∀s2 holds: s.Cgpa (${s.cgpa}) >= every student's CGPA`
        : `Counterexample s2 = ${higher.sid} (${higher.sname}, CGPA ${higher.cgpa} > ${s.cgpa})`,
    };
  });

  return {
    queryId: 'forall_max_cgpa',
    title: 'Universal Comparison (∀): Student(s) with Highest CGPA',
    quantifierTag: '∀s2 (Maximum)',
    trcFormula: `{ s.Sid, s.Sname | STUDENT(s) ∧ ∀s2 ( STUDENT(s2) → s.Cgpa >= s2.Cgpa ) }`,
    equivalentRA: `π_{Sid}(STUDENT) − π_{S1.Sid}( σ_{S1.Cgpa < S2.Cgpa}(ρ_{S1}(STUDENT) × ρ_{S2}(STUDENT)) )`,
    safetyStatus: 'SAFE',
    safetyReason:
      'Both s and s2 are restricted to finite relation STUDENT -> guaranteed finite output.',
    witnesses,
    passingCount: witnesses.filter((w) => w.satisfies).length,
  };
}

// ============================================================================
// 3. Heuristic Query-Tree Pushdown Optimizer (5-Stage Visualizer)
// ============================================================================

export type QueryTreePresetId = 'model_q8' | 'a1_q6_elmasri';

export interface QueryTreeCatalog {
  studentTuples: number;
  enrollmentTuples: number;
  courseTuples: number;
  deptSelectivity: number; // e.g., 0.2 means 20% of courses match Dept='CSE'
  gradeSelectivity: number; // e.g., 0.25 means 25% of enrollments have Grade='S'
}

export const QUERY_TREE_PRESETS: Record<
  QueryTreePresetId,
  {
    id: QueryTreePresetId;
    name: string;
    examTag: string;
    sql: string;
    relA: string;
    relB: string;
    relC: string;
    predC: string;
    predB: string;
    joinBC: string;
    joinAB: string;
    finalProj: string;
    projC: string;
    projB: string;
    projA: string;
    catalog: QueryTreeCatalog;
  }
> = {
  model_q8: {
    id: 'model_q8',
    name: 'Model Q8: Student–Enrollment–Course',
    examTag: 'Official Model QP Q8',
    sql: "SELECT s.Sname, c.Cname FROM STUDENT s, ENROLLMENT e, COURSE c WHERE s.Sid = e.Sid AND e.Cid = c.Cid AND c.Dept = 'CSE' AND e.Grade = 'S';",
    relA: 'STUDENT',
    relB: 'ENROLLMENT',
    relC: 'COURSE',
    predC: "Dept='CSE'",
    predB: "Grade='S'",
    joinBC: 'e.Cid=c.Cid',
    joinAB: 's.Sid=e.Sid',
    finalProj: 'Sname, Cname',
    projC: 'Cid, Cname',
    projB: 'Sid, Cid',
    projA: 'Sid, Sname',
    catalog: {
      studentTuples: 2000,
      enrollmentTuples: 10000,
      courseTuples: 100,
      deptSelectivity: 0.1,
      gradeSelectivity: 0.2,
    },
  },
  a1_q6_elmasri: {
    id: 'a1_q6_elmasri',
    name: 'A1 Q6: Employee–WorksOn–Project (Elmasri)',
    examTag: 'A1+TA1 Q6 / Classic Elmasri',
    sql: "SELECT e.Lname, p.Pname FROM EMPLOYEE e, WORKS_ON w, PROJECT p WHERE e.Ssn = w.Essn AND w.Pno = p.Pnumber AND p.Plocation = 'Chennai' AND w.Hours > 20;",
    relA: 'EMPLOYEE',
    relB: 'WORKS_ON',
    relC: 'PROJECT',
    predC: "Ploc='Chennai'",
    predB: 'Hours>20',
    joinBC: 'w.Pno=p.Pno',
    joinAB: 'e.Ssn=w.Essn',
    finalProj: 'Lname, Pname',
    projC: 'Pno, Pname',
    projB: 'Essn, Pno',
    projA: 'Ssn, Lname',
    catalog: {
      studentTuples: 5000,
      enrollmentTuples: 20000,
      courseTuples: 200,
      deptSelectivity: 0.05,
      gradeSelectivity: 0.15,
    },
  },
};

export interface QueryTreeNode {
  id: string;
  label: string;
  sublabel?: string;
  kind: 'proj' | 'sel' | 'join' | 'cross' | 'rel';
  tuples: number;
  rowBytes: number;
  x: number; // SVG x (0..640)
  y: number; // SVG y (0..320)
  highlight?: boolean;
}

export interface QueryTreeEdge {
  from: string;
  to: string;
  edgeTuples: number;
}

export interface QueryTreeStage {
  stageNo: number;
  title: string;
  ruleApplied: string;
  explanation: string;
  nodes: QueryTreeNode[];
  edges: QueryTreeEdge[];
  totalIntermediateTuples: number;
  totalIntermediateKB: number;
  reductionVsStage1Pct: number;
}

export function buildQueryTreeOptimizationStages(
  presetId: QueryTreePresetId,
  catalogOverride?: Partial<QueryTreeCatalog>
): QueryTreeStage[] {
  const p = QUERY_TREE_PRESETS[presetId];
  const cat: QueryTreeCatalog = { ...p.catalog, ...catalogOverride };

  const nA = Math.max(10, Math.round(cat.studentTuples));
  const nB = Math.max(10, Math.round(cat.enrollmentTuples));
  const nC = Math.max(5, Math.round(cat.courseTuples));
  const selC = Math.max(0.01, Math.min(1, cat.deptSelectivity));
  const selB = Math.max(0.01, Math.min(1, cat.gradeSelectivity));

  const filtC = Math.max(1, Math.round(nC * selC));
  const filtB = Math.max(1, Math.round(nB * selB));

  // Join cardinalities assuming uniform FK distribution (each B row references 1 A row and 1 C row)
  const joinBC_afterFilter = Math.max(1, Math.round(filtB * (filtC / nC)));
  const finalOut = joinBC_afterFilter;

  const crossAB = nA * nB;
  const crossABC = crossAB * nC;

  // Row widths in bytes (unprojected full schema vs projected slim tuples)
  const wA_full = 120;
  const wB_full = 60;
  const wC_full = 100;
  const wA_proj = 36;
  const wB_proj = 16;
  const wC_proj = 32;

  const sumStage = (nodes: QueryTreeNode[]) => {
    // Intermediate nodes exclude base leaves and measure every materialized/pipelined operator output
    const ops = nodes.filter((n) => n.kind !== 'rel');
    const totalTuples = ops.reduce((acc, n) => acc + n.tuples, 0);
    const totalBytes = ops.reduce((acc, n) => acc + n.tuples * n.rowBytes, 0);
    return { totalTuples, totalKB: Number((totalBytes / 1024).toFixed(1)) };
  };

  // Stage 1: Canonical Initial Query Tree (Cartesian Products at bottom, single giant σ at top)
  const s1Nodes: QueryTreeNode[] = [
    { id: 'proj', label: `π (${p.finalProj})`, kind: 'proj', tuples: finalOut, rowBytes: 48, x: 380, y: 32 },
    {
      id: 'sel_all',
      label: `σ (${p.joinAB} ∧ ${p.joinBC} ∧ ${p.predC} ∧ ${p.predB})`,
      kind: 'sel',
      tuples: finalOut,
      rowBytes: wA_full + wB_full + wC_full,
      x: 380,
      y: 96,
      highlight: true,
    },
    { id: 'x2', label: '× (Cartesian)', kind: 'cross', tuples: crossABC, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 164, highlight: true },
    { id: 'x1', label: '× (Cartesian)', kind: 'cross', tuples: crossAB, rowBytes: wA_full + wB_full, x: 240, y: 232, highlight: true },
    { id: 'rA', label: p.relA, kind: 'rel', tuples: nA, rowBytes: wA_full, x: 130, y: 300 },
    { id: 'rB', label: p.relB, kind: 'rel', tuples: nB, rowBytes: wB_full, x: 350, y: 300 },
    { id: 'rC', label: p.relC, kind: 'rel', tuples: nC, rowBytes: wC_full, x: 580, y: 232 },
  ];
  const s1Edges: QueryTreeEdge[] = [
    { from: 'proj', to: 'sel_all', edgeTuples: finalOut },
    { from: 'sel_all', to: 'x2', edgeTuples: crossABC },
    { from: 'x2', to: 'x1', edgeTuples: crossAB },
    { from: 'x2', to: 'rC', edgeTuples: nC },
    { from: 'x1', to: 'rA', edgeTuples: nA },
    { from: 'x1', to: 'rB', edgeTuples: nB },
  ];
  const s1Cost = sumStage(s1Nodes);

  // Stage 2: Rule 1 — Cascade / Break Conjunctive σ into individual selections
  const afterJoinAB_C = Math.max(finalOut, nB * nC);
  const s2Nodes: QueryTreeNode[] = [
    { id: 'proj', label: `π (${p.finalProj})`, kind: 'proj', tuples: finalOut, rowBytes: 48, x: 380, y: 28 },
    { id: 'sel_pred', label: `σ (${p.predC}) → σ (${p.predB})`, kind: 'sel', tuples: finalOut, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 84, highlight: true },
    { id: 'sel_join', label: `σ (${p.joinBC}) → σ (${p.joinAB})`, kind: 'sel', tuples: afterJoinAB_C, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 140, highlight: true },
    { id: 'x2', label: '× (Cartesian)', kind: 'cross', tuples: crossABC, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 198 },
    { id: 'x1', label: '× (Cartesian)', kind: 'cross', tuples: crossAB, rowBytes: wA_full + wB_full, x: 240, y: 254 },
    { id: 'rA', label: p.relA, kind: 'rel', tuples: nA, rowBytes: wA_full, x: 130, y: 308 },
    { id: 'rB', label: p.relB, kind: 'rel', tuples: nB, rowBytes: wB_full, x: 350, y: 308 },
    { id: 'rC', label: p.relC, kind: 'rel', tuples: nC, rowBytes: wC_full, x: 580, y: 254 },
  ];
  const s2Edges: QueryTreeEdge[] = [
    { from: 'proj', to: 'sel_pred', edgeTuples: finalOut },
    { from: 'sel_pred', to: 'sel_join', edgeTuples: afterJoinAB_C },
    { from: 'sel_join', to: 'x2', edgeTuples: crossABC },
    { from: 'x2', to: 'x1', edgeTuples: crossAB },
    { from: 'x2', to: 'rC', edgeTuples: nC },
    { from: 'x1', to: 'rA', edgeTuples: nA },
    { from: 'x1', to: 'rB', edgeTuples: nB },
  ];
  const s2Cost = sumStage(s2Nodes);

  // Stage 3: Rule 2 — Push Single-Relation σ Down to Leaves
  const crossA_filtB = nA * filtB;
  const crossAll_filt = crossA_filtB * filtC;
  const s3Nodes: QueryTreeNode[] = [
    { id: 'proj', label: `π (${p.finalProj})`, kind: 'proj', tuples: finalOut, rowBytes: 48, x: 380, y: 28 },
    { id: 'sel_join', label: `σ (${p.joinAB} ∧ ${p.joinBC})`, kind: 'sel', tuples: finalOut, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 84 },
    { id: 'x2', label: '× (Cartesian)', kind: 'cross', tuples: crossAll_filt, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 144 },
    { id: 'x1', label: '× (Cartesian)', kind: 'cross', tuples: crossA_filtB, rowBytes: wA_full + wB_full, x: 230, y: 204 },
    { id: 'rA', label: p.relA, kind: 'rel', tuples: nA, rowBytes: wA_full, x: 115, y: 304 },
    { id: 'selB', label: `σ (${p.predB})`, kind: 'sel', tuples: filtB, rowBytes: wB_full, x: 350, y: 254, highlight: true },
    { id: 'rB', label: p.relB, kind: 'rel', tuples: nB, rowBytes: wB_full, x: 350, y: 308 },
    { id: 'selC', label: `σ (${p.predC})`, kind: 'sel', tuples: filtC, rowBytes: wC_full, x: 605, y: 204, highlight: true },
    { id: 'rC', label: p.relC, kind: 'rel', tuples: nC, rowBytes: wC_full, x: 605, y: 304 },
  ];
  const s3Edges: QueryTreeEdge[] = [
    { from: 'proj', to: 'sel_join', edgeTuples: finalOut },
    { from: 'sel_join', to: 'x2', edgeTuples: crossAll_filt },
    { from: 'x2', to: 'x1', edgeTuples: crossA_filtB },
    { from: 'x2', to: 'selC', edgeTuples: filtC },
    { from: 'selC', to: 'rC', edgeTuples: nC },
    { from: 'x1', to: 'rA', edgeTuples: nA },
    { from: 'x1', to: 'selB', edgeTuples: filtB },
    { from: 'selB', to: 'rB', edgeTuples: nB },
  ];
  const s3Cost = sumStage(s3Nodes);

  // Stage 4: Rule 3 — Replace × + Join σ with ⋈ & Reorder Most Restrictive Leaves First (B ⋈ C before A)
  const s4Nodes: QueryTreeNode[] = [
    { id: 'proj', label: `π (${p.finalProj})`, kind: 'proj', tuples: finalOut, rowBytes: 48, x: 380, y: 30 },
    { id: 'j2', label: `⋈ (${p.joinAB})`, kind: 'join', tuples: finalOut, rowBytes: wA_full + wB_full + wC_full, x: 380, y: 94, highlight: true },
    { id: 'j1', label: `⋈ (${p.joinBC})`, kind: 'join', tuples: joinBC_afterFilter, rowBytes: wB_full + wC_full, x: 510, y: 164, highlight: true },
    { id: 'rA', label: p.relA, kind: 'rel', tuples: nA, rowBytes: wA_full, x: 145, y: 234 },
    { id: 'selB', label: `σ (${p.predB})`, kind: 'sel', tuples: filtB, rowBytes: wB_full, x: 385, y: 238 },
    { id: 'rB', label: p.relB, kind: 'rel', tuples: nB, rowBytes: wB_full, x: 385, y: 304 },
    { id: 'selC', label: `σ (${p.predC})`, kind: 'sel', tuples: filtC, rowBytes: wC_full, x: 630, y: 238 },
    { id: 'rC', label: p.relC, kind: 'rel', tuples: nC, rowBytes: wC_full, x: 630, y: 304 },
  ];
  const s4Edges: QueryTreeEdge[] = [
    { from: 'proj', to: 'j2', edgeTuples: finalOut },
    { from: 'j2', to: 'rA', edgeTuples: nA },
    { from: 'j2', to: 'j1', edgeTuples: joinBC_afterFilter },
    { from: 'j1', to: 'selB', edgeTuples: filtB },
    { from: 'selB', to: 'rB', edgeTuples: nB },
    { from: 'j1', to: 'selC', edgeTuples: filtC },
    { from: 'selC', to: 'rC', edgeTuples: nC },
  ];
  const s4Cost = sumStage(s4Nodes);

  // Stage 5: Rule 4 — Push Projections (π) Down to Strip Unused Columns Early
  const s5Nodes: QueryTreeNode[] = [
    { id: 'proj', label: `π (${p.finalProj})`, kind: 'proj', tuples: finalOut, rowBytes: 48, x: 370, y: 28 },
    { id: 'j2', label: `⋈ (${p.joinAB})`, kind: 'join', tuples: finalOut, rowBytes: wA_proj + wC_proj, x: 370, y: 86 },
    { id: 'pA', label: `π (${p.projA})`, kind: 'proj', tuples: nA, rowBytes: wA_proj, x: 115, y: 156, highlight: true },
    { id: 'rA', label: p.relA, kind: 'rel', tuples: nA, rowBytes: wA_full, x: 115, y: 234 },
    { id: 'j1', label: `⋈ (${p.joinBC})`, kind: 'join', tuples: joinBC_afterFilter, rowBytes: wB_proj + wC_proj, x: 505, y: 152 },
    { id: 'pB', label: `π(${p.projB}) · σ(${p.predB})`, kind: 'proj', tuples: filtB, rowBytes: wB_proj, x: 365, y: 234, highlight: true },
    { id: 'rB', label: p.relB, kind: 'rel', tuples: nB, rowBytes: wB_full, x: 365, y: 306 },
    { id: 'pC', label: `π(${p.projC}) · σ(${p.predC})`, kind: 'proj', tuples: filtC, rowBytes: wC_proj, x: 635, y: 234, highlight: true },
    { id: 'rC', label: p.relC, kind: 'rel', tuples: nC, rowBytes: wC_full, x: 635, y: 306 },
  ];
  const s5Edges: QueryTreeEdge[] = [
    { from: 'proj', to: 'j2', edgeTuples: finalOut },
    { from: 'j2', to: 'pA', edgeTuples: nA },
    { from: 'pA', to: 'rA', edgeTuples: nA },
    { from: 'j2', to: 'j1', edgeTuples: joinBC_afterFilter },
    { from: 'j1', to: 'pB', edgeTuples: filtB },
    { from: 'pB', to: 'rB', edgeTuples: nB },
    { from: 'j1', to: 'pC', edgeTuples: filtC },
    { from: 'pC', to: 'rC', edgeTuples: nC },
  ];
  const s5Cost = sumStage(s5Nodes);

  const pct = (cur: number) =>
    s1Cost.totalTuples <= 0
      ? 0
      : Number(Math.max(0, ((s1Cost.totalTuples - cur) / s1Cost.totalTuples) * 100).toFixed(4));

  return [
    {
      stageNo: 1,
      title: 'Canonical Initial Query Tree',
      ruleApplied: 'Direct SQL → RA Parse Tree (No Optimization)',
      explanation: `Forms giant Cartesian products (${p.relA} × ${p.relB} × ${p.relC} = ${crossABC.toLocaleString()} intermediate tuples!) before applying any WHERE condition.`,
      nodes: s1Nodes,
      edges: s1Edges,
      totalIntermediateTuples: s1Cost.totalTuples,
      totalIntermediateKB: s1Cost.totalKB,
      reductionVsStage1Pct: 0,
    },
    {
      stageNo: 2,
      title: 'Break Conjunctive Selections (Cascade of σ)',
      ruleApplied: 'Heuristic Rule 1: σ_{c1 ∧ c2}(R) ≡ σ_{c1}(σ_{c2}(R))',
      explanation:
        'Splits the monolithic WHERE selection into atomic selection nodes so single-table predicates can migrate downward independently.',
      nodes: s2Nodes,
      edges: s2Edges,
      totalIntermediateTuples: s2Cost.totalTuples,
      totalIntermediateKB: s2Cost.totalKB,
      reductionVsStage1Pct: pct(s2Cost.totalTuples),
    },
    {
      stageNo: 3,
      title: 'Push Single-Relation σ Down to Leaves',
      ruleApplied: 'Heuristic Rule 2: Commute σ with × / ⋈',
      explanation: `Applies σ(${p.predB}) directly on ${p.relB} (${nB.toLocaleString()} → ${filtB.toLocaleString()}) and σ(${p.predC}) directly on ${p.relC} (${nC.toLocaleString()} → ${filtC.toLocaleString()}) before combining tables.`,
      nodes: s3Nodes,
      edges: s3Edges,
      totalIntermediateTuples: s3Cost.totalTuples,
      totalIntermediateKB: s3Cost.totalKB,
      reductionVsStage1Pct: pct(s3Cost.totalTuples),
    },
    {
      stageNo: 4,
      title: 'Replace × + σ with ⋈ & Reorder Most Restrictive First',
      ruleApplied: 'Heuristic Rules 3 & 4: Associativity of ⋈ + Restrictive Leaf Ordering',
      explanation: `Eliminates Cartesian products completely and joins the two filtered relations (${p.relB} ⋈ ${p.relC} = ${joinBC_afterFilter.toLocaleString()} tuples) BEFORE joining with ${p.relA}.`,
      nodes: s4Nodes,
      edges: s4Edges,
      totalIntermediateTuples: s4Cost.totalTuples,
      totalIntermediateKB: s4Cost.totalKB,
      reductionVsStage1Pct: pct(s4Cost.totalTuples),
    },
    {
      stageNo: 5,
      title: 'Push Projections (π) Down to Strip Unused Columns',
      ruleApplied: 'Heuristic Rule 5: Cascade & Commute π (Keep Only Join + Output Attrs)',
      explanation: `Projects only needed join & output attributes at leaves (${p.projA}, ${p.projB}, ${p.projC}), slashing intermediate tuple width in bytes from ${s4Cost.totalKB.toLocaleString()} KB down to ${s5Cost.totalKB.toLocaleString()} KB!`,
      nodes: s5Nodes,
      edges: s5Edges,
      totalIntermediateTuples: s5Cost.totalTuples,
      totalIntermediateKB: s5Cost.totalKB,
      reductionVsStage1Pct: pct(s5Cost.totalTuples),
    },
  ];
}
