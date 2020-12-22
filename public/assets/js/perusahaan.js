"use strict";

// Replace All
String.prototype.replaceAll = function(strReplace, strWith) {
  // See http://stackoverflow.com/a/3561711/556609
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
};

// Reactive UI
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
    template: function (props) {
      if(props.table.length > 0) {
        return `<table id="perusahaan" class="table space-top">
          <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>NPWP</th>
                <th>Nama Perusahan</th>
                <th>Alamat</th>
                <th>Email</th>
                <th>Website</th>
                <th>Bentuk Usaha</th>
                <th>Jenis Usaha</th>
                <th>Detail</th>
                <th>Tender</th>
              </tr>
          </thead>
          <tbody>
              ${props.table.map(function(item, index) {
              var num = (index+1);
              var readdress = '-';
              if (item.bu_alamat) {
                readdress = item.bu_alamat + '<br>';
                readdress += item.bu_kabupaten + (item.bu_kodepos == 0 ? '<br>' : ' '+ item.bu_kodepos + '<br>');
                readdress += 'Telp: ' + (item.bu_telepon == 0 ? '-': item.bu_telepon) + '<br>';
                readdress += 'Fax: ' + (item.bu_fax == 0 ? '-': item.bu_fax);
              }
              var status = '';
              switch (true) {
                case (item.bu_status_registrasi === 'Proses') :
                  status = '<span class="badge badge-warning space-right">'+item.bu_status_registrasi+'</span>';
                  break;
                case (item.bu_status_registrasi === 'Tidak Diketemukan') :
                  status = '<span class="badge badge-danger space-right">'+item.bu_status_registrasi+'</span>';
                  break;
                default: 
                  status = '<span class="badge badge-success space-right">'+item.bu_status_registrasi+'</span>';
              }
              return `<tr>
                  <td data-label="#">${num+((props.pageNow-1)*props.itemPerPage)}</td>
                  <td data-label="Status">${status}</td>
                  <td data-label="NPWP">${item.npwp}</td>
                  <td data-label="Nama Perusahaan">${(item.nama_peserta) ? item.nama_peserta: '-'}</td>
                  <td data-label="Alamat">${readdress}</td>
                  <td data-label="Email">${(item.bu_email)?item.bu_email:'-'}</td>
                  <td data-label="Website">${(item.bu_website)?item.bu_website:'-'}</td>
                  <td data-label="Bentuk Usaha">${(item.bu_bentuk_badan_usaha)?item.bu_bentuk_badan_usaha:'-'}</td>
                  <td data-label="Jenis Usaha">${(item.bu_jenis_badan_usaha)?item.bu_jenis_badan_usaha:'-'}</td>
                  <td data-label="Detail">${item.bu_status_registrasi === 'Tidak Diketemukan'? '-' : `<a href="javascript:void(0)" class="btn btn-a btn-sm smooth" onclick="showPerusahaan('${item.npwp}','${item.nama_peserta}')">Detail</a>`}</td>
                  <td data-label="Tender">${item.bu_status_registrasi === 'Tidak Diketemukan'? '-' : `<a href="javascript:void(0)" class="btn btn-b btn-sm smooth" onclick="showTender('${item.npwp}','${item.nama_peserta}')">Tender</a>`}</td>
              </tr>`;
              }).join('')}
          </tbody>
          </table>
          <div class="row">
          <span class="pull-right" style="margin-top:10px;">Halaman ${props.pageNow} dari ${props.totalPage}</span>
          <span class="pull-left">
              Page 
              <input id="jumpPage" type="number" class="smooth space-left space-right" value="${props.pageNow}"><span onclick="jumpPage()" class="btn btn-a btn-sm smooth space-right">GO</span>
              <button onclick="prevPage()" class="btn btn-sm smooth space-right"><i class="mdi mdi-arrow-left-bold space-right"></i> Prev</button>
              <button onclick="nextPage()" class="btn btn-sm smooth">Next <i class="mdi mdi-arrow-right-bold space-left"></i></button>
              <button onclick="export_csv('perusahaan','export_perusahaan_halaman_${props.pageNow}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>
          </span>
          </div>`;
      } else {
        return (props.message) ? '<div class="row"><message class="danger">'+props.message+'</message></div>' : '';
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
    })
    .post('@{CONF.baseUrl}/perusahaan/dataperusahaan', {
      katakunci:value,
      sortby:0,
      sortbyasc:0,
      filterby:(filterby === '' || filterby === 0 || filterby === undefined || filterby === null ? []: [filterby]),
      filter:(filter.length > 0 ? [filter]: ['']),
      page:pagenow,
      limit:itemperpage
    })
    .then(function (response, xhr) {
      if(response.sts_res === 'true' && response.data.length > 0) {
        var totalrec = parseInt(response.totalrecord);
        var totalpage = Math.ceil(totalrec/itemperpage);
        app.data.table = response.data;
        app.data.pageNow = pagenow;
        app.data.itemPerPage = itemperpage;
        app.data.totalPage = totalpage;
        app.data.totalRecords= totalrec;
      } else {
        reset();
      }
    })
    .catch(function(response, xhr) {
      console.log(xhr.responseText);
      reset();
    });
  }
  
  // Refresh Data
  function refresh(msg) {
    app.data.table = [];
    app.data.pageNow = 1;
    app.data.totalPage = 0;
    app.data.totalRecords= 0;
    app.data.message = msg;
  }
  
  // Reset Data
  function reset() {
    refresh('Data tidak ditemukan!');
  }
  
  // Next Page
  function nextPage() {
    if(app.data.pageNow < app.data.totalPage) {
      app.data.pageNow = app.data.pageNow + 1;
      searchData(Dom.id('search').value,app.data.pageNow,app.data.itemPerPage, app.data.filterby, app.data.filter);
    }
  }
  
  // Previous Page
  function prevPage() {
    if(app.data.pageNow > 1) {
      app.data.pageNow = app.data.pageNow - 1;
      searchData(Dom.id('search').value,app.data.pageNow,app.data.itemPerPage, app.data.filterby, app.data.filter);
    }
  }


// Go / Jump to page
function jumpPage() {
    app.data.pageNow = parseInt(Dom.id('jumpPage').value);
    if(app.data.pageNow < 1) app.data.pageNow = 1;
    if(app.data.pageNow > app.data.totalPage) app.data.pageNow = app.data.totalPage;
    searchData(Dom.id('search').value,app.data.pageNow,app.data.itemPerPage, app.data.filterby, app.data.filter);
  }
  
  // Submit Search
  function submitSearch() {
    app.data.pageNow = 1;
    app.data.filter = Dom.id('ifilter').value;
    searchData(Dom.id('search').value, app.data.pageNow, app.data.itemPerPage, app.data.filterby, app.data.filter);
  }
  
  // Event listener when search box is entered
  Dom.id('search').addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
      submitSearch();
    }
  });
  
  // Event listener when ifilter box is entered
  Dom.id('ifilter').addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
      submitSearch();
    }
  });
  
  // load data
  _getDataFilterBy();

  // Set Filter By
  function setFilterBy(self) {
    Dom.id('onprogress').innerHTML = '';
    app.data.table = [];
    app.data.message = '';
    app.data.filterby = parseInt(self.value);
    app.data.filter = '';
    Dom.id('ifilter').style.display = 'none';
    Dom.id('search').style.display = 'none';
    if(app.data.filterby === 7) {
      Dom.id('ifilter').style.display = 'inline';
      Dom.id('search').style.display = 'inline';
      Dom.id('ifilter').placeholder = "Input Nama Perusahaan";
    } else if(app.data.filterby === 8) {
      Dom.id('ifilter').style.display = 'inline';
      Dom.id('ifilter').placeholder = "Input NPWP";
      Dom.id('search').style.display = 'none';
    } else {
      Dom.id('ifilter').style.display = 'none';
      Dom.id('search').style.display = 'none';
    }
  }

  function _clearDataFilter(el) {
    var i, L = Dom.id(el).options.length - 1;
    for(i = L; i >= 0; i--) {
      Dom.id(el).remove(i);
    }
  }

  function _getDataFilterBy() {
    _clearDataFilter('filterby');
    var url = '@{CONF.baseUrl}/num/filterby';
    ajax({
      headers: {
        'pbj-api-key':'ngupas@2020',
        'content-type':'application/json'
      }
    })
    .post(url, {filterbytypeid:2})
    .then(function(response, xhr) {
      if(response.sts_res === 'true' && response.data.length > 0) {
        var opt = '';
        for (var x=0; x<response.data.length; x++) {
          opt += '<option value="'+response.data[x].filter_by_id+'">'+response.data[x].filter_by_name+'</option>';
        }
        Dom.append(Dom.id('filterby'),opt);
      }
    })
    .catch(function(response, xhr){
      console.log(xhr.responseText);
    })
  }

  function showPerusahaan(npwp, name) {
    ajax({
      headers: {
        'pbj-api-key':'ngupas@2020',
        'content-type':'application/json'
      }
    })
    .post('@{CONF.baseUrl}/perusahaan/detailperusahaan', {
      npwp: npwp
    })
    .then(function(response, xhr) {
      if(response.sts_res === 'true' && response.data.length > 0) {
        detail.data.npwp = npwp;
        detail.data.name = name;
        detail.data.kualifikasi = response.data[0];
        detail.data.keuangan = response.data[1];
        detail.data.pengurus = response.data[2];
        detail.data.tenagakerja = response.data[3];
      }
    })
    .catch(function(response, xhr) {
      console.log(xhr.responseText);
    }) 
  }

  function showTender(npwp,company) {
    ajax({
      headers: {
        'pbj-api-key':'ngupas@2020',
        'content-type':'application/json'
      }
    })
    .post('@{CONF.baseUrl}/tender/datatender', {
      katakunci:Dom.id('search').value,
      sortby:0,
      sortbyasc:0,
      filterby:[3],
      filter:[npwp],
      page:1,
      limit:1000
    })
    .then(function(response, xhr) {
      if(response.sts_res === 'true' && response.data.length > 0) {
        tender.data.name = 'tender';
        tender.data.company = company;
        tender.data.table = response.data;
      } else {
       tender.data.message = response.sts_des; 
      }
    })
    .catch(function(response, xhr) {
      console.log(xhr.responseText);
    })
  }

  document.addEventListener('render', function (event) {

    // Only run for elements with the #detail ID
    if (event.target.matches('#detail')) {
      // Log the data at the time of render
      if(event.detail.npwp) {
        var modal = new tingle.modal({
          footer: true,
          stickyFooter: false,
          closeMethods: ['overlay', 'button', 'escape'],
          beforeOpen: function() {
            Dom.id('detail').style.display = 'inline';
            modal.setContent(Dom.id('detail').innerHTML);
          },
          onOpen: function() {
            console.log('OPENED! '+event.detail.npwp);
            Dom.id('detail').innerHTML = '';
          },
          onClose: function() {
            detail.data.npwp = '';
            modal.destroy();
          }
        });
        modal.open();
      }
    }

    // Only run for elements with the #app ID
    if (event.target.matches('#tender')) {
      // Log the data at the time of render
      if(event.detail.name === 'tender') {
        var modaltender = new tingle.modal({
          footer: true,
          stickyFooter: false,
          closeMethods: ['overlay', 'button', 'escape'],
          beforeOpen: function() {
            Dom.id('tender').style.display = 'inline';
            modaltender.setContent(Dom.id('tender').innerHTML);
          },
          onOpen: function() {
            console.log('OPENED! '+event.detail.name);
            Dom.id('tender').innerHTML = '';
          },
          onClose: function() {
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
    data:{
      name: '',
      company: '',
      npwp: '',
      table: [],
      message: ''
    },
    template: function(props) {
      if(props.table.length > 0) {
        return `${(props.company?`<p>Tender yang pernah diikuti oleh <b>${props.company}</b></p><hr>`:'')}
        ${(props.table.length > 0 ? `<button onclick="export_csv('histori-tender','riwayat_tender_${props.npwp}_${props.company}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>`:'')}
        <table id="histori-tender" class="table space-top">
          <thead>
              <tr>
              <th>#</th>
              <th>Kode</th>
              <th>Nama Paket</th>
              <th>Instansi</th>
              <th>Tahap</th>
              <th>HPS</th>
              <th>Tanggal Update</th>
              <th>Link</th>
              <th>Status Tender</th>
              </tr>
          </thead>
          <tbody>
              ${props.table.map(function(item, index) {
              item.modified_date = item.modified_date.replaceAll('&#58;',':');
              var statpemenang = '';
              switch(true) {
                case item.status_pemenang === 'PESERTA':
                  statpemenang = '<span class="badge badge-warning space-right">'+item.status_pemenang+'</span>';
                  break;
                case item.status_pemenang === 'PEMENANG':
                  statpemenang = '<span class="badge badge-success space-right">'+item.status_pemenang+'</span>';
                  break;
                default:
                  statpemenang = '-';
              }
              return `<tr>
                  <td data-label="#">${(index+1)}</td>
                  <td data-label="Kode">${item.kode}</td>
                  <td data-label="Nama Paket">${(item.tender_label) ? '<span class="badge badge-warning space-right">'+item.tender_label+'</span>': ''}${item.nama_paket}</td>
                  <td data-label="Instansi">${item.instansi}</td>
                  <td data-label="Tahap">${item.tahap}</td>
                  <td data-label="HPS">${item.hps}</td>
                  <td data-label="Tanggal Update">${moment(item.modified_date).format('DD MMM YYYY HH:mm')}</td>
                  <td data-label="Link"><a href="${item.url_tender_link}/${item.kode}/pengumumanlelang" class="btn btn-b btn-sm smooth" target="_blank" rel="nofollow noopener">Cek Paket</a></td>
                  <td data-label="Status Tender">${statpemenang}</td>
              </tr>`;
              }).join('')}
          </tbody>
          </table>`;
      } else {
        return (props.message) ? '<div class="row"><message class="danger">'+props.message+'</message></div>' : '';
      }
    }
  });

  var detail = new Reef('#detail', {
    data: {
      npwp: '',
      name: '',
      kualifikasi: [],
      keuangan: [],
      pengurus: [],
      tenagakerja: []
    },
    template: function(props) {
      if(props.npwp) {
        return `<div class="tab">
          <button class="tablinks active" onclick="openCity(event, 'klasifikasi')">Klasifikasi dan Kualisi</button>
          <button class="tablinks" onclick="openCity(event, 'keuangan')">Keuangan</button>
          <button class="tablinks" onclick="openCity(event, 'pengurus')">Pengurus</button>
          <button class="tablinks" onclick="openCity(event, 'tenagakerja')">Tenaga Kerja</button>
        </div>
        
        <div id="klasifikasi" class="tabcontent" style="display:block;">
          ${(props.kualifikasi.length > 0 ? `<button onclick="export_csv('table-klasifikasi','klasifikasi_dan_kualisi_${props.npwp}_${props.name}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>`:'')}
          <table id="table-klasifikasi" class="table space-top">
            <thead>
                <tr>
                  <th>#</th>
                  <th>Sub Bidang</th>
                  <th>Kode</th>
                  <th>Kualifikasi</th>
                  <th>Tahun</th>
                  <th>Nilai</th>
                  <th>Asosiasi</th>
                  <th>Tgl Permohonan</th>
                  <th>Tgl Cetak Pertama</th>
                  <th>Tgl Cetak Perubahan Terakhir</th>
                  <th>Tgl Registrasi Th2</th>
                </tr>
            </thead>
            <tbody>
              ${props.kualifikasi.map(function(item, index) {
                return `<tr>
                    <td data-label="#">${(index+1)}</td>
                    <td data-label="Sub Bidang">${item.bu_klasifikasi_sub_bidang_klasifikasi}</td>
                    <td data-label="Kode">${item.bu_klasifikasi_kode}</td>
                    <td data-label="Kualifikasi">${item.bu_klasifikasi_kualifikasi}</td>
                    <td data-label="Tahun">${item.bu_klasifikasi_tahun}</td>
                    <td data-label="Nilai">${item.bu_klasifikasi_nilai}</td>
                    <td data-label="Asosiasi">${item.bu_klasifikasi_asosiasi}</td>
                    <td data-label="Tgl Permohonan">${item.bu_klasifikasi_tanggal_permohonan}</td>
                    <td data-label="Tgl Cetak Pertama">${item.bu_klasifikasi_tanggal_cetak_pertama}</td>
                    <td data-label="Tgl Cetak Perubahan Terakhir">${item.bu_klasifikasi_tanggal_cetak_perubahan_terakhir}</td>
                    <td data-label="Tgl Registrasi Th2">${(item.bu_klasifikasi_tanggal_registrasi_tahun_2?item.bu_klasifikasi_tanggal_registrasi_tahun_2:'-')}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="keuangan" class="tabcontent">
          ${(props.keuangan.length > 0 ? `<button onclick="export_csv('table-keuangan','keuangan_${props.npwp}_${props.name}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>` : '')}
          <table id="table-keuangan" class="table space-top">
            <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>KTP</th>
                  <th>Alamat</th>
                  <th>Jumlah Saham</th>
                  <th>Satuan Saham</th>
                  <th>Modal Dasar</th>
                  <th>Modal Setor</th>
                </tr>
            </thead>
            <tbody>
              ${props.keuangan.map(function(item, index) {
                return `<tr>
                    <td data-label="#">${(index+1)}</td>
                    <td data-label="Nama">${item.bu_keuangan_nama}</td>
                    <td data-label="KTP">${item.bu_keuangan_ktp}</td>
                    <td data-label="Alamat">${item.bu_keuangan_alamat}</td>
                    <td data-label="Jumlah Saham">${item.bu_keuangan_jumlah_saham}</td>
                    <td data-label="Satuan Saham">${item.bu_keuangan_satuan_saham}</td>
                    <td data-label="Modal Dasar">${item.bu_keuangan_modal_dasar}</td>
                    <td data-label="Modal Setor">${item.bu_keuangan_modal_setor}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="pengurus" class="tabcontent">
          ${(props.pengurus.length > 0 ? `<button onclick="export_csv('table-pengurus','pengurus_${props.npwp}_${props.name}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>` : '')}
          <table id="table-pengurus" class="table space-top">
            <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Tgl Lahir</th>
                  <th>Alamat</th>
                  <th>KTP</th>
                  <th>Jabatan</th>
                  <th>Pendidikan</th>
                </tr>
            </thead>
            <tbody>
              ${props.pengurus.map(function(item, index) {
                return `<tr>
                    <td data-label="#">${(index+1)}</td>
                    <td data-label="Nama">${item.bu_pengurus_nama}</td>
                    <td data-label="Tgl Lahir">${item.bu_pengurus_tanggal_lahir}</td>
                    <td data-label="Alamat">${item.bu_pengurus_alamat}</td>
                    <td data-label="KTP">${item.bu_pengurus_ktp}</td>
                    <td data-label="Jabatan">${item.bu_pengurus_jabatan}</td>
                    <td data-label="Pendidikan">${item.bu_pengurus_pendidikan}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="tenagakerja" class="tabcontent">
          ${(props.tenagakerja.length > 0 ? `<button onclick="export_csv('table-tenagakerja','tenaga_kerja_${props.npwp}_${props.name}.csv')" class="btn btn-c btn-sm smooth">Export CSV</button>` : '')}
          <table id="table-tenagakerja" class="table space-top">
            <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Tgl Lahir</th>
                  <th>KTP</th>
                  <th>Pendidikan</th>
                  <th>No Registrasi</th>
                  <th>Jenis Sertifikat</th>
                  <th>Link</th>
                </tr>
            </thead>
            <tbody>
              ${props.tenagakerja.map(function(item, index) {
                return `<tr>
                    <td data-label="#">${(index+1)}</td>
                    <td data-label="Nama">${item.bu_tenaga_kerja_nama}</td>
                    <td data-label="Tgl Lahir">${item.bu_tenaga_kerja_tanggal_lahir}</td>
                    <td data-label="KTP">${item.bu_tenaga_kerja_ktp}</td>
                    <td data-label="Pendidikan">${item.bu_tenaga_kerja_pendidikan}</td>
                    <td data-label="No Registrasi">${item.bu_tenaga_kerja_no_registrasi}</td>
                    <td data-label="Jenis Sertifikat">${item.bu_tenaga_kerja_jenis_sertifikat}</td>
                    <td data-label="Link"><a href="${item.bu_tenaga_kerja_detail_link}" class="btn btn-b btn-sm smooth" target="_blank" rel="nofollow noopener">Cek</a></td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
      } else {
        return ``;
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

  // export data
  function export_csv(table_id, filename, separator = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    filename = (filename === undefined) ? 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv' : filename;
    // var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }