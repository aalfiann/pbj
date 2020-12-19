"use strict";

// Reactive UI
var app = new Reef('#app', {
  data: {
    table: [],
    pageNow: 1,
    itemPerPage: 25,
    totalPage: 0,
    totalRecords: 0,
    message: '',
    filterBy: 0,
    filter: ''
  },
  template: function (props) {
    if(props.table.length > 0) {
      return `<table class="table space-top">
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
            <th>Pemenang</th>
            </tr>
        </thead>
        <tbody>
            ${props.table.map(function(item, index) {
            var num = (index+1);
            item.modified_date = item.modified_date.replaceAll('&#58;',':')
            var statpemenang = '';
            // switch(true) {
            //   case item.status_pemenang === 'PESERTA':
            //     statpemenang = '<span class="badge badge-warning space-right">'+item.status_pemenang+'</span>';
            //     break;
            //   default:
            //     statpemenang = '<span class="badge badge-success space-right">'+item.status_pemenang+'</span>';
            // }
            return `<tr>
                <td data-label="#">${num+((props.pageNow-1)*props.itemPerPage)}</td>
                <td data-label="Kode">${item.kode}</td>
                <td data-label="Nama Paket">${(item.tender_label) ? '<span class="badge badge-warning space-right">'+item.tender_label+'</span>': ''}${item.nama_paket}</td>
                <td data-label="Instansi">${item.instansi}</td>
                <td data-label="Tahap">${item.tahap}</td>
                <td data-label="HPS">${item.hps}</td>
                <td data-label="Tanggal Update">${moment(item.modified_date).format('DD MMM YYYY HH:mm')}</td>
                <td data-label="Link"><a href="${item.url_tender_link}/${item.kode}/pengumumanlelang" class="btn btn-b btn-sm smooth" target="_blank" rel="nofollow noopener">Cek Paket</a></td>
                <td data-label="Pemenang">${(item.nama_pemenang?item.nama_pemenang+'<br>'+item.npwp_pemenang:'-')}</td>
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
        </span>
        </div>`;
    } else {
      return (props.message) ? '<div class="row"><message class="danger">'+props.message+'</message></div>' : '';
    }
  }
});

app.render();

// Replace All
String.prototype.replaceAll = function(strReplace, strWith) {
  // See http://stackoverflow.com/a/3561711/556609
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var reg = new RegExp(esc, 'ig');
  return this.replace(reg, strWith);
};

// Search Data
function searchData(value, pagenow, itemperpage, filterby, filter) {
  refresh('Proses loading data...');
  ajax({
    headers: {
        'pbj-api-key': 'ngupas@2020',
        'content-type': 'application/json'
    }
  })
  .post('@{CONF.baseUrl}/tender/datatender', {
    katakunci:value,
    sortby:1,
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

// Set Filter By
function setFilterBy(self) {
  Dom.id('onprogress').innerHTML = '';
  app.data.table = [];
  app.data.message = '';
  app.data.filterby = parseInt(self.value);
  Dom.id('ifilter').style.display = 'none';
  if(app.data.filterby > 0 && (app.data.filterby !== 3 && app.data.filterby !== 2) ) {
    Dom.id('filter').style.display = 'inline';
    _setDataFilter(app.data.filterby);
  } else {
    _clearDataFilter('filter');
    Dom.id('filter').style.display = 'none';
    app.data.filter = '';
    if(app.data.filterby !== 3 && app.data.filterby !== 2) {
      app.data.filterby = '';
    } else {
      if(app.data.filterby === 2) Dom.id('ifilter').placeholder = "Nama Instansi";
      if(app.data.filterby === 3) Dom.id('ifilter').placeholder = "NPWP / Nama Perusahaan";
      Dom.id('ifilter').style.display = 'inline';
    }
  }
}

// Set Filter
function setFilter(self) {
  app.data.filter = self.value;
}

function _clearDataFilter(el) {
  var i, L = Dom.id(el).options.length - 1;
  for(i = L; i >= 0; i--) {
    Dom.id(el).remove(i);
  }
}

function notReady(name) {
  var onprogress = '<div class="row"><message class="danger">Fitur pencarian berdasarkan data '+name+' belum tersedia untuk saat ini!<br>Pencarian akan tetap mencari semua data.</message></div>';
  Dom.id('onprogress').innerHTML = onprogress;
  _clearDataFilter('filter');
  Dom.id('filter').style.display = 'none';
  app.data.filter = '';
}

function _setDataFilter(number) {
  Dom.id('onprogress').innerHTML = '';
  switch(true) {
    case (number === 1) :
      _getDataFilterLPSE();
      break;
    case (number === 2) :
      // Search by input text, doen't need any data from server
      break;
    case (number === 3) :
      // Search by input text, doen't need any data from server
      break;
    case (number === 4) :
      _getDataFilter('tahap');
      break;
    case (number === 5) :
      _getDataFilterKategori();
      break;
    case (number === 6) :
      _getDataFilterHPS();
      break;
    default :
      _clearDataFilter('filter');
      Dom.id('filter').style.display = 'none';
      app.data.filter = '';
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
  .post(url, {filterbytypeid:1})
  .then(function(response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var opt = '<option value="">Semua</option>"';
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

function _getDataFilter(name) {
  _clearDataFilter('filter');
  var url = '@{CONF.baseUrl}/num/'+name;
  ajax({
    headers: {
      'pbj-api-key':'ngupas@2020',
      'content-type':'application/json'
    }
  })
  .post(url, {})
  .then(function(response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var opt = '<option value="">Semua</option>"';
      for (var x=0; x<response.data.length; x++) {
        opt += '<option value="'+response.data[x].tahap+'">'+response.data[x].tahap+'</option>';
      }
      Dom.append(Dom.id('filter'),opt);
    }
  })
  .catch(function(response, xhr){
    console.log(xhr.responseText);
  })
}

function _getDataFilterLPSE() {
  _clearDataFilter('filter');
  var url = '@{CONF.baseUrl}/num/lpse';
  ajax({
    headers: {
      'pbj-api-key':'ngupas@2020',
      'content-type':'application/json'
    }
  })
  .post(url, {})
  .then(function(response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var opt = '<option value="">Semua</option>"';
      for (var x=0; x<response.data.length; x++) {
        opt += '<option value="'+response.data[x].url_tender_id+'">'+response.data[x].url_second_level_domain+'</option>';
      }
      Dom.append(Dom.id('filter'),opt);
    }
  })
  .catch(function(response, xhr){
    console.log(xhr.responseText);
  })
}

function _getDataFilterKategori() {
  _clearDataFilter('filter');
  var url = '@{CONF.baseUrl}/num/kategori';
  ajax({
    headers: {
      'pbj-api-key':'ngupas@2020',
      'content-type':'application/json'
    }
  })
  .post(url, {})
  .then(function(response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var opt = '';
      for (var x=0; x<response.data.length; x++) {
        opt += '<option value="'+response.data[x].kategori_id+'">'+response.data[x].kategori+'</option>';
      }
      Dom.append(Dom.id('filter'),opt);
    }
  })
  .catch(function(response, xhr){
    console.log(xhr.responseText);
  })
}

function _getDataFilterHPS() {
  _clearDataFilter('filter');
  var url = '@{CONF.baseUrl}/num/hps';
  ajax({
    headers: {
      'pbj-api-key':'ngupas@2020',
      'content-type':'application/json'
    }
  })
  .post(url, {})
  .then(function(response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var opt = '';
      for (var x=0; x<response.data.length; x++) {
        opt += '<option value="'+response.data[x].hps_id+'">'+response.data[x].hps+'</option>';
      }
      Dom.append(Dom.id('filter'),opt);
    }
  })
  .catch(function(response, xhr){
    console.log(xhr.responseText);
  })
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
  if (Dom.id('ifilter').style.display === 'inline') {
    app.data.filter = Dom.id('ifilter').value;
  }
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