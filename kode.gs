const SHEET_PASIEN = "Pasien";
const SHEET_PELAYANAN = "Pelayanan";
const SHEET_RIWAYAT = "Riwayat";
const SHEET_CONFIG = "Pengaturan";

// Menerima permintaan GET (Membaca Data)
function doGet(e) {
  var action = e.parameter.action;
  var data = null;
  var status = 'success';
  var message = '';

  try {
    if (action === 'getConfig') data = getConfig();
    else if (action === 'getPasienData') data = getPasienData();
    else if (action === 'getPelayananData') data = getPelayananData();
    else if (action === 'getRiwayatData') data = getRiwayatData();
    else throw new Error("Aksi tidak valid.");
  } catch (err) {
    status = 'error';
    message = err.message;
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: status, message: message, data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

// Menerima permintaan POST (Menyimpan Data)
function doPost(e) {
  var status = 'success';
  var message = '';
  var responseData = null;

  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var dataObj = payload.data;

    if (action === 'simpanConfig') simpanConfig(dataObj);
    else if (action === 'simpanPasien') simpanPasien(dataObj);
    else if (action === 'simpanPelayanan') simpanPelayanan(dataObj);
    else if (action === 'simpanRiwayat') simpanRiwayat(dataObj);
    else throw new Error("Aksi tidak valid.");
  } catch (err) {
    status = 'error';
    message = err.message;
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: status, message: message, data: responseData
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// FUNGSI PENGATURAN (PASSWORD & STRUK)
// ==========================================
function getConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_CONFIG);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_CONFIG);
      sheet.appendRow(["Key", "Value"]);
      sheet.appendRow(["passwordAkses", "admin"]);
      sheet.appendRow(["strukKop", "eRM BPM CLINIC"]);
      sheet.appendRow(["strukAlamat", "Struk Resmi"]);
      sheet.appendRow(["strukFooter", "Terima Kasih, Semoga Lekas Sembuh"]);
    }
    const data = sheet.getDataRange().getValues();
    let config = { passwordAkses: 'admin', strukKop: 'eRM BPM CLINIC', strukAlamat: 'Struk Resmi', strukFooter: 'Terima Kasih, Semoga Lekas Sembuh' };
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) config[data[i][0]] = data[i][1];
    }
    return config;
  } catch (e) { return null; }
}

function simpanConfig(configObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) sheet = ss.insertSheet(SHEET_CONFIG);
  sheet.clearContents();
  sheet.appendRow(["Key", "Value"]);
  for (const key in configObj) { sheet.appendRow([key, configObj[key]]); }
}

// ==========================================
// FUNGSI UNTUK DATA MASTER PASIEN
// ==========================================
function getPasienData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PASIEN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PASIEN);
    sheet.appendRow(["No. eRM", "Nama Lengkap", "Status KK", "Jenis Kelamin", "Tanggal Lahir", "Tempat Lahir", "Format TTL", "Kelurahan/Desa", "Alamat Lengkap", "RT", "RW", "Tag/Status"]);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; 
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let tglLahirString = "";
    if (row[4] instanceof Date) tglLahirString = row[4].toISOString().split('T')[0];
    else tglLahirString = row[4] ? row[4].toString() : "";
    result.push({
      erm: row[0] ? row[0].toString() : "", nama: row[1] ? row[1].toString() : "", status_kk: row[2] ? row[2].toString() : "", jk: row[3] ? row[3].toString() : "",
      tglLahirRaw: tglLahirString, tempatLahirRaw: row[5] ? row[5].toString() : "", ttl: row[6] ? row[6].toString() : "", kel: row[7] ? row[7].toString() : "",
      alamat: row[8] ? row[8].toString() : "", rt: row[9] ? row[9].toString() : "", rw: row[10] ? row[10].toString() : "", tag: row[11] ? row[11].toString() : ""
    });
  }
  return result.reverse();
}

function simpanPasien(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PASIEN);
  if(!sheet) {
    sheet = ss.insertSheet(SHEET_PASIEN);
    sheet.appendRow(["No. eRM", "Nama Lengkap", "Status KK", "Jenis Kelamin", "Tanggal Lahir", "Tempat Lahir", "Format TTL", "Kelurahan/Desa", "Alamat Lengkap", "RT", "RW", "Tag/Status"]);
  }
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString() === dataObj.erm.toString()) { rowIndex = i + 1; break; }
  }
  const rowData = [dataObj.erm, dataObj.nama, dataObj.status_kk, dataObj.jk, dataObj.tglLahirRaw, dataObj.tempatLahirRaw, dataObj.ttl, dataObj.kel, dataObj.alamat, dataObj.rt, dataObj.rw, dataObj.tag];
  if (rowIndex !== -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
}

// ==========================================
// FUNGSI UNTUK DATA PELAYANAN & KASIR
// ==========================================
function getPelayananData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PELAYANAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PELAYANAN);
    sheet.appendRow(["No. eRM", "Nama Pasien", "Waktu Daftar", "Waktu Medis Selesai", "Tanggal Sistem", "Keluhan", "TD", "Nadi", "Nafas", "Suhu", "SpO2", "TB", "BB", "Laborat", "Resep", "Tagihan", "Status"]);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let tglString = "";
    if (row[4] instanceof Date) tglString = row[4].toISOString();
    else tglString = row[4] ? row[4].toString() : "";
    result.push({
      erm: row[0] ? row[0].toString() : "", nama: row[1] ? row[1].toString() : "", waktuDaftar: row[2] ? row[2].toString() : "", waktuMedisSelesai: row[3] ? row[3].toString() : "",
      tanggalSistem: tglString, keluhan: row[5] ? row[5].toString() : "", td: row[6] ? row[6].toString() : "", nadi: row[7] ? row[7].toString() : "", nafas: row[8] ? row[8].toString() : "",
      suhu: row[9] ? row[9].toString() : "", spo2: row[10] ? row[10].toString() : "", tb: row[11] ? row[11].toString() : "", bb: row[12] ? row[12].toString() : "",
      laborat: row[13] ? row[13].toString() : "", resep: row[14] ? row[14].toString() : "", tagihan: row[15] ? row[15] : 0, status: row[16] ? row[16].toString() : ""
    });
  }
  return result;
}

function simpanPelayanan(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PELAYANAN);
  if(!sheet) {
    sheet = ss.insertSheet(SHEET_PELAYANAN);
    sheet.appendRow(["No. eRM", "Nama Pasien", "Waktu Daftar", "Waktu Medis Selesai", "Tanggal Sistem", "Keluhan", "TD", "Nadi", "Nafas", "Suhu", "SpO2", "TB", "BB", "Laborat", "Resep", "Tagihan", "Status"]);
  }
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString() === dataObj.erm.toString() && data[i][2] && data[i][2].toString() === dataObj.waktuDaftar.toString()) { rowIndex = i + 1; break; }
  }
  const rowData = [
    dataObj.erm, dataObj.nama, dataObj.waktuDaftar, dataObj.waktuMedisSelesai || '', dataObj.tanggalSistem, dataObj.keluhan || '', dataObj.td || '', dataObj.nadi || '', dataObj.nafas || '', 
    dataObj.suhu || '', dataObj.spo2 || '', dataObj.tb || '', dataObj.bb || '', dataObj.laborat || '', dataObj.resep || '', dataObj.tagihan || 0, dataObj.status
  ];
  if (rowIndex !== -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
}

// ==========================================
// FUNGSI UNTUK DATA RIWAYAT MEDIS
// ==========================================
function getRiwayatData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RIWAYAT);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RIWAYAT);
    sheet.appendRow(["No. eRM", "Tanggal", "Jam", "Keluhan", "TD", "Suhu", "Resep"]);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    result.push({
      erm: row[0] ? row[0].toString() : "", tgl: row[1] ? row[1].toString() : "", jam: row[2] ? row[2].toString() : "", keluhan: row[3] ? row[3].toString() : "",
      td: row[4] ? row[4].toString() : "", suhu: row[5] ? row[5].toString() : "", resep: row[6] ? row[6].toString() : ""
    });
  }
  return result;
}

function simpanRiwayat(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RIWAYAT);
  if(!sheet) {
    sheet = ss.insertSheet(SHEET_RIWAYAT);
    sheet.appendRow(["No. eRM", "Tanggal", "Jam", "Keluhan", "TD", "Suhu", "Resep"]);
  }
  sheet.appendRow([dataObj.erm, dataObj.tgl, dataObj.jam, dataObj.keluhan, dataObj.td, dataObj.suhu, dataObj.resep]);
}
