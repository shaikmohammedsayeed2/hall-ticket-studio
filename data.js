export const fields = ['Student Name', 'Father Name', 'Class'];
const aliases = [['studentname','student','name','nameofstudent'],['fathername','fathersname','father','guardian','guardianname','fatherguardian','fatherorguardian','parentname'],['class','classname','grade','standard']];
export const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function guessColumns(headers) {
  return aliases.map(names => headers.findIndex(header => names.includes(normalize(header))));
}
export function parseStudents(rows, columns) {
  if (columns.some(i => !Number.isInteger(i) || i < 0) || new Set(columns).size !== 3) throw new Error('Select a different column for each of the three student fields.');
  const students = [];
  rows.forEach((row, index) => {
    if (row.every(value => !String(value ?? '').trim())) return;
    const values = columns.map(i => String(row[i] ?? '').trim());
    if (values.some(value => !value)) throw new Error(`Row ${index + 2}: student name, father / guardian name and class are all required.`);
    if (values.some(value => value.length > 120)) throw new Error(`Row ${index + 2}: a student field exceeds 120 characters.`);
    students.push(values);
  });
  if (!students.length) throw new Error('No student rows found. Add student details below the header row.');
  if (students.length > 2000) throw new Error('Please upload no more than 2,000 students at a time.');
  return students;
}
