// Agar support di IE 10, harus di convert ke ES5
"use strict";

function submitCariPenyedia() {
  var e = document.getElementById("searchby");
  var f = document.getElementById("isactive");
  var racord = document.getElementById("searchlpjk");
  ; // console.log(JSON.stringify({ "racord": racord.value, "option": e.value, "isactive": f.value }));
  // refresh data table

  refresh();
  ajax().post('@{CONF.baseUrl}/search/viewdata', {
    "headers": {
      "Content-Type": "application/json"
    },
    "data": {
      "racord": racord.value,
      "option": e.value,
      "isactive": f.value
    }
  }).then(function (response) {
    if (response.status) {
      sbu.data.table = response.data;
    } else {
      if (racord.value === '') {
        sbu.data.message = 'Anda belum input Nama / NPWP Perusahaan!';
      } else {
        sbu.data.message = 'Data tidak ditemukan!';
      }
    }
  })["catch"](function (response, xhr) {
    console.log(xhr.responseText);
  });
}

function refresh() {
  sbu.data.table = [];
  sbu.data.message = '';
} // Reactive UI


var sbu = new Reef('#sbu', {
  data: {
    table: [],
    message: ''
  },
  template: function template(props) {
    if (props.table.length > 0) {
      return "<table class=\"table space-top\">\n                <thead>\n                    <tr>\n                    <th>#</th>\n                    <th>ID BU</th>\n                    <th>ID Status</th>\n                    <th>ID Klasifikasi</th>\n                    <th>Nama</th>\n                    <th>No Urut</th>\n                    <th>Link</th>\n                    </tr>\n                </thead>\n                <tbody>\n                ".concat(props.table.map(function (item, index) {
        return "<tr>\n                        <td data-label=\"#\">".concat(index + 1, "</td>\n                        <td data-label=\"ID BU\">").concat(item.ID_BU, "</td>\n                        <td data-label=\"ID Status\">").concat(item.id_status, "</td>\n                        <td data-label=\"ID Klasifikasi\">").concat(item.id_klasifikasi, "</td>\n                        <td data-label=\"Nama\">").concat(item.nama, "</td>\n                        <td data-label=\"No Urut\">").concat(item.nomor_urut, "</td>\n                        <td data-label=\"Link\"><a href=\"").concat(item.link, "\" class=\"btn btn-b btn-sm smooth\" target=\"_blank\" rel=\"nofollow noopener\">Cek</a></td>\n                    </tr>");
      }).join(''), "\n                </tbody>\n            </table>");
    } else {
      return props.message ? '<div class="row"><message class="danger">' + props.message + '</message></div>' : '';
    }
  }
});
sbu.render();
Dom.id('searchlpjk').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    submitCariPenyedia();
  }
});
