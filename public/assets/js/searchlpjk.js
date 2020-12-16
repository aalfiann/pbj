// Agar support di IE 10, harus di convert ke ES5
"use strict";

function submitCariPenyedia() {
    var e = document.getElementById("searchby");
    var f = document.getElementById("isactive");
    var racord = document.getElementById("searchlpjk");;

    // console.log(JSON.stringify({ "racord": racord.value, "option": e.value, "isactive": f.value }));

    // refresh data table
    refresh();
    ajax().post('@{CONF.baseUrl}/search/viewdata', {
        "headers": {
            "Content-Type": "application/json"
        },
        "data": { "racord": racord.value, "option": e.value, "isactive": f.value },
    }).then(function (response) {
        if (response.status) {
            sbu.data.table = response.data;
        } else {
            if(racord.value === '') {
                sbu.data.message = 'Anda belum input Nama / NPWP Perusahaan!'
            } else {
                sbu.data.message = 'Data tidak ditemukan!'
            }
        }
    }).catch(function(response, xhr) {
        console.log(xhr.responseText);
    });
}

function refresh () {
    sbu.data.table = [];
    sbu.data.message = '';
}

// Reactive UI
var sbu = new Reef('#sbu', {
    data: {
        table: [],
        message: ''
    },
    template: function(props) {
        if(props.table.length > 0) {
            return `<table class="table space-top">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>ID BU</th>
                    <th>ID Status</th>
                    <th>ID Klasifikasi</th>
                    <th>Nama</th>
                    <th>No Urut</th>
                    <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                ${props.table.map(function(item, index) {
                    return `<tr>
                        <td data-label="#">${(index+1)}</td>
                        <td data-label="ID BU">${item.ID_BU}</td>
                        <td data-label="ID Status">${item.id_status}</td>
                        <td data-label="ID Klasifikasi">${item.id_klasifikasi}</td>
                        <td data-label="Nama">${item.nama}</td>
                        <td data-label="No Urut">${item.nomor_urut}</td>
                        <td data-label="Link"><a href="${item.link}" class="btn btn-b btn-sm smooth" target="_blank" rel="nofollow noopener">Cek</a></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>`;

        } else {
            return (props.message) ? '<div class="row"><message class="danger">'+props.message+'</message></div>' : '';
        }
    }
});

sbu.render();

Dom.id('searchlpjk').addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
        submitCariPenyedia();
    }
})