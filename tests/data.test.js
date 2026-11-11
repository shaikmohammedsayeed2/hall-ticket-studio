import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guessColumns, parseStudents } from '../data.js';
test('recognizes reordered and punctuated headers', () => assert.deepEqual(guessColumns(['Class',"Father’s Name",'Student Name']),[2,1,0,-1]));
test('trims values, preserves class and skips empty rows', () => assert.deepEqual(parseStudents([[' Sara ',' Imran ','08'],['','','']],[0,1,2]),[['Sara','Imran','08']]));
test('rejects missing, duplicate or incomplete columns', () => {
  assert.throws(() => parseStudents([['A','B','8']],[-1,1,2]),/different column/);
  assert.throws(() => parseStudents([['A','B','8']],[0,0,2]),/different column/);
  assert.throws(() => parseStudents([['A','','8']],[0,1,2]),/Row 2/);
  assert.throws(() => parseStudents([],[0,1,2]),/No student/);
});
test('rejects oversized values and more than 2000 students', () => {
  assert.throws(() => parseStudents([['x'.repeat(121),'B','8']],[0,1,2]),/120/);
  assert.throws(() => parseStudents(Array.from({length:2001},()=>['A','B','8']),[0,1,2]),/2,000/);
});

test('recognizes student ID headers and preserves leading zeros', () => {
  assert.deepEqual(guessColumns(['Student ID', 'Class', 'Father Name', 'Student Name']), [3, 2, 1, 0]);
  assert.deepEqual(parseStudents([[' Sara ', ' Imran ', '08', ' 0012 ']], [0, 1, 2, 3]), [['Sara', 'Imran', '08', '0012']]);
});
test('keeps student ID optional for existing spreadsheets and blank IDs', () => {
  assert.deepEqual(parseStudents([['Sara', 'Imran', '8']], [0, 1, 2, -1]), [['Sara', 'Imran', '8', '']]);
  assert.deepEqual(parseStudents([['Sara', 'Imran', '8', '']], [0, 1, 2, 3]), [['Sara', 'Imran', '8', '']]);
});
test('validates student ID mapping and length', () => {
  assert.throws(() => parseStudents([['A', 'B', '8']], [0, 1, 2, 0]), /different column/);
  assert.throws(() => parseStudents([['A', 'B', '8']], [0, 1, 2, -2]), /different column/);
  assert.throws(() => parseStudents([['A', 'B', '8', 'x'.repeat(121)]], [0, 1, 2, 3]), /120/);
});
