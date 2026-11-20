// ============================================================================
// #12: Module 1 Integrity Constraint Violation & Referential Action Tracer
// Pure, deterministic relational constraint engine decoupled from UI
// Covers Domain, Key, Entity Integrity (NULL PK), Referential Integrity
// and SQL Referential Actions: RESTRICT, CASCADE, SET NULL, SET DEFAULT
// ============================================================================

export type ConstraintType =
  | 'DOMAIN'
  | 'ENTITY_INTEGRITY'
  | 'KEY'
  | 'REFERENTIAL_INTEGRITY';

export type ReferentialAction = 'RESTRICT' | 'CASCADE' | 'SET_NULL' | 'SET_DEFAULT';

export interface DeptRow {
  dno: number;
  dname: string;
  location: string;
}

export interface EmpRow {
  empId: number;
  name: string;
  salary: number;
  dno: number | null;
}

export interface IntegrityDbState {
  departments: DeptRow[];
  employees: EmpRow[];
  defaultDno: number;
}

export const INITIAL_INTEGRITY_DB: IntegrityDbState = {
  defaultDno: 99,
  departments: [
    { dno: 10, dname: 'CSE', location: 'AB1-North' },
    { dno: 20, dname: 'ECE', location: 'AB2-East' },
    { dno: 30, dname: 'AI & Data', location: 'AB3-West' },
    { dno: 40, dname: 'Mechanical', location: 'AB4-South' },
    { dno: 99, dname: 'Unassigned (Default)', location: 'Admin Block' },
  ],
  employees: [
    { empId: 101, name: 'Ananya', salary: 90000, dno: 10 },
    { empId: 102, name: 'Vikram', salary: 75000, dno: 10 },
    { empId: 103, name: 'Neha', salary: 82000, dno: 20 },
    { empId: 104, name: 'Arjun', salary: 68000, dno: 30 },
    { empId: 105, name: 'Priya', salary: 71000, dno: null },
  ],
};

export function cloneIntegrityDb(db: IntegrityDbState = INITIAL_INTEGRITY_DB): IntegrityDbState {
  return {
    defaultDno: db.defaultDno,
    departments: db.departments.map((d) => ({ ...d })),
    employees: db.employees.map((e) => ({ ...e })),
  };
}

export type IntegrityOperation =
  | {
      kind: 'INSERT_EMP';
      empId: number | null;
      name: string;
      salary: number | string;
      dno: number | null;
    }
  | {
      kind: 'DELETE_DEPT';
      dno: number;
      action: ReferentialAction;
    }
  | {
      kind: 'UPDATE_DEPT_PK';
      oldDno: number;
      newDno: number | null;
      action: ReferentialAction;
    }
  | {
      kind: 'UPDATE_EMP_FK';
      empId: number;
      newDno: number | null;
    };

export interface ConstraintCheckStatus {
  type: ConstraintType;
  label: string;
  passed: boolean;
  detail: string;
}

export interface IntegrityEvalResult {
  accepted: boolean;
  verdictLabel: string;
  violatedConstraints: ConstraintType[];
  checks: ConstraintCheckStatus[];
  sqlPreview: string;
  explanation: string;
  affectedEmpIds: number[];
  nextDb: IntegrityDbState;
}

export interface ReferentialActionComparison {
  action: ReferentialAction;
  accepted: boolean;
  summary: string;
  affectedEmpIds: number[];
  resultingDeptCount: number;
  resultingEmpCount: number;
}

export interface IntegrityPreset {
  id: string;
  name: string;
  examTag: string;
  op: IntegrityOperation;
}

export const INTEGRITY_PRESETS: IntegrityPreset[] = [
  {
    id: 'a1_null_pk',
    name: 'A1 Q2(a): INSERT EMP with NULL PK',
    examTag: 'Entity Integrity Violation',
    op: { kind: 'INSERT_EMP', empId: null, name: 'Rohan', salary: 65000, dno: 10 },
  },
  {
    id: 'a1_dup_pk',
    name: 'A1 Q2(b): INSERT Duplicate EmpID (101)',
    examTag: 'Key Constraint Violation',
    op: { kind: 'INSERT_EMP', empId: 101, name: 'Rohan', salary: 65000, dno: 10 },
  },
  {
    id: 'a1_bad_domain',
    name: 'A1 Q2(c): INSERT Negative Salary (-5000)',
    examTag: 'Domain Constraint Violation',
    op: { kind: 'INSERT_EMP', empId: 106, name: 'Rohan', salary: -5000, dno: 10 },
  },
  {
    id: 'a1_bad_fk',
    name: 'A1 Q2(d): INSERT Missing Dept (Dno = 55)',
    examTag: 'Referential Integrity Violation',
    op: { kind: 'INSERT_EMP', empId: 106, name: 'Rohan', salary: 65000, dno: 55 },
  },
  {
    id: 'a2_null_fk_ok',
    name: 'A2 Q2(a): INSERT EMP with Dno = NULL',
    examTag: 'Valid (Nullable FK Allowed)',
    op: { kind: 'INSERT_EMP', empId: 106, name: 'Meera', salary: 72000, dno: null },
  },
  {
    id: 'a2_delete_referenced',
    name: 'A2 Q2(b): DELETE Referenced Dept (Dno = 10)',
    examTag: 'Compare RESTRICT / CASCADE / SET NULL / DEFAULT',
    op: { kind: 'DELETE_DEPT', dno: 10, action: 'RESTRICT' },
  },
  {
    id: 'a2_delete_empty',
    name: 'A2 Q2(c): DELETE Empty Dept (Dno = 40)',
    examTag: 'Valid (0 Child Tuples)',
    op: { kind: 'DELETE_DEPT', dno: 40, action: 'RESTRICT' },
  },
  {
    id: 'a2_update_parent_pk',
    name: 'A2 Q2(d): UPDATE Parent PK (Dno 20 → 25)',
    examTag: 'ON UPDATE Referential Actions',
    op: { kind: 'UPDATE_DEPT_PK', oldDno: 20, newDno: 25, action: 'CASCADE' },
  },
];

export function formatSqlPreview(op: IntegrityOperation): string {
  switch (op.kind) {
    case 'INSERT_EMP':
      return `INSERT INTO EMPLOYEE (EmpID, Name, Salary, Dno) VALUES (${
        op.empId === null ? 'NULL' : op.empId
      }, '${op.name}', ${typeof op.salary === 'string' ? `'${op.salary}'` : op.salary}, ${
        op.dno === null ? 'NULL' : op.dno
      });`;
    case 'DELETE_DEPT':
      return `DELETE FROM DEPARTMENT WHERE Dno = ${op.dno};  -- ON DELETE ${op.action.replace('_', ' ')}`;
    case 'UPDATE_DEPT_PK':
      return `UPDATE DEPARTMENT SET Dno = ${
        op.newDno === null ? 'NULL' : op.newDno
      } WHERE Dno = ${op.oldDno};  -- ON UPDATE ${op.action.replace('_', ' ')}`;
    case 'UPDATE_EMP_FK':
      return `UPDATE EMPLOYEE SET Dno = ${
        op.newDno === null ? 'NULL' : op.newDno
      } WHERE EmpID = ${op.empId};`;
  }
}

export function evaluateIntegrityOperation(
  db: IntegrityDbState,
  op: IntegrityOperation
): IntegrityEvalResult {
  const nextDb = cloneIntegrityDb(db);
  const sqlPreview = formatSqlPreview(op);

  // Default all-pass checks
  const checks: Record<ConstraintType, ConstraintCheckStatus> = {
    DOMAIN: {
      type: 'DOMAIN',
      label: 'Domain Constraint',
      passed: true,
      detail: 'All attribute values match declared data types & CHECK bounds.',
    },
    ENTITY_INTEGRITY: {
      type: 'ENTITY_INTEGRITY',
      label: 'Entity Integrity',
      passed: true,
      detail: 'Primary key is NOT NULL.',
    },
    KEY: {
      type: 'KEY',
      label: 'Key Uniqueness',
      passed: true,
      detail: 'Primary key value is unique across all tuples.',
    },
    REFERENTIAL_INTEGRITY: {
      type: 'REFERENTIAL_INTEGRITY',
      label: 'Referential Integrity',
      passed: true,
      detail: 'Every non-NULL foreign key matches an existing parent primary key.',
    },
  };

  if (op.kind === 'INSERT_EMP') {
    const parsedSalary = typeof op.salary === 'number' ? op.salary : Number(op.salary);
    const domainIssues: string[] = [];
    if (!op.name.trim()) domainIssues.push('Name cannot be blank');
    if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
      domainIssues.push(`Salary (${op.salary}) violates CHECK (Salary > 0) / INT domain`);
    }
    if (op.empId !== null && (!Number.isInteger(op.empId) || op.empId <= 0)) {
      domainIssues.push(`EmpID (${op.empId}) must be a positive integer`);
    }
    if (domainIssues.length > 0) {
      checks.DOMAIN = {
        type: 'DOMAIN',
        label: 'Domain Constraint',
        passed: false,
        detail: domainIssues.join('; ') + '.',
      };
    }

    if (op.empId === null) {
      checks.ENTITY_INTEGRITY = {
        type: 'ENTITY_INTEGRITY',
        label: 'Entity Integrity',
        passed: false,
        detail: 'EmpID is the PRIMARY KEY of EMPLOYEE and cannot be NULL!',
      };
    } else if (db.employees.some((e) => e.empId === op.empId)) {
      checks.KEY = {
        type: 'KEY',
        label: 'Key Uniqueness',
        passed: false,
        detail: `Duplicate Primary Key: EmpID = ${op.empId} already exists in EMPLOYEE.`,
      };
    }

    if (op.dno !== null && !db.departments.some((d) => d.dno === op.dno)) {
      checks.REFERENTIAL_INTEGRITY = {
        type: 'REFERENTIAL_INTEGRITY',
        label: 'Referential Integrity',
        passed: false,
        detail: `Foreign Key Dno = ${op.dno} does not exist in DEPARTMENT(Dno).`,
      };
    }

    const checkList = Object.values(checks);
    const violated = checkList.filter((c) => !c.passed).map((c) => c.type);

    if (violated.length > 0) {
      return {
        accepted: false,
        verdictLabel: `REJECTED (${violated.map((v) => v.replace('_', ' ')).join(' + ')})`,
        violatedConstraints: violated,
        checks: checkList,
        sqlPreview,
        explanation: checkList
          .filter((c) => !c.passed)
          .map((c) => `${c.label}: ${c.detail}`)
          .join(' '),
        affectedEmpIds: [],
        nextDb: cloneIntegrityDb(db),
      };
    }

    nextDb.employees.push({
      empId: op.empId!,
      name: op.name.trim(),
      salary: Math.round(parsedSalary),
      dno: op.dno,
    });

    return {
      accepted: true,
      verdictLabel: 'ACCEPTED (ALL 4 CONSTRAINTS SATISFIED)',
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation:
        op.dno === null
          ? `Inserted EmpID = ${op.empId} with Dno = NULL. Referential Integrity explicitly permits NULL foreign keys when the column is nullable!`
          : `Inserted EmpID = ${op.empId} referencing valid parent DEPARTMENT(Dno = ${op.dno}).`,
      affectedEmpIds: [op.empId!],
      nextDb,
    };
  }

  if (op.kind === 'UPDATE_EMP_FK') {
    const target = nextDb.employees.find((e) => e.empId === op.empId);
    if (!target) {
      checks.DOMAIN = {
        type: 'DOMAIN',
        label: 'Domain Constraint',
        passed: false,
        detail: `EmpID = ${op.empId} does not exist in EMPLOYEE.`,
      };
    } else if (op.newDno !== null && !db.departments.some((d) => d.dno === op.newDno)) {
      checks.REFERENTIAL_INTEGRITY = {
        type: 'REFERENTIAL_INTEGRITY',
        label: 'Referential Integrity',
        passed: false,
        detail: `Cannot update EmpID ${op.empId} to Dno = ${op.newDno}: no matching PK in DEPARTMENT.`,
      };
    }

    const checkList = Object.values(checks);
    const violated = checkList.filter((c) => !c.passed).map((c) => c.type);
    if (violated.length > 0) {
      return {
        accepted: false,
        verdictLabel: `REJECTED (${violated.map((v) => v.replace('_', ' ')).join(' + ')})`,
        violatedConstraints: violated,
        checks: checkList,
        sqlPreview,
        explanation: checkList
          .filter((c) => !c.passed)
          .map((c) => `${c.label}: ${c.detail}`)
          .join(' '),
        affectedEmpIds: [],
        nextDb: cloneIntegrityDb(db),
      };
    }

    target!.dno = op.newDno;
    return {
      accepted: true,
      verdictLabel: 'ACCEPTED (CHILD FK UPDATED)',
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation: `Updated EMPLOYEE(EmpID = ${op.empId}).Dno to ${
        op.newDno === null ? 'NULL (allowed)' : op.newDno
      }.`,
      affectedEmpIds: [op.empId],
      nextDb,
    };
  }

  if (op.kind === 'DELETE_DEPT') {
    const deptExists = db.departments.some((d) => d.dno === op.dno);
    if (!deptExists) {
      checks.DOMAIN = {
        type: 'DOMAIN',
        label: 'Domain Constraint',
        passed: false,
        detail: `DEPARTMENT(Dno = ${op.dno}) does not exist.`,
      };
      const checkList = Object.values(checks);
      return {
        accepted: false,
        verdictLabel: 'NO MATCHING PARENT ROW',
        violatedConstraints: ['DOMAIN'],
        checks: checkList,
        sqlPreview,
        explanation: `No parent row with Dno = ${op.dno} exists in DEPARTMENT.`,
        affectedEmpIds: [],
        nextDb: cloneIntegrityDb(db),
      };
    }

    const children = db.employees.filter((e) => e.dno === op.dno);
    const affectedIds = children.map((c) => c.empId);

    if (children.length === 0) {
      nextDb.departments = nextDb.departments.filter((d) => d.dno !== op.dno);
      const checkList = Object.values(checks);
      return {
        accepted: true,
        verdictLabel: 'ACCEPTED (0 REFERENCING CHILDREN)',
        violatedConstraints: [],
        checks: checkList,
        sqlPreview,
        explanation: `No EMPLOYEE tuples reference Dno = ${op.dno}, so deleting the parent row triggers zero Referential Integrity violations under any policy.`,
        affectedEmpIds: [],
        nextDb,
      };
    }

    if (op.action === 'RESTRICT') {
      checks.REFERENTIAL_INTEGRITY = {
        type: 'REFERENTIAL_INTEGRITY',
        label: 'Referential Integrity',
        passed: false,
        detail: `RESTRICT blocks deletion of Dno = ${op.dno} because ${children.length} child row(s) reference it (EmpID: ${affectedIds.join(', ')}).`,
      };
      const checkList = Object.values(checks);
      return {
        accepted: false,
        verdictLabel: 'REJECTED (ON DELETE RESTRICT)',
        violatedConstraints: ['REFERENTIAL_INTEGRITY'],
        checks: checkList,
        sqlPreview,
        explanation: checks.REFERENTIAL_INTEGRITY.detail,
        affectedEmpIds: affectedIds,
        nextDb: cloneIntegrityDb(db),
      };
    }

    if (op.action === 'CASCADE') {
      nextDb.departments = nextDb.departments.filter((d) => d.dno !== op.dno);
      nextDb.employees = nextDb.employees.filter((e) => e.dno !== op.dno);
      const checkList = Object.values(checks);
      return {
        accepted: true,
        verdictLabel: `ACCEPTED — CASCADE DELETED ${children.length} CHILD ROW(S)`,
        violatedConstraints: [],
        checks: checkList,
        sqlPreview,
        explanation: `ON DELETE CASCADE deleted DEPARTMENT(Dno = ${op.dno}) AND automatically deleted referencing EMPLOYEE row(s): EmpID ${affectedIds.join(', ')}.`,
        affectedEmpIds: affectedIds,
        nextDb,
      };
    }

    if (op.action === 'SET_NULL') {
      nextDb.departments = nextDb.departments.filter((d) => d.dno !== op.dno);
      nextDb.employees = nextDb.employees.map((e) =>
        e.dno === op.dno ? { ...e, dno: null } : e
      );
      const checkList = Object.values(checks);
      return {
        accepted: true,
        verdictLabel: `ACCEPTED — SET Dno = NULL ON ${children.length} ROW(S)`,
        violatedConstraints: [],
        checks: checkList,
        sqlPreview,
        explanation: `ON DELETE SET NULL deleted DEPARTMENT(Dno = ${op.dno}) and preserved EMPLOYEE row(s) (${affectedIds.join(', ')}) by setting their FK Dno = NULL.`,
        affectedEmpIds: affectedIds,
        nextDb,
      };
    }

    // SET_DEFAULT
    const defaultTargetExists =
      op.dno !== db.defaultDno && db.departments.some((d) => d.dno === db.defaultDno);
    if (!defaultTargetExists) {
      checks.REFERENTIAL_INTEGRITY = {
        type: 'REFERENTIAL_INTEGRITY',
        label: 'Referential Integrity',
        passed: false,
        detail: `SET DEFAULT failed because default parent Dno = ${db.defaultDno} would not exist after this delete!`,
      };
      const checkList = Object.values(checks);
      return {
        accepted: false,
        verdictLabel: 'REJECTED (DEFAULT PARENT MISSING)',
        violatedConstraints: ['REFERENTIAL_INTEGRITY'],
        checks: checkList,
        sqlPreview,
        explanation: checks.REFERENTIAL_INTEGRITY.detail,
        affectedEmpIds: affectedIds,
        nextDb: cloneIntegrityDb(db),
      };
    }

    nextDb.departments = nextDb.departments.filter((d) => d.dno !== op.dno);
    nextDb.employees = nextDb.employees.map((e) =>
      e.dno === op.dno ? { ...e, dno: db.defaultDno } : e
    );
    const checkList = Object.values(checks);
    return {
      accepted: true,
      verdictLabel: `ACCEPTED — SET Dno = ${db.defaultDno} ON ${children.length} ROW(S)`,
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation: `ON DELETE SET DEFAULT deleted DEPARTMENT(Dno = ${op.dno}) and reassigned referencing EMPLOYEE row(s) (${affectedIds.join(', ')}) to default Dno = ${db.defaultDno}.`,
      affectedEmpIds: affectedIds,
      nextDb,
    };
  }

  // UPDATE_DEPT_PK
  const parentRow = nextDb.departments.find((d) => d.dno === op.oldDno);
  if (!parentRow) {
    checks.DOMAIN = {
      type: 'DOMAIN',
      label: 'Domain Constraint',
      passed: false,
      detail: `Parent DEPARTMENT(Dno = ${op.oldDno}) does not exist.`,
    };
  }
  if (op.newDno === null) {
    checks.ENTITY_INTEGRITY = {
      type: 'ENTITY_INTEGRITY',
      label: 'Entity Integrity',
      passed: false,
      detail: 'Cannot update DEPARTMENT primary key Dno to NULL!',
    };
  } else if (
    op.newDno !== op.oldDno &&
    db.departments.some((d) => d.dno === op.newDno)
  ) {
    checks.KEY = {
      type: 'KEY',
      label: 'Key Uniqueness',
      passed: false,
      detail: `Duplicate Primary Key: DEPARTMENT(Dno = ${op.newDno}) already exists.`,
    };
  }

  const preViolations = Object.values(checks)
    .filter((c) => !c.passed)
    .map((c) => c.type);
  if (preViolations.length > 0) {
    const checkList = Object.values(checks);
    return {
      accepted: false,
      verdictLabel: `REJECTED (${preViolations.map((v) => v.replace('_', ' ')).join(' + ')})`,
      violatedConstraints: preViolations,
      checks: checkList,
      sqlPreview,
      explanation: checkList
        .filter((c) => !c.passed)
        .map((c) => `${c.label}: ${c.detail}`)
        .join(' '),
      affectedEmpIds: [],
      nextDb: cloneIntegrityDb(db),
    };
  }

  const children = db.employees.filter((e) => e.dno === op.oldDno);
  const affectedIds = children.map((c) => c.empId);

  if (children.length === 0 || op.oldDno === op.newDno) {
    parentRow!.dno = op.newDno!;
    const checkList = Object.values(checks);
    return {
      accepted: true,
      verdictLabel: 'ACCEPTED (PARENT PK UPDATED)',
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation: `Updated DEPARTMENT(Dno = ${op.oldDno} → ${op.newDno}) with zero child references affected.`,
      affectedEmpIds: [],
      nextDb,
    };
  }

  if (op.action === 'RESTRICT') {
    checks.REFERENTIAL_INTEGRITY = {
      type: 'REFERENTIAL_INTEGRITY',
      label: 'Referential Integrity',
      passed: false,
      detail: `ON UPDATE RESTRICT rejects changing Dno ${op.oldDno} → ${op.newDno} because EmpID ${affectedIds.join(', ')} reference ${op.oldDno}.`,
    };
    const checkList = Object.values(checks);
    return {
      accepted: false,
      verdictLabel: 'REJECTED (ON UPDATE RESTRICT)',
      violatedConstraints: ['REFERENTIAL_INTEGRITY'],
      checks: checkList,
      sqlPreview,
      explanation: checks.REFERENTIAL_INTEGRITY.detail,
      affectedEmpIds: affectedIds,
      nextDb: cloneIntegrityDb(db),
    };
  }

  if (op.action === 'CASCADE') {
    parentRow!.dno = op.newDno!;
    nextDb.employees = nextDb.employees.map((e) =>
      e.dno === op.oldDno ? { ...e, dno: op.newDno! } : e
    );
    const checkList = Object.values(checks);
    return {
      accepted: true,
      verdictLabel: `ACCEPTED — CASCADED Dno = ${op.newDno} TO ${children.length} ROW(S)`,
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation: `ON UPDATE CASCADE updated DEPARTMENT PK (${op.oldDno} → ${op.newDno}) and cascaded Dno = ${op.newDno} to EMPLOYEE row(s): ${affectedIds.join(', ')}.`,
      affectedEmpIds: affectedIds,
      nextDb,
    };
  }

  if (op.action === 'SET_NULL') {
    parentRow!.dno = op.newDno!;
    nextDb.employees = nextDb.employees.map((e) =>
      e.dno === op.oldDno ? { ...e, dno: null } : e
    );
    const checkList = Object.values(checks);
    return {
      accepted: true,
      verdictLabel: `ACCEPTED — SET Dno = NULL ON ${children.length} ROW(S)`,
      violatedConstraints: [],
      checks: checkList,
      sqlPreview,
      explanation: `ON UPDATE SET NULL changed DEPARTMENT PK (${op.oldDno} → ${op.newDno}) and set Dno = NULL on child row(s): ${affectedIds.join(', ')}.`,
      affectedEmpIds: affectedIds,
      nextDb,
    };
  }

  // SET_DEFAULT on update
  const defaultExists =
    op.oldDno !== db.defaultDno && db.departments.some((d) => d.dno === db.defaultDno);
  if (!defaultExists) {
    checks.REFERENTIAL_INTEGRITY = {
      type: 'REFERENTIAL_INTEGRITY',
      label: 'Referential Integrity',
      passed: false,
      detail: `ON UPDATE SET DEFAULT failed because default parent Dno = ${db.defaultDno} is unavailable.`,
    };
    const checkList = Object.values(checks);
    return {
      accepted: false,
      verdictLabel: 'REJECTED (DEFAULT PARENT MISSING)',
      violatedConstraints: ['REFERENTIAL_INTEGRITY'],
      checks: checkList,
      sqlPreview,
      explanation: checks.REFERENTIAL_INTEGRITY.detail,
      affectedEmpIds: affectedIds,
      nextDb: cloneIntegrityDb(db),
    };
  }

  parentRow!.dno = op.newDno!;
  nextDb.employees = nextDb.employees.map((e) =>
    e.dno === op.oldDno ? { ...e, dno: db.defaultDno } : e
  );
  const checkList = Object.values(checks);
  return {
    accepted: true,
    verdictLabel: `ACCEPTED — SET Dno = ${db.defaultDno} ON ${children.length} ROW(S)`,
    violatedConstraints: [],
    checks: checkList,
    sqlPreview,
    explanation: `ON UPDATE SET DEFAULT updated DEPARTMENT PK (${op.oldDno} → ${op.newDno}) and moved child row(s) (${affectedIds.join(', ')}) to default Dno = ${db.defaultDno}.`,
    affectedEmpIds: affectedIds,
    nextDb,
  };
}

export function compareReferentialActions(
  db: IntegrityDbState,
  op: Extract<IntegrityOperation, { kind: 'DELETE_DEPT' | 'UPDATE_DEPT_PK' }>
): ReferentialActionComparison[] {
  const actions: ReferentialAction[] = ['RESTRICT', 'CASCADE', 'SET_NULL', 'SET_DEFAULT'];
  return actions.map((action) => {
    const res = evaluateIntegrityOperation(db, { ...op, action });
    return {
      action,
      accepted: res.accepted,
      summary: res.explanation,
      affectedEmpIds: res.affectedEmpIds,
      resultingDeptCount: res.nextDb.departments.length,
      resultingEmpCount: res.nextDb.employees.length,
    };
  });
}
