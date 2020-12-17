"use strict"; // Reactive UI

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
      return "<table class=\"table space-top\">\n          <thead>\n              <tr>\n              <th>#</th>\n              <th>NPWP</th>\n              <th>Nama Perusahan</th>\n              <th>Alamat</th>\n              <th>Email</th>\n              <th>Website</th>\n              <th>Bentuk Usaha</th>\n              <th>Jenis Usaha</th>\n              </tr>\n          </thead>\n          <tbody>\n              ".concat(props.table.map(function (item, index) {
        var num = index + 1;
        var readdress = '-';

        if (item.bu_alamat) {
          readdress = item.bu_alamat + '<br>';
          readdress += item.bu_kabupaten + (item.bu_kodepos == 0 ? '<br>' : ' ' + item.bu_kodepos + '<br>');
          readdress += 'Telp: ' + (item.bu_telepon == 0 ? '-' : item.bu_telepon) + '<br>';
          readdress += 'Fax: ' + (item.bu_fax == 0 ? '-' : item.bu_fax);
        }

        return "<tr>\n                  <td data-label=\"#\">".concat(num + (props.pageNow - 1) * props.itemPerPage, "</td>\n                  <td data-label=\"NPWP\">").concat(item.npwp, "</td>\n                  <td data-label=\"Nama Perusahaan\">").concat(item.nama_peserta ? item.nama_peserta : '-', "</td>\n                  <td data-label=\"Alamat\">").concat(readdress, "</td>\n                  <td data-label=\"Email\">").concat(item.bu_email ? item.bu_email : '-', "</td>\n                  <td data-label=\"Website\">").concat(item.bu_website ? item.bu_website : '-', "</td>\n                  <td data-label=\"Bentuk Usaha\">").concat(item.bu_bentuk_badan_usaha ? item.bu_bentuk_badan_usaha : '-', "</td>\n                  <td data-label=\"Jenis Usaha\">").concat(item.bu_jenis_badan_usaha ? item.bu_jenis_badan_usaha : '-', "</td>\n              </tr>");
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
  Dom.id('search').style.display = 'none';

  if (app.data.filterby === 7) {
    Dom.id('ifilter').placeholder = "Input Nama Perusahaan";
    Dom.id('search').style.display = 'inline';
  } else {
    Dom.id('ifilter').placeholder = "Input NPWP";
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
