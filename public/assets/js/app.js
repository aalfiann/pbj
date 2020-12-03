"use strict";

var pageNow = 1;
var totalPage = 0;
var itemPerPage = 25;
var filterBy = 0;
var filter = '';

// Reactive UI
var app = new Reef('#app', {
  data: {
    table: [],
    pageNow: pageNow,
    itemPerPage: itemPerPage,
    totalPage: 0,
    totalRecords: 0,
    message: ''
  },
  template: function (props) {
    if(props.table.length > 0) {
      // generate option for jump page
      var tpage = '';
      for (var i=1;i<=props.totalPage;i++) {
        // if current i same as pagenow then add attribute selected
        tpage += '<option '+(i === pageNow ? 'selected':'')+'>'+i+'</option>';
      }
      return `<table class="table space-top">
        <thead>
            <tr>
            <th>#</th>
            <th>Kode</th>
            <th>Nama Paket</th>
            <th>Instansi</th>
            <th>Tahap</th>
            <th>HPS</th>
            </tr>
        </thead>
        <tbody>
            ${props.table.map(function(item, index) {
            var num = (index+1);
            return `<tr>
                <td data-label="#">${num+((props.pageNow-1)*itemPerPage)}</td>
                <td data-label="Kode">${item.kode}</td>
                <td data-label="Nama Paket">${item.nama_paket}</td>
                <td data-label="Instansi">${item.instansi}</td>
                <td data-label="Tahap">${item.tahap}</td>
                <td data-label="HPS">${item.hps}</td>
            </tr>`;
            }).join('')}
        </tbody>
        </table>
        <div class="row">
        <span class="pull-right" style="margin-top:10px;">Halaman ${props.pageNow} dari ${props.totalPage}</span>
        <span class="pull-left">
            Page 
            <select id="jumpPage" onchange="jumpPage(this)" class="smooth space-left space-right">${tpage}</select>
            <button onclick="prevPage()" class="btn btn-sm smooth space-right"><i class="mdi mdi-arrow-left-bold space-right"></i> Prev</button>
            <button onclick="nextPage()" class="btn btn-sm smooth">Next <i class="mdi mdi-arrow-right-bold space-left"></i></button>
        </span>
        </div>`;
    } else {
      return '<div class="row"><message class="warning">'+props.message+'</message></div>';
    }
  }
});

app.render();

// Search Data
function searchData(value, pagenow, itemperpage) {
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
    filterby:filterBy,
    filter:filter,
    page:pagenow,
    limit:itemperpage
  })
  .then(function (response, xhr) {
    if(response.sts_res === 'true' && response.data.length > 0) {
      var totalrec = parseInt(response.totalrecord);
      var totalpage = Math.ceil(totalrec/itemperpage);
      totalPage = totalpage;
      app.data.table = response.data;
      app.data.pageNow = pagenow;
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
  app.data.pageNow = pageNow;
  app.data.totalPage = 0;
  app.data.totalRecords= 0;
  app.data.message = msg;
}

// Reset Data
function reset() {
  pageNow = 1;
  totalPage = 0;
  refresh('Data tidak ditemukan!');
}

// Next Page
function nextPage() {
  if(pageNow < totalPage) {
    pageNow = pageNow + 1;
    searchData(Dom.id('search').value,pageNow,itemPerPage);
  }
}

// Previous Page
function prevPage() {
  if(pageNow > 1) {
    pageNow = pageNow - 1;
    searchData(Dom.id('search').value,pageNow,itemPerPage);
  }
}

// Set Filter By
function setFilterBy(self) {
  filterBy = parseInt(self.value);
  if(filterBy > 0) {
    Dom.id('filter').style.display = 'inline';
    _setDataFilter(filterBy);
  } else {
    _clearDataFilter();
    Dom.id('filter').style.display = 'none';
    filter = '';
  }
}

// Set Filter
function setFilter(self) {
  filter = self.value;
}

function _clearDataFilter() {
  var select = Dom.id("filter");
  var length = select.options.length;
  for (var i = 0; i < length; i++) {
    select.options[i] = null;
  }
}

function _setDataFilter(number) {
  switch(true) {
    case (number === 1) :
        _getDataFilter('tahap');
        break;
  }
}

function _getDataFilter(name) {
  _clearDataFilter();
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

// Go / Jump to page
function jumpPage(self) {
  pageNow = parseInt(self.value);
  searchData(Dom.id('search').value,pageNow,itemPerPage);
}

// Submit Search
function submitSearch() {
  pageNow = 1;
  searchData(Dom.id('search').value, pageNow, itemPerPage);
}

// Event listener when search box is entered
Dom.id('search').addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    submitSearch();
  }
});

// load data
searchData(Dom.id('search').value,pageNow,itemPerPage);