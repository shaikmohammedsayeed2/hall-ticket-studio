import { fields, guessColumns, parseStudents } from './data.js';
const $ = id => document.getElementById(id);
let students = [], workbook, rows = [], filename = '', loading = false;
const demo = [['AARAV SHARMA','RAJESH SHARMA','8th'],['SARA AHMED','IMRAN AHMED','8th'],['ANANYA REDDY','KIRAN REDDY','7th'],['ROHAN KUMAR','SURESH KUMAR','7th'],['MEERA NAIR','ARUN NAIR','6th'],['ADAM KHAN','IRFAN KHAN','6th'],['ISHA PATEL','AMIT PATEL','5th'],['VIHAAN RAO','SANJAY RAO','5th']];
function error(message = '') { $('error').textContent = message; $('error').hidden = !message; }
function cell(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
function ticket(student) {
  const settings = new FormData($('settings'));
  const el = document.createElement('article'); el.className = 'ticket';
  const table = document.createElement('table');
  const group = document.createElement('colgroup');
  const labelColumn = document.createElement('col'); labelColumn.className = 'label-column';
  group.append(labelColumn, document.createElement('col')); table.append(group);
  const school = table.insertRow(); const heading = document.createElement('th'); heading.colSpan = 2; heading.className = 'school'; heading.textContent = settings.get('school'); school.append(heading);
  const exam = table.insertRow(); const sub = document.createElement('th'); sub.colSpan = 2; sub.className = 'exam'; sub.textContent = `${settings.get('exam')} - ${settings.get('title')} ${settings.get('year')}`; exam.append(sub);
  ['STUDENT NAME','FATHER / GUARDIAN','CLASS'].forEach((label, i) => { const row = table.insertRow(); const th = cell('th',label); th.scope = 'row'; row.append(th,cell('td',student[i])); });
  el.append(table); return el;
}
function render() {
  const source = students.length ? students : [['Student name','Father / guardian name','Class']];
  const fragment = document.createDocumentFragment();
  for(let i=0; i<source.length; i+=8) {
    const page = document.createElement('section'); page.className = 'paper'; page.setAttribute('aria-label',`A4 page ${i/8+1}`);
    source.slice(i,i+8).forEach(student => page.append(ticket(student))); fragment.append(page);
  }
  $('pages').replaceChildren(fragment);
  $('count').textContent = students.length ? `${students.length} tickets · ${Math.ceil(students.length/8)} A4 ${students.length>8?'pages':'page'}` : 'Template preview · A4 portrait';
  $('print').disabled = !students.length || !$('settings').checkValidity() || loading;
  $('clear').hidden = !students.length;
}
$('settings').addEventListener('input',render);
function applyColumns() {
  try {
    const columns = fields.map((_, i) => Number($(`column-${i}`).value));
    students = parseStudents(rows.slice(1), columns); error();
    $('status').textContent = `${filename} · ${students.length} students ready. Data stays on this device.`;
  } catch(e) { students = []; error(e.message); $('status').textContent = 'Check your worksheet and column selections.'; }
  render();
}
function loadSheet() {
  students = [];
  try {
    // shortcut: the first nonempty row is the header; remove title rows above it before uploading.
    const sheet = workbook.Sheets[$('sheet').value];
    if (sheet['!fullref'] && sheet['!fullref'] !== sheet['!ref']) throw new Error('Worksheet exceeds 2,002 rows. Remove extra rows or split it into smaller files.');
    rows = XLSX.utils.sheet_to_json(sheet, {header:1,defval:'',raw:false,blankrows:false});
    if (!rows.length) throw new Error('This worksheet is empty. Choose another worksheet.');
    const headers = rows[0]; const guessed = guessColumns(headers);
    const controls = fields.map((field,i) => {
      const label = cell('label',field === 'Father Name' ? 'Father / guardian name' : field);
      const select = document.createElement('select'); select.id = `column-${i}`;
      select.append(new Option('Choose a column…','-1'));
      headers.forEach((header,j) => select.add(new Option(`${header || '(blank header)'} (column ${j+1})`,String(j))));
      select.value = String(guessed[i]); select.addEventListener('change',applyColumns); label.append(select); return label;
    });
    $('columns').replaceChildren(...controls); applyColumns();
  } catch(e) { $('columns').replaceChildren(); error(e.message); render(); }
}
async function upload(file) {
  if (!file || loading) return;
  error();
  try {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('Choose an .xlsx, .xls or .csv spreadsheet.');
    if (file.size > 5*1024*1024) throw new Error('File is too large. Please keep it under 5 MB.');
    loading = true; $('upload').disabled = true; $('print').disabled = true; $('status').textContent = 'Reading spreadsheet…';
    if (!globalThis.XLSX) throw new Error('The Excel reader could not load. Refresh the page and try again.');
    const next = XLSX.read(await file.arrayBuffer(), {type:'array',sheetRows:2003});
    if (!next.SheetNames.length) throw new Error('No worksheets found in this file.');
    workbook = next; filename = file.name;
    $('sheet').replaceChildren(...workbook.SheetNames.map(name => new Option(name,name)));
    $('mapping').hidden = false; loadSheet();
  } catch(e) { error(e.message || 'Could not read this spreadsheet. Try saving it as .xlsx.'); $('status').textContent = students.length ? 'Previous student data is still loaded.' : 'No student data loaded.'; }
  finally { loading = false; $('upload').disabled = false; $('upload').value = ''; render(); }
}
$('upload').addEventListener('change',e => upload(e.target.files[0]));
$('sheet').addEventListener('change',loadSheet);
$('dropzone').addEventListener('dragover',e => {e.preventDefault(); $('dropzone').classList.add('dragging');});
$('dropzone').addEventListener('dragleave',() => $('dropzone').classList.remove('dragging'));
$('dropzone').addEventListener('drop',e => {e.preventDefault(); $('dropzone').classList.remove('dragging'); upload(e.dataTransfer.files[0]);});
$('sample').addEventListener('click',() => {
  if (!globalThis.XLSX) { error('The Excel reader could not load. Refresh and try again.'); return; }
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([fields,...demo]),'Students'); XLSX.writeFile(book,'hall-ticket-students.xlsx');
});
$('demo').addEventListener('click',() => {students=demo; $('mapping').hidden=true; error(); $('status').textContent='Demo data loaded. Upload your Excel file to replace it.'; render();});
$('clear').addEventListener('click',() => {students=[]; workbook=undefined; rows=[]; $('mapping').hidden=true; error(); $('status').textContent='Student data cleared from this page.'; render();});
$('print').addEventListener('click',() => { if (students.length && $('settings').reportValidity()) window.print(); });
render();
