import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cloneIntegrityDb,
  compareReferentialActions,
  evaluateIntegrityOperation,
  INITIAL_INTEGRITY_DB,
  INTEGRITY_PRESETS,
} from './integrityEngine';

test('INSERT_EMP accurately checks Domain, Entity Integrity, Key, and Referential Integrity constraints', () => {
  const db = cloneIntegrityDb(INITIAL_INTEGRITY_DB);

  // Entity Integrity violation (NULL PK)
  const nullPk = evaluateIntegrityOperation(db, {
    kind: 'INSERT_EMP',
    empId: null,
    name: 'Rohan',
    salary: 65000,
    dno: 10,
  });
  assert.equal(nullPk.accepted, false);
  assert.ok(nullPk.violatedConstraints.includes('ENTITY_INTEGRITY'));

  // Key violation (duplicate EmpID 101)
  const dupPk = evaluateIntegrityOperation(db, {
    kind: 'INSERT_EMP',
    empId: 101,
    name: 'Rohan',
    salary: 65000,
    dno: 10,
  });
  assert.equal(dupPk.accepted, false);
  assert.ok(dupPk.violatedConstraints.includes('KEY'));

  // Domain violation (negative salary)
  const badSalary = evaluateIntegrityOperation(db, {
    kind: 'INSERT_EMP',
    empId: 106,
    name: 'Rohan',
    salary: -5000,
    dno: 10,
  });
  assert.equal(badSalary.accepted, false);
  assert.ok(badSalary.violatedConstraints.includes('DOMAIN'));

  // Referential Integrity violation (missing Dno 55)
  const badFk = evaluateIntegrityOperation(db, {
    kind: 'INSERT_EMP',
    empId: 106,
    name: 'Rohan',
    salary: 65000,
    dno: 55,
  });
  assert.equal(badFk.accepted, false);
  assert.ok(badFk.violatedConstraints.includes('REFERENTIAL_INTEGRITY'));

  // Valid INSERT with NULL FK (allowed!)
  const validNullFk = evaluateIntegrityOperation(db, {
    kind: 'INSERT_EMP',
    empId: 106,
    name: 'Meera',
    salary: 72000,
    dno: null,
  });
  assert.equal(validNullFk.accepted, true);
  assert.equal(validNullFk.nextDb.employees.length, db.employees.length + 1);
});

test('DELETE_DEPT contrasts RESTRICT, CASCADE, SET NULL, and SET DEFAULT accurately', () => {
  const db = cloneIntegrityDb(INITIAL_INTEGRITY_DB);
  const comparisons = compareReferentialActions(db, {
    kind: 'DELETE_DEPT',
    dno: 10,
    action: 'RESTRICT',
  });
  assert.equal(comparisons.length, 4);

  const byAction = Object.fromEntries(comparisons.map((c) => [c.action, c]));
  assert.equal(byAction.RESTRICT.accepted, false);
  assert.equal(byAction.RESTRICT.resultingEmpCount, 5);

  assert.equal(byAction.CASCADE.accepted, true);
  assert.equal(byAction.CASCADE.resultingDeptCount, 4);
  assert.equal(byAction.CASCADE.resultingEmpCount, 3); // 101 & 102 deleted

  assert.equal(byAction.SET_NULL.accepted, true);
  assert.equal(byAction.SET_NULL.resultingEmpCount, 5);

  assert.equal(byAction.SET_DEFAULT.accepted, true);
  assert.equal(byAction.SET_DEFAULT.resultingEmpCount, 5);

  // Check actual mutated rows for SET_NULL and SET_DEFAULT
  const setNullRes = evaluateIntegrityOperation(db, {
    kind: 'DELETE_DEPT',
    dno: 10,
    action: 'SET_NULL',
  });
  assert.equal(setNullRes.nextDb.employees.find((e) => e.empId === 101)?.dno, null);
  assert.equal(setNullRes.nextDb.employees.find((e) => e.empId === 102)?.dno, null);

  const setDefaultRes = evaluateIntegrityOperation(db, {
    kind: 'DELETE_DEPT',
    dno: 10,
    action: 'SET_DEFAULT',
  });
  assert.equal(setDefaultRes.nextDb.employees.find((e) => e.empId === 101)?.dno, 99);

  // Deleting unreferenced Dno 40 succeeds even under RESTRICT
  const emptyDel = evaluateIntegrityOperation(db, {
    kind: 'DELETE_DEPT',
    dno: 40,
    action: 'RESTRICT',
  });
  assert.equal(emptyDel.accepted, true);
  assert.equal(emptyDel.nextDb.departments.length, 4);
});

test('UPDATE_DEPT_PK handles CASCADE, RESTRICT, Entity Integrity (NULL PK), and Key collisions', () => {
  const db = cloneIntegrityDb(INITIAL_INTEGRITY_DB);

  const cascadeUpd = evaluateIntegrityOperation(db, {
    kind: 'UPDATE_DEPT_PK',
    oldDno: 20,
    newDno: 25,
    action: 'CASCADE',
  });
  assert.equal(cascadeUpd.accepted, true);
  assert.equal(cascadeUpd.nextDb.employees.find((e) => e.empId === 103)?.dno, 25);

  const restrictUpd = evaluateIntegrityOperation(db, {
    kind: 'UPDATE_DEPT_PK',
    oldDno: 20,
    newDno: 25,
    action: 'RESTRICT',
  });
  assert.equal(restrictUpd.accepted, false);
  assert.ok(restrictUpd.violatedConstraints.includes('REFERENTIAL_INTEGRITY'));

  const nullUpd = evaluateIntegrityOperation(db, {
    kind: 'UPDATE_DEPT_PK',
    oldDno: 20,
    newDno: null,
    action: 'CASCADE',
  });
  assert.equal(nullUpd.accepted, false);
  assert.ok(nullUpd.violatedConstraints.includes('ENTITY_INTEGRITY'));

  const dupUpd = evaluateIntegrityOperation(db, {
    kind: 'UPDATE_DEPT_PK',
    oldDno: 20,
    newDno: 10,
    action: 'CASCADE',
  });
  assert.equal(dupUpd.accepted, false);
  assert.ok(dupUpd.violatedConstraints.includes('KEY'));

  assert.equal(INTEGRITY_PRESETS.length, 8);
});
