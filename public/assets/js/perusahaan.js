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
      filterby: 7,
      filter: ''
    },
    template: function (props) {
      if(props.table.length > 0) {
        return `<table class="table space-top">
          <thead>
              <tr>
              <th>#</th>
              <th>NPWP</th>
              <th>Nama Perusahan</th>
              <th>Alamat</th>
              <th>Kabupaten</th>
              <th>Kodepos</th>
              <th>Telepon</th>
              <th>Fax</th>
              <th>Email</th>
              <th>Website</th>
              <th>Bentuk Usaha</th>
              <th>Jenis Usaha</th>
              </tr>
          </thead>
          <tbody>
              ${props.table.map(function(item, index) {
              var num = (index+1);
              return `<tr>
                  <td data-label="#">${num+((props.pageNow-1)*props.itemPerPage)}</td>
                  <td data-label="NPWP">${item.npwp}</td>
                  <td data-label="Nama Perusahaan">${(item.nama_peserta) ? item.nama_peserta: '-'}</td>
                  <td data-label="Alamat">${(item.bu_alamat)?item.bu_alamat:'-'}</td>
                  <td data-label="Kabupaten">${(item.bu_kabupaten)?item.bu_kabupaten:'-'}</td>
                  <td data-label="Kodepos">${(item.bu_kodepos)?item.bu_kodepos:'-'}</td>
                  <td data-label="Telepon">${(item.bu_telepon)?item.bu_telepon:'-'}</td>
                  <td data-label="Fax">${(item.bu_fax)?item.bu_fax:'-'}</td>
                  <td data-label="Email">${(item.bu_email)?item.bu_email:'-'}</td>
                  <td data-label="Website">${(item.bu_website)?item.bu_website:'-'}</td>
                  <td data-label="Bentuk Usaha">${(item.bu_bentuk_badan_usaha)?item.bu_bentuk_badan_usaha:'-'}</td>
                  <td data-label="Jenis Usaha">${(item.bu_jenis_badan_usaha)?item.bu_jenis_badan_usaha:'-'}</td>
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
    Dom.id('search').style.display = 'none';
    if(app.data.filterby === 7) {
        Dom.id('ifilter').placeholder = "Input Nama Perusahaan";
        Dom.id('search').style.display = 'inline';
    } else {
        Dom.id('ifilter').placeholder = "Input NPWP";
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