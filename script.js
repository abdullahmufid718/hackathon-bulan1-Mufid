'use strict';

// Nomor WhatsApp tujuan menggunakan format internasional tanpa tanda +.
const BUSINESS_WHATSAPP = '62895329949427';

const menuToggle = document.querySelector('#menu-toggle');
const mainNav = document.querySelector('#main-nav');
const navLinks = document.querySelectorAll('#main-nav a');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const whatsappFallback = document.querySelector('#whatsapp-fallback');
const currentYear = document.querySelector('#current-year');
const serviceSelect = document.querySelector('#customer-service');

// Tampilkan wordmark teks jika logo dari sumber eksternal tidak dapat dimuat.
document.querySelectorAll('.partner-logo-img').forEach((image) => {
  image.addEventListener('error', () => {
    image.hidden = true;
    const fallback = image.nextElementSibling;
    if (fallback) fallback.hidden = false;
  }, { once: true });
});

// Menampilkan tahun saat ini secara otomatis di footer.
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// Menu navigasi untuk layar kecil (ponsel/tablet).
function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  mainNav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Buka menu navigasi' : 'Tutup menu navigasi');
    mainNav.classList.toggle('is-open', !isExpanded);
    document.body.classList.toggle('menu-open', !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

// Tombol "Tanyakan layanan" pada setiap kartu akan memilih layanan tersebut di form.
document.querySelectorAll('.service-link').forEach((link) => {
  link.addEventListener('click', () => {
    const selectedService = link.dataset.service;
    if (!selectedService || !serviceSelect) return;

    const matchingOption = Array.from(serviceSelect.options).find(
      (option) => option.textContent.trim() === selectedService
    );

    if (matchingOption) {
      serviceSelect.value = matchingOption.value;
    } else if (selectedService === 'Pemeriksaan / Isi Freon AC') {
      serviceSelect.value = 'Pemeriksaan / Isi Freon AC';
    }
  });
});

// Form tidak mengirim data ke server. Form menyusun pesan dan membuka WhatsApp.
if (contactForm && formStatus) {
  // Pastikan notifikasi dan tautan cadangan tersembunyi saat halaman pertama dibuka.
  formStatus.hidden = true;
  if (whatsappFallback) whatsappFallback.hidden = true;

  const hideFormStatus = () => {
    formStatus.hidden = true;
    if (whatsappFallback) whatsappFallback.hidden = true;
  };

  // Jika pengunjung mengubah isian, sembunyikan notifikasi lama.
  // Sekaligus hapus pesan validasi khusus saat kolom wajib mulai diisi.
  const handleFormEdit = (event) => {
    const field = event.target;
    if (field && field.matches && field.matches('[required]') && String(field.value || '').trim()) {
      field.setCustomValidity('');
    }
    hideFormStatus();
  };

  contactForm.addEventListener('input', handleFormEdit);
  contactForm.addEventListener('change', handleFormEdit);

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Kolom wajib tidak boleh kosong atau hanya berisi spasi.
    const requiredFields = Array.from(contactForm.querySelectorAll('[required]'));
    let firstEmptyField = null;

    requiredFields.forEach((field) => {
      const isEmpty = !String(field.value || '').trim();
      field.setCustomValidity(isEmpty ? 'Kolom ini wajib diisi.' : '');
      if (isEmpty && !firstEmptyField) firstEmptyField = field;
    });

    if (!contactForm.checkValidity()) {
      hideFormStatus();
      contactForm.reportValidity();
      if (firstEmptyField) firstEmptyField.focus();
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const location = String(formData.get('location') || '').trim();
    const service = String(formData.get('service') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const whatsappMessage = [
      'Halo Mitra Jaya Cool, saya ingin bertanya/memesan layanan AC.',
      '',
      `Nama: ${name}`,
      `Nomor WhatsApp: ${phone}`,
      `Lokasi: ${location}`,
      `Layanan: ${service}`,
      `Detail kebutuhan: ${message}`,
      '',
      'Mohon informasi lebih lanjut mengenai jadwal dan estimasi biaya. Terima kasih.'
    ].join('\n');

    const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;

    // Notifikasi hanya muncul setelah seluruh kolom wajib lolos validasi.
    formStatus.hidden = false;
    whatsappFallback.href = whatsappUrl;
    whatsappFallback.hidden = false;

    // window.open dipanggil langsung dari aksi submit agar tidak mudah diblokir browser.
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      formStatus.querySelector('span').textContent = 'Browser mungkin memblokir tab baru. Gunakan tautan WhatsApp di bawah ini.';
    }
  });
}

/* ---------- Dokumentasi sistem: ERD, flowchart, pseudocode ---------- */

// Data ERD. Format field: "nama_field PK" atau "nama_field FK".
const ERD_ENTITIES = [
  { n: 'PELANGGAN', x: 20, y: 20, f: ['id_pelanggan PK', 'nama', 'no_whatsapp', 'lokasi'] },
  { n: 'PERMINTAAN_LAYANAN', x: 300, y: 20, utama: true, f: ['id_permintaan PK', 'id_pelanggan FK', 'tanggal_permintaan', 'detail_kebutuhan', 'status'] },
  { n: 'JADWAL_KUNJUNGAN', x: 580, y: 20, f: ['id_jadwal PK', 'id_permintaan FK', 'tanggal_kunjungan', 'nama_teknisi', 'status_jadwal'] },
  { n: 'KATEGORI_LAYANAN', x: 20, y: 230, f: ['id_kategori PK', 'nama_kategori'] },
  { n: 'DETAIL_PERMINTAAN', x: 300, y: 230, f: ['id_detail PK', 'id_permintaan FK', 'id_layanan FK', 'jumlah_unit', 'catatan'] },
  { n: 'LAYANAN', x: 580, y: 230, f: ['id_layanan PK', 'id_kategori FK', 'nama_layanan', 'deskripsi', 'status_aktif'] }
];
const ERD_WIDTH = 230;

// Menggambar ERD sebagai SVG dari data di atas.
function drawErd() {
  const target = document.querySelector('#erd');
  if (!target) return;

  const boxes = ERD_ENTITIES.map((e) => {
    const h = 30 + e.f.length * 22 + 8;
    const rows = e.f.map((text, i) => {
      const [name, type] = text.split(' ');
      const y = e.y + 30 + i * 22 + 16;
      const badge = type
        ? `<text x="${e.x + ERD_WIDTH - 12}" y="${y}" text-anchor="end" class="badge-${type.toLowerCase()}">${type}</text>`
        : '';
      return `<line class="ent-line" x1="${e.x}" x2="${e.x + ERD_WIDTH}" y1="${y - 16}" y2="${y - 16}"/>
        <text class="ent-field" x="${e.x + 12}" y="${y}">${name}</text>${badge}`;
    }).join('');
    const main = e.utama ? '-main' : '';
    return `<g><rect class="ent-box${e.utama ? ' ent-box-main' : ''}" x="${e.x}" y="${e.y}" width="${ERD_WIDTH}" height="${h}" rx="8"/>
      <path class="ent-head${main}" d="M${e.x} ${e.y + 30}V${e.y + 8}a8 8 0 0 1 8-8H${e.x + ERD_WIDTH - 8}a8 8 0 0 1 8 8V${e.y + 30}z"/>
      <text class="ent-title" x="${e.x + 12}" y="${e.y + 20}">${e.n}</text>${rows}</g>`;
  }).join('');

  const relations = `
    <path class="rel-line" d="M250 94H300"/><text class="cardinal" x="254" y="86">1</text><text class="cardinal" x="284" y="86">N</text>
    <path class="rel-line" d="M530 94H580"/><text class="cardinal" x="534" y="86">1</text><text class="cardinal" x="564" y="86">1</text>
    <path class="rel-line" d="M415 168V230"/><text class="cardinal" x="423" y="186">1</text><text class="cardinal" x="423" y="224">N</text>
    <path class="rel-line" d="M530 304H580"/><text class="cardinal" x="534" y="296">N</text><text class="cardinal" x="564" y="296">1</text>
    <path class="rel-line" d="M135 312V410H695V378"/><text class="cardinal" x="143" y="330">1</text><text class="cardinal" x="703" y="396">N</text>`;

  target.innerHTML = `<svg viewBox="0 0 830 430" role="img" aria-label="Diagram ERD: pelanggan, permintaan layanan, jadwal kunjungan, detail permintaan, layanan, dan kategori layanan">${relations}${boxes}</svg>`;
}

// Tab ERD / Flowchart / Pseudocode.
const docTabs = Array.from(document.querySelectorAll('.doc-tabs [role="tab"]'));

function selectDocTab(tab) {
  docTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    if (panel) panel.hidden = !active;
  });
}

docTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDocTab(tab));
  tab.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % docTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index + docTabs.length - 1) % docTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = docTabs.length - 1;
    selectDocTab(docTabs[nextIndex]);
    docTabs[nextIndex].focus();
  });
});

// Pseudocode berbahasa Indonesia.
const PSEUDO = {
  'Pilih Layanan': `// Tombol "Tanyakan layanan" memilih layanan pada formulir
PROSEDUR PilihLayanan(tombol)
  layanan_terpilih <- AMBIL data-service DARI tombol
  JIKA layanan_terpilih KOSONG MAKA
    KELUAR
  AKHIR JIKA
  opsi <- CARI opsi pada daftar layanan formulir
          YANG teksnya SAMA DENGAN layanan_terpilih
  JIKA opsi DITEMUKAN MAKA
    UBAH pilihan layanan formulir <- opsi
  AKHIR JIKA
AKHIR PROSEDUR`,

  'Validasi Form': `// Memeriksa kolom wajib sebelum pesan disiapkan
FUNGSI ValidasiFormulir(formulir)
  kolom_kosong_pertama <- KOSONG
  UNTUK SETIAP kolom DI kolom_wajib(formulir) LAKUKAN
    JIKA kolom.nilai KOSONG setelah spasi dihapus MAKA
      TANDAI kolom "Kolom ini wajib diisi."
      JIKA kolom_kosong_pertama KOSONG MAKA
        kolom_kosong_pertama <- kolom
      AKHIR JIKA
    SELAIN ITU
      HAPUS pesan validasi pada kolom
    AKHIR JIKA
  AKHIR UNTUK
  JIKA formulir TIDAK VALID MAKA
    SEMBUNYIKAN notifikasi sukses
    TAMPILKAN pesan validasi browser
    JIKA kolom_kosong_pertama ADA MAKA
      FOKUSKAN kolom_kosong_pertama
    AKHIR JIKA
    KEMBALIKAN GAGAL
  AKHIR JIKA
  KEMBALIKAN BERHASIL
AKHIR FUNGSI`,

  'Kirim WhatsApp': `// Menyusun pesan dan membuka WhatsApp setelah formulir valid
PROSEDUR KirimPermintaan(formulir)
  CEGAH pengiriman halaman bawaan
  JIKA ValidasiFormulir(formulir) GAGAL MAKA
    KELUAR
  AKHIR JIKA
  data <- BACA nama, nomor WhatsApp, lokasi, layanan, detail kebutuhan
  pesan <- SUSUN salam + data + permintaan informasi jadwal dan biaya
  tautan <- "https://wa.me/" + NOMOR_BISNIS + "?text=" + URL_ENCODE(pesan)
  TAMPILKAN notifikasi "Pesan berhasil disiapkan"
  TAMPILKAN tautan WhatsApp cadangan
  jendela <- BUKA tautan di tab baru
  JIKA jendela KOSONG MAKA
    TAMPILKAN petunjuk memakai tautan cadangan
  AKHIR JIKA
  // Pengiriman final dilakukan pengunjung di aplikasi WhatsApp
AKHIR PROSEDUR`,

  'Simpan Data (rencana)': `// RENCANA PENGEMBANGAN: belum dipakai pada website saat ini
FUNGSI SimpanPermintaan(data_formulir, daftar_layanan)
  MULAI TRANSAKSI
    pelanggan <- AMBIL Pelanggan DENGAN no_whatsapp dari data_formulir
    JIKA pelanggan TIDAK ADA MAKA
      pelanggan <- BUAT Pelanggan(nama, no_whatsapp, lokasi)
    AKHIR JIKA
    id_permintaan <- BUAT PermintaanLayanan(pelanggan.id_pelanggan, HARI INI, detail_kebutuhan, "BARU")
    UNTUK SETIAP layanan DI daftar_layanan LAKUKAN
      SIMPAN DetailPermintaan(id_permintaan, layanan.id_layanan, layanan.jumlah_unit)
    AKHIR UNTUK
  SELESAI TRANSAKSI
  KEMBALIKAN id_permintaan
AKHIR FUNGSI

FUNGSI JadwalkanKunjungan(id_permintaan, tanggal, nama_teknisi)
  permintaan <- AMBIL PermintaanLayanan DENGAN id_permintaan
  SIMPAN JadwalKunjungan(id_permintaan, tanggal, nama_teknisi, "TERJADWAL")
  UBAH permintaan.status <- "DIJADWALKAN"
AKHIR FUNGSI`
};

const PSEUDO_KEYWORDS = [
  'SELAIN ITU', 'SAMA DENGAN', 'TIDAK VALID', 'TIDAK ADA', 'HARI INI',
  'PROSEDUR', 'FUNGSI', 'AKHIR', 'JIKA', 'MAKA', 'UNTUK', 'SETIAP', 'DI', 'LAKUKAN',
  'AMBIL', 'DARI', 'DENGAN', 'SIMPAN', 'UBAH', 'BUAT', 'KEMBALIKAN', 'KELUAR',
  'TAMPILKAN', 'SEMBUNYIKAN', 'MULAI', 'SELESAI', 'TRANSAKSI', 'BUKA', 'SUSUN', 'BACA',
  'TANDAI', 'HAPUS', 'FOKUSKAN', 'CEGAH', 'CARI', 'YANG', 'DITEMUKAN', 'KOSONG',
  'ADA', 'GAGAL', 'BERHASIL'
];
const PSEUDO_PATTERN = new RegExp(`("[^"]*")|\\b(${PSEUDO_KEYWORDS.join('|')})\\b`, 'g');

// Menyorot teks dan kata kunci pseudocode. Teks di-escape lebih dulu agar aman.
function highlightPseudo(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .split('\n')
    .map((line) => {
      if (line.trim().startsWith('//')) return `<span class="kom">${line}</span>`;
      return line.replace(PSEUDO_PATTERN, (match, quoted) => (
        quoted ? `<span class="str">${match}</span>` : `<span class="kw">${match}</span>`
      ));
    })
    .join('\n');
}

const codeSubtabs = document.querySelector('#code-subtabs');
const codeView = document.querySelector('#code-view');
const codeCopy = document.querySelector('#code-copy');
const codeStatus = document.querySelector('#code-status');
let activeCode = Object.keys(PSEUDO)[0];

function drawCode() {
  if (!codeSubtabs || !codeView) return;
  codeSubtabs.innerHTML = Object.keys(PSEUDO).map((name) =>
    `<button type="button" data-code="${name}" aria-pressed="${name === activeCode}">${name}</button>`
  ).join('');
  codeView.innerHTML = highlightPseudo(PSEUDO[activeCode]);
  if (codeStatus) codeStatus.textContent = '';
}

if (codeSubtabs) {
  codeSubtabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-code]');
    if (!button) return;
    activeCode = button.dataset.code;
    drawCode();
  });
}

if (codeCopy && codeStatus) {
  codeCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(PSEUDO[activeCode]);
      codeStatus.textContent = 'Kode disalin.';
    } catch (error) {
      codeStatus.textContent = 'Gagal menyalin. Pilih teks lalu salin secara manual.';
    }
  });
}

drawErd();
drawCode();
