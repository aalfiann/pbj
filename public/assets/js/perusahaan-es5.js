"use strict"; // Replace All

String.prototype.replaceAll = function (strReplace, strWith) {
  // See http://stackoverflow.com/a/3561711/556609
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
}; // Reactive UI


var app = new Reef('#app', {
  data: {
    table: [],
    pageNow: 1,
    itemPerPage: 25,
    totalPage: 0,
    totalRecords: 0,
    message: '',
    filterby: 7,
    filter: ''
  },
  template: function template(props) {
    if (props.table.length > 0) {
      return "<table class=\"table space-top\">\n          <thead>\n              <tr>\n                <th>#</th>\n                <th>Status</th>\n                <th>NPWP</th>\n                <th>Nama Perusahan</th>\n                <th>Alamat</th>\n                <th>Email</th>\n                <th>Website</th>\n                <th>Bentuk Usaha</th>\n                <th>Jenis Usaha</th>\n                <th>Detail</th>\n                <th>Tender</th>\n              </tr>\n          </thead>\n          <tbody>\n              ".concat(props.table.map(function (item, index) {
        var num = index + 1;
        var readdress = '-';

        if (item.bu_alamat) {
          readdress = item.bu_alamat + '<br>';
          readdress += item.bu_kabupaten + (item.bu_kodepos == 0 ? '<br>' : ' ' + item.bu_kodepos + '<br>');
          readdress += 'Telp: ' + (item.bu_telepon == 0 ? '-' : item.bu_telepon) + '<br>';
          readdress += 'Fax: ' + (item.bu_fax == 0 ? '-' : item.bu_fax);
        }

        var status = '';

        switch (true) {
          case item.bu_status_registrasi === 'Proses':
            status = '<span class="badge badge-warning space-right">' + item.bu_status_registrasi + '</span>';
            break;

          case item.bu_status_registrasi === 'Tidak Diketemukan':
            status = '<span class="badge badge-danger space-right">' + item.bu_status_registrasi + '</span>';
            break;

          default:
            status = '<span class="badge badge-success space-right">' + item.bu_status_registrasi + '</span>';
        }

        return "<tr>\n                  <td data-label=\"#\">".concat(num + (props.pageNow - 1) * props.itemPerPage, "</td>\n                  <td data-label=\"Status\">").concat(status, "</td>\n                  <td data-label=\"NPWP\">").concat(item.npwp, "</td>\n                  <td data-label=\"Nama Perusahaan\">").concat(item.nama_peserta ? item.nama_peserta : '-', "</td>\n                  <td data-label=\"Alamat\">").concat(readdress, "</td>\n                  <td data-label=\"Email\">").concat(item.bu_email ? item.bu_email : '-', "</td>\n                  <td data-label=\"Website\">").concat(item.bu_website ? item.bu_website : '-', "</td>\n                  <td data-label=\"Bentuk Usaha\">").concat(item.bu_bentuk_badan_usaha ? item.bu_bentuk_badan_usaha : '-', "</td>\n                  <td data-label=\"Jenis Usaha\">").concat(item.bu_jenis_badan_usaha ? item.bu_jenis_badan_usaha : '-', "</td>\n                  <td data-label=\"Detail\">").concat(item.bu_status_registrasi === 'Tidak Diketemukan' ? '-' : "<a href=\"javascript:void(0)\" class=\"btn btn-a btn-sm smooth\" onclick=\"showPerusahaan('".concat(item.npwp, "')\">Detail</a>"), "</td>\n                  <td data-label=\"Tender\">").concat(item.bu_status_registrasi === 'Tidak Diketemukan' ? '-' : "<a href=\"javascript:void(0)\" class=\"btn btn-b btn-sm smooth\" onclick=\"showTender('".concat(item.npwp, "','").concat(item.nama_peserta, "')\">Tender</a>"), "</td>\n              </tr>");
      }).join(''), "\n          </tbody>\n          </table>\n          <div class=\"row\">\n          <span class=\"pull-right\" style=\"margin-top:10px;\">Halaman ").concat(props.pageNow, " dari ").concat(props.totalPage, "</span>\n          <span class=\"pull-left\">\n              Page \n              <input id=\"jumpPage\" type=\"number\" class=\"smooth space-left space-right\" value=\"").concat(props.pageNow, "\"><span onclick=\"jumpPage()\" class=\"btn btn-a btn-sm smooth space-right\">GO</span>\n              <button onclick=\"prevPage()\" class=\"btn btn-sm smooth space-right\"><i class=\"mdi mdi-arrow-left-bold space-right\"></i> Prev</button>\n              <button onclick=\"nextPage()\" class=\"btn btn-sm smooth\">Next <i class=\"mdi mdi-arrow-right-bold space-left\"></i></button>\n          </span>\n          </div>");
    } else {
      return props.message ? '<div class="row"><message class="danger">' + props.message + '</message></div>' : '';
    }
  }
});
app.render();

function searchData(value, pagenow, itemperpage, filterby, filter) {
  refresh('Proses loading data...');
  ajax({
    headers: {
      'pbj-api-key': 'ngupas@2020',
      'content-type': 'application/json'
    }
  }).post('@{CONF.baseUrl}/perusahaan/dataperusahaan', {
    katakunci: value,
    sortby: 0,
    sortbyasc: 0,
    filterby: filterby === '' || filterby === 0 || filterby === undefined || filterby === null ? [] : [filterby],
    filter: filter.length > 0 ? [filter] : [''],
    page: pagenow,
    limit: itemperpage
  }).then(function (response, xhr) {
    if (response.sts_res === 'true' && response.data.length > 0) {
      var totalrec = parseInt(response.totalrecord);
      var totalpage = Math.ceil(totalrec / itemperpage);
      app.data.table = response.data;
      app.data.pageNow = pagenow;
      app.data.itemPerPage = itemperpage;
      app.data.totalPage = totalpage;
      app.data.totalRecords = totalrec;
    } else {
      reset();
    }
  })["catch"](function (response, xhr) {
    console.log(xhr.responseText);
    reset();
  });
} // Refresh Data


function refresh(msg) {
  app.data.table = [];
  app.data.pageNow = 1;
  app.data.totalPage = 0;
  app.data.totalRecords = 0;
  app.data.message = msg;
} // Reset Data


function reset() {
  refresh('Data tidak ditemukan!');
} // Next Page


function nextPage() {
  if (app.data.pageNow < app.data.totalPage) {
    app.data.pageNow = app.data.pageNow + 1;
    searchData(Dom.id('search').value, app.data.pageNow, app.data.itemPerPage, app.data.filterby, app.data.filter);
  }
} // Previous Page


function prevPage() {
  if (app.data.pageNow > 1) {
    app.data.pageNow = app.data.pageNow - 1;
    searchData(Dom.id('search').value, app.data.pageNow, app.data.itemPerPage, app.data.filterby, app.data.filter);
  }
} // Go / Jump to page


function jumpPage() {
  app.data.pageNow = parseInt(Dom.id('jumpPage').value);
  if (app.data.pageNow < 1) app.data.pageNow = 1;
  if (app.data.pageNow > app.data.totalPage) app.data.pageNow = app.data.totalPage;
  searchData(Dom.id('search').value, app.data.pageNow, app.data.itemPerPage, app.data.filterby, app.data.filter);
} // Submit Search


function submitSearch() {
  app.data.pageNow = 1;
  app.data.filter = Dom.id('ifilter').value;
  searchData(Dom.id('search').value, app.data.pageNow, app.data.itemPerPage, app.data.filterby, app.data.filter);
} // Event listener when search box is entered


Dom.id('search').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    submitSearch();
  }
}); // Event listener when ifilter box is entered

Dom.id('ifilter').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    submitSearch();
  }
}); // load data

_getDataFilterBy(); // Set Filter By


function setFilterBy(self) {
  Dom.id('onprogress').innerHTML = '';
  app.data.table = [];
  app.data.message = '';
  app.data.filterby = parseInt(self.value);
  app.data.filter = '';
  Dom.id('ifilter').style.display = 'none';
  Dom.id('search').style.display = 'none';

  if (app.data.filterby === 7) {
    Dom.id('ifilter').style.display = 'inline';
    Dom.id('search').style.display = 'inline';
    Dom.id('ifilter').placeholder = "Input Nama Perusahaan";
  } else if (app.data.filterby === 8) {
    Dom.id('ifilter').style.display = 'inline';
    Dom.id('ifilter').placeholder = "Input NPWP";
    Dom.id('search').style.display = 'none';
  } else {
    Dom.id('ifilter').style.display = 'none';
    Dom.id('search').style.display = 'none';
  }
}

function _clearDataFilter(el) {
  var i,
      L = Dom.id(el).options.length - 1;

  for (i = L; i >= 0; i--) {
    Dom.id(el).remove(i);
  }
}

function _getDataFilterBy() {
  _clearDataFilter('filterby');

  var url = '@{CONF.baseUrl}/num/filterby';
  ajax({
    headers: {
      'pbj-api-key': 'ngupas@2020',
      'content-type': 'application/json'
    }
  }).post(url, {
    filterbytypeid: 2
  }).then(function (response, xhr) {
    if (response.sts_res === 'true' && response.data.length > 0) {
      var opt = '';

      for (var x = 0; x < response.data.length; x++) {
        opt += '<option value="' + response.data[x].filter_by_id + '">' + response.data[x].filter_by_name + '</option>';
      }

      Dom.append(Dom.id('filterby'), opt);
    }
  })["catch"](function (response, xhr) {
    console.log(xhr.responseText);
  });
}

function showPerusahaan(npwp) {
  ajax({
    headers: {
      'pbj-api-key': 'ngupas@2020',
      'content-type': 'application/json'
    }
  }).post('@{CONF.baseUrl}/perusahaan/detailperusahaan', {
    npwp: npwp
  }).then(function (response, xhr) {
    if (response.sts_res === 'true' && response.data.length > 0) {
      detail.data.npwp = npwp;
      detail.data.kualifikasi = response.data[0];
      detail.data.keuangan = response.data[1];
      detail.data.pengurus = response.data[2];
      detail.data.tenagakerja = response.data[3];
    }
  })["catch"](function (response, xhr) {
    console.log(xhr.responseText);
  });
}

function showTender(npwp, company) {
  ajax({
    headers: {
      'pbj-api-key': 'ngupas@2020',
      'content-type': 'application/json'
    }
  }).post('@{CONF.baseUrl}/tender/datatender', {
    katakunci: Dom.id('search').value,
    sortby: 0,
    sortbyasc: 0,
    filterby: [3],
    filter: [npwp],
    page: 1,
    limit: 1000
  }).then(function (response, xhr) {
    if (response.sts_res === 'true' && response.data.length > 0) {
      tender.data.name = 'tender';
      tender.data.company = company;
      tender.data.table = response.data;
    } else {
      tender.data.message = response.sts_des;
    }
  })["catch"](function (response, xhr) {
    console.log(xhr.responseText);
  });
}

document.addEventListener('render', function (event) {
  // Only run for elements with the #detail ID
  if (event.target.matches('#detail')) {
    // Log the data at the time of render
    if (event.detail.npwp) {
      var modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        beforeOpen: function beforeOpen() {
          Dom.id('detail').style.display = 'inline';
          modal.setContent(Dom.id('detail').innerHTML);
        },
        onOpen: function onOpen() {
          console.log('OPENED! ' + event.detail.npwp);
          Dom.id('detail').innerHTML = '';
        },
        onClose: function onClose() {
          detail.data.npwp = '';
          modal.destroy();
        }
      });
      modal.open();
    }
  } // Only run for elements with the #app ID


  if (event.target.matches('#tender')) {
    // Log the data at the time of render
    if (event.detail.name === 'tender') {
      var modaltender = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        beforeOpen: function beforeOpen() {
          Dom.id('tender').style.display = 'inline';
          modaltender.setContent(Dom.id('tender').innerHTML);
        },
        onOpen: function onOpen() {
          console.log('OPENED! ' + event.detail.name);
          Dom.id('tender').innerHTML = '';
        },
        onClose: function onClose() {
          tender.data.name = '';
          tender.data.company = '';
          tender.data.table = [];
          tender.data.message = '';
          Dom.id('tender').innerHTML = '';
          modaltender.destroy();
        }
      });
      modaltender.open();
    }
  }
}, false);
var tender = new Reef('#tender', {
  data: {
    name: '',
    company: '',
    npwp: '',
    table: [],
    message: ''
  },
  template: function template(props) {
    if (props.table.length > 0) {
      return "".concat(props.company ? "<p>Tender yang pernah diikuti oleh <b>".concat(props.company, "</b></p><hr>") : '', "<table class=\"table space-top\">\n          <thead>\n              <tr>\n              <th>#</th>\n              <th>Kode</th>\n              <th>Nama Paket</th>\n              <th>Instansi</th>\n              <th>Tahap</th>\n              <th>HPS</th>\n              <th>Tanggal Update</th>\n              <th>Link</th>\n              <th>Status Tender</th>\n              </tr>\n          </thead>\n          <tbody>\n              ").concat(props.table.map(function (item, index) {
        item.modified_date = item.modified_date.replaceAll('&#58;', ':');
        var statpemenang = '';

        switch (true) {
          case item.status_pemenang === 'PESERTA':
            statpemenang = '<span class="badge badge-warning space-right">' + item.status_pemenang + '</span>';
            break;

          case item.status_pemenang === 'PEMENANG':
            statpemenang = '<span class="badge badge-success space-right">' + item.status_pemenang + '</span>';
            break;

          default:
            statpemenang = '-';
        }

        return "<tr>\n                  <td data-label=\"#\">".concat(index + 1, "</td>\n                  <td data-label=\"Kode\">").concat(item.kode, "</td>\n                  <td data-label=\"Nama Paket\">").concat(item.tender_label ? '<span class="badge badge-warning space-right">' + item.tender_label + '</span>' : '').concat(item.nama_paket, "</td>\n                  <td data-label=\"Instansi\">").concat(item.instansi, "</td>\n                  <td data-label=\"Tahap\">").concat(item.tahap, "</td>\n                  <td data-label=\"HPS\">").concat(item.hps, "</td>\n                  <td data-label=\"Tanggal Update\">").concat(moment(item.modified_date).format('DD MMM YYYY HH:mm'), "</td>\n                  <td data-label=\"Link\"><a href=\"").concat(item.url_tender_link, "/").concat(item.kode, "/pengumumanlelang\" class=\"btn btn-b btn-sm smooth\" target=\"_blank\" rel=\"nofollow noopener\">Cek Paket</a></td>\n                  <td data-label=\"Status Tender\">").concat(statpemenang, "</td>\n              </tr>");
      }).join(''), "\n          </tbody>\n          </table>");
    } else {
      return props.message ? '<div class="row"><message class="danger">' + props.message + '</message></div>' : '';
    }
  }
});
var detail = new Reef('#detail', {
  data: {
    npwp: '',
    kualifikasi: [],
    keuangan: [],
    pengurus: [],
    tenagakerja: []
  },
  template: function template(props) {
    if (props.npwp) {
      return "<div class=\"tab\">\n          <button class=\"tablinks active\" onclick=\"openCity(event, 'klasifikasi')\">Klasifikasi dan Kualisi</button>\n          <button class=\"tablinks\" onclick=\"openCity(event, 'keuangan')\">Keuangan</button>\n          <button class=\"tablinks\" onclick=\"openCity(event, 'pengurus')\">Pengurus</button>\n          <button class=\"tablinks\" onclick=\"openCity(event, 'tenagakerja')\">Tenaga Kerja</button>\n        </div>\n        \n        <div id=\"klasifikasi\" class=\"tabcontent\" style=\"display:block;\">\n          <table class=\"table space-top\">\n            <thead>\n                <tr>\n                  <th>#</th>\n                  <th>Sub Bidang</th>\n                  <th>Kode</th>\n                  <th>Kualifikasi</th>\n                  <th>Tahun</th>\n                  <th>Nilai</th>\n                  <th>Asosiasi</th>\n                  <th>Tgl Permohonan</th>\n                  <th>Tgl Cetak Pertama</th>\n                  <th>Tgl Cetak Perubahan Terakhir</th>\n                  <th>Tgl Registrasi Th2</th>\n                </tr>\n            </thead>\n            <tbody>\n              ".concat(props.kualifikasi.map(function (item, index) {
        return "<tr>\n                    <td data-label=\"#\">".concat(index + 1, "</td>\n                    <td data-label=\"Sub Bidang\">").concat(item.bu_klasifikasi_sub_bidang_klasifikasi, "</td>\n                    <td data-label=\"Kode\">").concat(item.bu_klasifikasi_kode, "</td>\n                    <td data-label=\"Kualifikasi\">").concat(item.bu_klasifikasi_kualifikasi, "</td>\n                    <td data-label=\"Tahun\">").concat(item.bu_klasifikasi_tahun, "</td>\n                    <td data-label=\"Nilai\">").concat(item.bu_klasifikasi_nilai, "</td>\n                    <td data-label=\"Asosiasi\">").concat(item.bu_klasifikasi_asosiasi, "</td>\n                    <td data-label=\"Tgl Permohonan\">").concat(item.bu_klasifikasi_tanggal_permohonan, "</td>\n                    <td data-label=\"Tgl Cetak Pertama\">").concat(item.bu_klasifikasi_tanggal_cetak_pertama, "</td>\n                    <td data-label=\"Tgl Cetak Perubahan Terakhir\">").concat(item.bu_klasifikasi_tanggal_cetak_perubahan_terakhir, "</td>\n                    <td data-label=\"Tgl Registrasi Th2\">").concat(item.bu_klasifikasi_tanggal_registrasi_tahun_2 ? item.bu_klasifikasi_tanggal_registrasi_tahun_2 : '-', "</td>\n                  </tr>");
      }).join(''), "\n            </tbody>\n          </table>\n        </div>\n        \n        <div id=\"keuangan\" class=\"tabcontent\">\n          <table class=\"table space-top\">\n            <thead>\n                <tr>\n                  <th>#</th>\n                  <th>Nama</th>\n                  <th>KTP</th>\n                  <th>Alamat</th>\n                  <th>Jumlah Saham</th>\n                  <th>Satuan Saham</th>\n                  <th>Modal Dasar</th>\n                  <th>Modal Setor</th>\n                </tr>\n            </thead>\n            <tbody>\n              ").concat(props.keuangan.map(function (item, index) {
        return "<tr>\n                    <td data-label=\"#\">".concat(index + 1, "</td>\n                    <td data-label=\"Nama\">").concat(item.bu_keuangan_nama, "</td>\n                    <td data-label=\"KTP\">").concat(item.bu_keuangan_ktp, "</td>\n                    <td data-label=\"Alamat\">").concat(item.bu_keuangan_alamat, "</td>\n                    <td data-label=\"Jumlah Saham\">").concat(item.bu_keuangan_jumlah_saham, "</td>\n                    <td data-label=\"Satuan Saham\">").concat(item.bu_keuangan_satuan_saham, "</td>\n                    <td data-label=\"Modal Dasar\">").concat(item.bu_keuangan_modal_dasar, "</td>\n                    <td data-label=\"Modal Setor\">").concat(item.bu_keuangan_modal_setor, "</td>\n                  </tr>");
      }).join(''), "\n            </tbody>\n          </table>\n        </div>\n        \n        <div id=\"pengurus\" class=\"tabcontent\">\n          <table class=\"table space-top\">\n            <thead>\n                <tr>\n                  <th>#</th>\n                  <th>Nama</th>\n                  <th>Tgl Lahir</th>\n                  <th>Alamat</th>\n                  <th>KTP</th>\n                  <th>Jabatan</th>\n                  <th>Pendidikan</th>\n                </tr>\n            </thead>\n            <tbody>\n              ").concat(props.pengurus.map(function (item, index) {
        return "<tr>\n                    <td data-label=\"#\">".concat(index + 1, "</td>\n                    <td data-label=\"Nama\">").concat(item.bu_pengurus_nama, "</td>\n                    <td data-label=\"Tgl Lahir\">").concat(item.bu_pengurus_tanggal_lahir, "</td>\n                    <td data-label=\"Alamat\">").concat(item.bu_pengurus_alamat, "</td>\n                    <td data-label=\"KTP\">").concat(item.bu_pengurus_ktp, "</td>\n                    <td data-label=\"Jabatan\">").concat(item.bu_pengurus_jabatan, "</td>\n                    <td data-label=\"Pendidikan\">").concat(item.bu_pengurus_pendidikan, "</td>\n                  </tr>");
      }).join(''), "\n            </tbody>\n          </table>\n        </div>\n        \n        <div id=\"tenagakerja\" class=\"tabcontent\">\n          <table class=\"table space-top\">\n            <thead>\n                <tr>\n                  <th>#</th>\n                  <th>Nama</th>\n                  <th>Tgl Lahir</th>\n                  <th>KTP</th>\n                  <th>Pendidikan</th>\n                  <th>No Registrasi</th>\n                  <th>Jenis Sertifikat</th>\n                  <th>Link</th>\n                </tr>\n            </thead>\n            <tbody>\n              ").concat(props.tenagakerja.map(function (item, index) {
        return "<tr>\n                    <td data-label=\"#\">".concat(index + 1, "</td>\n                    <td data-label=\"Nama\">").concat(item.bu_tenaga_kerja_nama, "</td>\n                    <td data-label=\"Tgl Lahir\">").concat(item.bu_tenaga_kerja_tanggal_lahir, "</td>\n                    <td data-label=\"KTP\">").concat(item.bu_tenaga_kerja_ktp, "</td>\n                    <td data-label=\"Pendidikan\">").concat(item.bu_tenaga_kerja_pendidikan, "</td>\n                    <td data-label=\"No Registrasi\">").concat(item.bu_tenaga_kerja_no_registrasi, "</td>\n                    <td data-label=\"Jenis Sertifikat\">").concat(item.bu_tenaga_kerja_jenis_sertifikat, "</td>\n                    <td data-label=\"Link\"><a href=\"").concat(item.bu_tenaga_kerja_detail_link, "\" class=\"btn btn-b btn-sm smooth\" target=\"_blank\" rel=\"nofollow noopener\">Cek</a></td>\n                  </tr>");
      }).join(''), "\n            </tbody>\n          </table>\n        </div>");
    } else {
      return "";
    }
  }
});
detail.render();

function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");

  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}
