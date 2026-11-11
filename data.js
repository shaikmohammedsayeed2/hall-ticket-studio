export const fields = ['Student Name', 'Father Name', 'Class', 'Student ID'];
const aliases = [['studentname','student','name','nameofstudent'],['fathername','fathersname','father','guardian','guardianname','fatherguardian','fatherorguardian','parentname'],['class','classname','grade','standard'],['studentid','studentnumber','studentno','id','admissionnumber','admissionno','rollnumber','rollno']];
export const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function guessColumns(headers) {
  return aliases.map(names => headers.findIndex(header => names.includes(normalize(header))));
}
export function parseStudents(rows, columns) {
  const selected = columns.filter(i => i !== -1);
  if (columns.length < 3 || columns.length > fields.length || columns.slice(0, 3).some(i => !Number.isInteger(i) || i < 0) || selected.some(i => !Number.isInteger(i) || i < 0) || new Set(selected).size !== selected.length) throw new Error('Select a different column for each student field. Student ID is optional.');
  const students = [];
  rows.forEach((row, index) => {
    if (row.every(value => !String(value ?? '').trim())) return;
    const values = columns.map(i => String(row[i] ?? '').trim());
    if (values.slice(0, 3).some(value => !value)) throw new Error(`Row ${index + 2}: student name, father / guardian name and class are all required.`);
    if (values.some(value => value.length > 120)) throw new Error(`Row ${index + 2}: a student field exceeds 120 characters.`);
    students.push(values);
  });
  if (!students.length) throw new Error('No student rows found. Add student details below the header row.');
  if (students.length > 2000) throw new Error('Please upload no more than 2,000 students at a time.');
  return students;
}
